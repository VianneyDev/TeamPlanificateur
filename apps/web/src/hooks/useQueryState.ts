import { useSyncExternalStore } from "react";

type QueryStateUpdater = string | ((prev: string) => string);

export type QueryStatePatch = {
  key: string;
  value: string;
  defaultValue: string;
};

const listeners = new Set<() => void>();

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  window.addEventListener("popstate", onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("popstate", onStoreChange);
  };
}

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

function readParam(key: string, defaultValue: string): string {
  const params = new URLSearchParams(window.location.search);
  return params.get(key) ?? defaultValue;
}

function writePatches(patches: ReadonlyArray<QueryStatePatch>) {
  const params = new URLSearchParams(window.location.search);

  for (const { key, value, defaultValue } of patches) {
    if (value === defaultValue) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
  }

  const qs = params.toString();
  const newUrl = qs
    ? `${window.location.pathname}?${qs}`
    : window.location.pathname;
  window.history.pushState({}, "", newUrl);
  emit();
}

/** Apply several query-param writes in a single history entry. */
export function applyQueryStates(patches: ReadonlyArray<QueryStatePatch>) {
  writePatches(patches);
}

/**
 * URL search-param state. The query string is the source of truth on the client.
 * `serverSnapshot` (from Astro URL) makes SSR HTML match the request; after hydrate,
 * the client keeps reading `window.location.search`.
 */
export function useQueryState(
  key: string,
  defaultValue: string,
  serverSnapshot: string = defaultValue,
) {
  const value = useSyncExternalStore(
    subscribe,
    () => readParam(key, defaultValue),
    () => serverSnapshot,
  );

  const updateValue = (newValue: QueryStateUpdater) => {
    const prev = readParam(key, defaultValue);
    const next = typeof newValue === "function" ? newValue(prev) : newValue;
    writePatches([{ key, value: next, defaultValue }]);
  };

  return [value, updateValue] as const;
}
