import { useEffect, useState } from "react";

type QueryStateUpdater = string | ((prev: string) => string);

export function useQueryState(key: string, defaultValue: string) {
  const getValue = () => {
    if (typeof window === "undefined") return defaultValue;

    const params = new URLSearchParams(window.location.search);
    return params.get(key) ?? defaultValue;
  };

  const [value, setValue] = useState(getValue);

  const updateValue = (newValue: QueryStateUpdater) => {
    setValue((prev) => {
      const next =
        typeof newValue === "function" ? newValue(prev) : newValue;

      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);

        if (next === defaultValue) {
          params.delete(key);
        } else {
          params.set(key, next);
        }

        const qs = params.toString();
        const newUrl = qs
          ? `${window.location.pathname}?${qs}`
          : window.location.pathname;
        window.history.pushState({}, "", newUrl);
      }

      return next;
    });
  };

  useEffect(() => {
    const handler = () => setValue(getValue());
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  return [value, updateValue] as const;
}
