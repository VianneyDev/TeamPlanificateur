import { describe, expect, it } from "vitest";
import {
  enumerateCalendarDates,
  enumerateWeekdayDates,
  isWeekendDate,
} from "@/lib/day-off-range";

describe("isWeekendDate", () => {
  it("detects Saturday and Sunday in UTC", () => {
    expect(isWeekendDate("2026-08-08")).toBe(true); // Saturday
    expect(isWeekendDate("2026-08-09")).toBe(true); // Sunday
  });

  it("treats Monday through Friday as weekdays", () => {
    expect(isWeekendDate("2026-08-10")).toBe(false); // Monday
    expect(isWeekendDate("2026-08-14")).toBe(false); // Friday
  });
});

describe("enumerateWeekdayDates", () => {
  it("expands Friday→Tuesday to Friday, Monday, and Tuesday only", () => {
    expect(enumerateWeekdayDates("2026-08-07", "2026-08-11")).toEqual([
      "2026-08-07", // Friday
      "2026-08-10", // Monday
      "2026-08-11", // Tuesday
    ]);
  });

  it("returns an empty list when the range starts on Saturday and ends before Monday", () => {
    expect(enumerateWeekdayDates("2026-08-08", "2026-08-09")).toEqual([]);
  });

  it("skips a Saturday start and continues through following weekdays", () => {
    expect(enumerateWeekdayDates("2026-08-08", "2026-08-11")).toEqual([
      "2026-08-10",
      "2026-08-11",
    ]);
  });

  it("returns an empty list for a range entirely in a weekend", () => {
    expect(enumerateWeekdayDates("2026-08-08", "2026-08-08")).toEqual([]);
    expect(enumerateWeekdayDates("2026-08-09", "2026-08-09")).toEqual([]);
  });

  it("crosses a month boundary while skipping weekends", () => {
    // Friday 2026-07-31 → Monday 2026-08-03
    expect(enumerateWeekdayDates("2026-07-31", "2026-08-03")).toEqual([
      "2026-07-31",
      "2026-08-03",
    ]);
  });

  it("crosses a year boundary while skipping weekends", () => {
    // Wednesday 2025-12-31 → Friday 2026-01-02
    expect(enumerateWeekdayDates("2025-12-31", "2026-01-02")).toEqual([
      "2025-12-31",
      "2026-01-01",
      "2026-01-02",
    ]);
  });

  it("matches weekday filtering of the full calendar enumeration", () => {
    const from = "2026-01-01";
    const to = "2026-01-15";
    const weekdays = enumerateCalendarDates(from, to).filter(
      (date) => !isWeekendDate(date),
    );
    expect(enumerateWeekdayDates(from, to)).toEqual(weekdays);
  });
});
