import { generateSecretKey } from "nostr-tools";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils";

import { DEFAULT_SIGNAL_RELAYS } from "../const";
import {
  BooleanLocalStorageEntry,
  NullableNumberLocalStorageEntry,
  NumberLocalStorageEntry,
} from "../classes/local-settings/types";
import { LocalStorageEntry } from "../classes/local-settings/entry";
import { nanoid } from "nanoid";

// local relay
const idbMaxEvents = new NumberLocalStorageEntry("nostr-idb-max-events", 10_000);
const wasmPersistForDays = new NullableNumberLocalStorageEntry("wasm-relay-oldest-event", 365);

// note behavior
const enableNoteThreadDrawer = new LocalStorageEntry(
  "enable-note-thread-drawer",
  false,
  (raw) => raw === "true",
  (v) => String(v),
);

const hideZapBubbles = new BooleanLocalStorageEntry("hide-zap-bubbles", false);

// webrtc relay
const webRtcLocalIdentity = new LocalStorageEntry(
  "nostr-webrtc-identity",
  generateSecretKey(),
  (raw) => hexToBytes(raw),
  (key) => bytesToHex(key),
  true,
);
const webRtcSignalingRelays = new LocalStorageEntry(
  "nostr-webrtc-signaling-relays",
  DEFAULT_SIGNAL_RELAYS,
  (raw) => raw.split(",").filter((u) => !!u),
  (value) => value.join(","),
);
const webRtcRecentConnections = new LocalStorageEntry(
  "nostr-webrtc-recent-connections",
  [],
  (raw) => raw.split(",").filter((u) => !!u),
  (value) => value.join(","),
);

// posting
const addClientTag = new BooleanLocalStorageEntry("add-client-tag", false);

// performance
const verifyEventMethod = new LocalStorageEntry("verify-event-method", "wasm"); // wasm, internal, none
const enableKeyboardShortcuts = new BooleanLocalStorageEntry("enable-keyboard-shortcuts", true);

// privacy
const defaultAuthenticationMode = new LocalStorageEntry("default-relay-auth-mode", "ask"); // ask, always, never
const proactivelyAuthenticate = new BooleanLocalStorageEntry("proactively-authenticate", false);
const debugApi = new BooleanLocalStorageEntry("debug-api", false);

// notifications
const deviceId = new LocalStorageEntry("device-id", nanoid());

const ntfyTopic = new LocalStorageEntry("ntfy-topic", nanoid());
const ntfyServer = new LocalStorageEntry("ntfy-server", "https://ntfy.sh");

// cache relay
const cacheRelayURL = new LocalStorageEntry("cache-relay-url", "");

// bakery
const bakeryURL = new LocalStorageEntry<string>("bakery-url", "");

const localSettings = {
  idbMaxEvents,
  wasmPersistForDays,
  enableNoteThreadDrawer,
  hideZapBubbles,
  webRtcLocalIdentity,
  webRtcSignalingRelays,
  webRtcRecentConnections,
  addClientTag,
  verifyEventMethod,
  enableKeyboardShortcuts,
  defaultAuthenticationMode,
  proactivelyAuthenticate,
  debugApi,
  deviceId,
  ntfyTopic,
  ntfyServer,
  bakeryURL,
  cacheRelayURL,
};

if (import.meta.env.DEV) {
  // @ts-expect-error debug
  window.localSettings = localSettings;
}

export default localSettings;
