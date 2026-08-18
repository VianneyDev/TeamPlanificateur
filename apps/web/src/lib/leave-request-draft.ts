/**
 * Merge weekday keys into a Leave Request draft selection.
 * Days already fully selected are removed (toggle off); otherwise they are added.
 */
export function mergeDraftWeekdays(
  current: readonly string[],
  weekdays: readonly string[],
): string[] {
  if (weekdays.length === 0) return [...current].sort();

  const next = new Set(current);
  const allAlreadySelected = weekdays.every((date) => next.has(date));

  if (allAlreadySelected) {
    for (const date of weekdays) {
      next.delete(date);
    }
  } else {
    for (const date of weekdays) {
      next.add(date);
    }
  }

  return [...next].sort();
}
