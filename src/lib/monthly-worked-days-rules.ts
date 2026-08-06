/** Number of calendar days in the given month (1-12). Single source for the days bound. */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/** True when worked days is an integer in [0, daysInMonth(year, month)]. */
export function isWorkedDaysInRange(
  year: number,
  month: number,
  days: number,
): boolean {
  return (
    Number.isInteger(days) &&
    days >= 0 &&
    days <= daysInMonth(year, month)
  );
}

/** True when (year, month) is strictly after the calendar month of `now`. */
export function isFutureMonth(
  year: number,
  month: number,
  now: Date = new Date(),
): boolean {
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  return year > currentYear || (year === currentYear && month > currentMonth);
}
