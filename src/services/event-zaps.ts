import { kinds } from "nostr-tools";
import _throttle from "lodash.throttle";
import { AbstractRelay } from "nostr-tools/abstract-relay";

import SuperMap from "../classes/super-map";
import relayPoolService from "./relay-pool";
import Process from "../classes/process";
import { LightningIcon } from "../components/icons";
import processManager from "./process-manager";
import BatchRelationLoader from "../classes/batch-relation-loader";
import { logger } from "../helpers/debug";
import { getCacheRelay } from "./cache-relay";

class EventZapsService {
  log = logger.extend("EventZapsService");
  process: Process;

  private loaded = new Map<string, boolean>();
  loaders = new SuperMap<AbstractRelay, BatchRelationLoader>((relay) => {
    const loader = new BatchRelationLoader(relay, [kinds.Zap], this.log.extend(relay.url));
    this.process.addChild(loader.process);
    return loader;
  });

  constructor() {
    this.process = new Process("EventZapsService", this);
    this.process.icon = LightningIcon;
    this.process.active = true;

    processManager.registerProcess(this.process);
  }

  requestZaps(uid: string, urls: Iterable<string | URL | AbstractRelay>, alwaysRequest = true) {
    if (this.loaded.get(uid) && !alwaysRequest) return;

    const cacheRelay = getCacheRelay();
    if (cacheRelay) {
      this.loaders.get(cacheRelay as AbstractRelay).requestEvents(uid);
    }

    const relays = relayPoolService.getRelays(urls);
    for (const relay of relays) {
      this.loaders.get(relay).requestEvents(uid);
    }
  }
}

const eventZapsService = new EventZapsService();

if (import.meta.env.DEV) {
  // @ts-expect-error debug
  window.eventZapsService = eventZapsService;
}

export default eventZapsService;
