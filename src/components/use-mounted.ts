import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * False during server render and the first client render, true afterwards.
 *
 * Portals need a real `document`, so components that portal must wait for the
 * client. useSyncExternalStore is the right primitive here — it reads the
 * server/client distinction directly, without a setState-in-effect round trip.
 */
export function useMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
