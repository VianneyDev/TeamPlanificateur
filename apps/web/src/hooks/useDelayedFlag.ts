import { useEffect, useState } from "react";

/** True only after `active` stayed true for `delayMs`; false as soon as `active` is false. */
export function useDelayedFlag(active: boolean, delayMs: number): boolean {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!active) {
      setShown(false);
      return;
    }
    const id = setTimeout(() => setShown(true), delayMs);
    return () => clearTimeout(id);
  }, [active, delayMs]);

  return shown;
}
