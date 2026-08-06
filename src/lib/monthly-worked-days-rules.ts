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
