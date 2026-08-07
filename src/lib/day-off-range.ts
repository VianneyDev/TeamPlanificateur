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

/** Normalize two calendar dates into an inclusive ascending range. */
export function orderedCalendarRange(
  a: string,
  b: string,
): { from: string; to: string } {
  return a <= b ? { from: a, to: b } : { from: b, to: a };
}
