import { ConnectionState, createRxNostr } from "rx-nostr";
import { BehaviorSubject, combineLatest } from "rxjs";
import { unixNow } from "applesauce-core/helpers";
import { nanoid } from "nanoid";

import { logger } from "../helpers/debug";
import verifyEvent from "./verify-event";

import authenticationSigner from "./authentication-signer";
import localSettings from "./local-settings";
import { unique } from "../helpers/array";

const log = logger.extend("rx-nostr");

const rxNostr = createRxNostr({
  verifier: async (event) => {
    try {
      return verifyEvent(event);
    } catch (error) {}
    return false;
  },
  authenticator: { signer: authenticationSigner },
  connectionStrategy: "lazy-keep",
  disconnectTimeout: 120_000,
});

// TODO: remove this when client relays are not longer needed
combineLatest([localSettings.readRelays, localSettings.writeRelays]).subscribe(([read, write]) => {
  const relays = unique([...read, ...write]);

  // update the default relays
  rxNostr.setDefaultRelays(relays.map((url) => ({ url, read: read.includes(url), write: write.includes(url) })));
});

// keep track of all relay connection states
export const connections$ = new BehaviorSubject<Record<string, ConnectionState>>({});
rxNostr.createConnectionStateObservable().subscribe((packet) => {
  // pass to authentication signer so it can cleanup
  authenticationSigner.handleRelayConnectionState(packet);

  const url = new URL(packet.from).toString();
  connections$.next({ ...connections$.value, [url]: packet.state });
  if (import.meta.env.DEV) log(packet.state, url);
});

// capture all notices sent from relays
export const notices$ = new BehaviorSubject<{ id: string; from: string; message: string; timestamp: number }[]>([]);
rxNostr.createAllMessageObservable().subscribe((packet) => {
  if (packet.type === "NOTICE") {
    const from = new URL(packet.from).toString();

    const notice = { id: nanoid(), from, message: packet.notice, timestamp: unixNow() };
    notices$.next([...notices$.value, notice]);
  }
});

if (import.meta.env.DEV) {
  // @ts-expect-error
  window.rxNostr = rxNostr;
}

export default rxNostr;
