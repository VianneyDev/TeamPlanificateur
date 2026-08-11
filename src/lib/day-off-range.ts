/** Inclusive UTC calendar dates from `from` to `to` (YYYY-MM-DD). */
export function enumerateCalendarDates(from: string, to: string): string[] {
  const dates: string[] = [];
  const cursor = new Date(`${from}T00:00:00.000Z`);
  const end = new Date(`${to}T00:00:00.000Z`);

  while (cursor <= end) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return dates;
}

/** True when `date` (YYYY-MM-DD) falls on Saturday or Sunday in UTC. */
export function isWeekendDate(date: string): boolean {
  const day = new Date(`${date}T00:00:00.000Z`).getUTCDay();
  return day === 0 || day === 6;
}

/**
 * Inclusive UTC weekdays (Mon–Fri) from `from` to `to` (YYYY-MM-DD).
 * Saturday and Sunday are omitted from the expansion.
 */
export function enumerateWeekdayDates(from: string, to: string): string[] {
  return enumerateCalendarDates(from, to).filter((date) => !isWeekendDate(date));
}

/** Normalize two calendar dates into an inclusive ascending range. */
export function orderedCalendarRange(
  a: string,
  b: string,
): { from: string; to: string } {
  return a <= b ? { from: a, to: b } : { from: b, to: a };
}
