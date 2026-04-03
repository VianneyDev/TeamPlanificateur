import { useCallback, useEffect, useRef, useState } from "react";

export function useDebounce<T>(
  value: T,
  delayMs: number,
): readonly [debounced: T, flush: () => void] {
  const [debounced, setDebounced] = useState(value);
  const valueRef = useRef(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  valueRef.current = value;

  const flush = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setDebounced(valueRef.current);
  }, []);

  useEffect(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      setDebounced(valueRef.current);
    }, delayMs);
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [value, delayMs]);

  return [debounced, flush] as const;
}
