import { NostrEvent } from "nostr-tools";
import { AbstractRelay } from "nostr-tools/abstract-relay";
import { EventStore } from "applesauce-core";
import { BehaviorSubject } from "rxjs";

import { WIKI_PAGE_KIND } from "../helpers/nostr/wiki";
import { logger } from "../helpers/debug";
import SuperMap from "../classes/super-map";
import BatchIdentifierLoader from "../classes/batch-identifier-loader";
import relayPoolService from "./relay-pool";
import { eventStore } from "./event-store";
import { getCacheRelay } from "./cache-relay";

class DictionaryService {
  log = logger.extend("DictionaryService");
  store: EventStore;

  topics = new SuperMap<string, BehaviorSubject<Map<string, NostrEvent>>>(
    () => new BehaviorSubject<Map<string, NostrEvent>>(new Map()),
  );

  loaders = new SuperMap<AbstractRelay, BatchIdentifierLoader>((relay) => {
    const loader = new BatchIdentifierLoader(this.store, relay, [WIKI_PAGE_KIND], this.log.extend(relay.url));
    loader.onIdentifierUpdate.subscribe((identifier) => {
      this.updateSubject(identifier);
    });
    return loader;
  });

  constructor(store: EventStore) {
    this.store = store;
  }

  // merged results from all loaders for a single event
  private updateSubject(identifier: string) {
    const events = new Map<string, NostrEvent>();
    const subject = this.topics.get(identifier);

    for (const [relay, loader] of this.loaders) {
      if (loader.identifiers.has(identifier)) {
        const other = loader.identifiers.get(identifier);
        for (const [uid, e] of other) {
          if (e.content.trim().length === 0) continue;
          const existing = events.get(uid);
          if (!existing || e.created_at > existing.created_at) events.set(uid, e);
        }
      }
    }

    subject.next(events);
  }

  getTopic(topic: string) {
    return this.topics.get(topic);
  }

  requestTopic(topic: string, urls: Iterable<string | URL | AbstractRelay>, alwaysRequest = true) {
    const subject = this.topics.get(topic);
    if (subject.value && !alwaysRequest) return subject;

    const cacheRelay = getCacheRelay();
    if (cacheRelay) {
      this.loaders.get(cacheRelay as AbstractRelay).requestEvents(topic);
    }

    const relays = relayPoolService.getRelays(urls);
    for (const relay of relays) {
      this.loaders.get(relay).requestEvents(topic);
    }

    return subject;
  }

  handleEvent(event: NostrEvent) {
    event = this.store.add(event);

    const cacheRelay = getCacheRelay();
    // pretend it came from the local relay
    // TODO: remove this once DictionaryService uses subscriptions from event store
    if (cacheRelay) this.loaders.get(cacheRelay as AbstractRelay).handleEvent(event);
  }
}

const dictionaryService = new DictionaryService(eventStore);

if (import.meta.env.DEV) {
  // @ts-expect-error debug
  window.dictionaryService = dictionaryService;
}

export default dictionaryService;
