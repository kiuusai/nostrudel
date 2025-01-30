import { kinds } from "nostr-tools";

import { RECOMMENDED_READ_RELAYS } from "../const";
import useTimelineLoader from "./use-timeline-loader";

export default function useNip05Providers() {
  const { timeline } = useTimelineLoader("nip05-providers", RECOMMENDED_READ_RELAYS, {
    kinds: [kinds.Handlerinformation],
    "#k": [String(kinds.NostrConnect)],
  });

  return timeline;
}
