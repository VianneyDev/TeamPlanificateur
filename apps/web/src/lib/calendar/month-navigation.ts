export type YearMonth = {
  year: number;
  /** 0-based month index (January = 0). */
  month: number;
};

export function currentYearMonth(now = new Date()): YearMonth {
  return { year: now.getFullYear(), month: now.getMonth() };
}

export function shiftMonth(
  { year, month }: YearMonth,
  delta: number,
): YearMonth {
  const absolute = year * 12 + month + delta;
  const nextYear = Math.floor(absolute / 12);
  const nextMonth = ((absolute % 12) + 12) % 12;
  return { year: nextYear, month: nextMonth };
}
