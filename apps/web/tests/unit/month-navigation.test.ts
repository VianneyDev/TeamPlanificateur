import { describe, expect, it } from "vitest";
import {
  currentYearMonth,
  shiftMonth,
} from "@/lib/calendar/month-navigation";

describe("month navigation", () => {
  it("returns the current calendar month from a given date", () => {
    expect(currentYearMonth(new Date(2026, 7, 15))).toEqual({
      year: 2026,
      month: 7,
    });
  });

  it("moves to the previous month within the same year", () => {
    expect(shiftMonth({ year: 2026, month: 7 }, -1)).toEqual({
      year: 2026,
      month: 6,
    });
  });

  it("moves to the next month within the same year", () => {
    expect(shiftMonth({ year: 2026, month: 7 }, 1)).toEqual({
      year: 2026,
      month: 8,
    });
  });

  it("crosses into the previous year from January", () => {
    expect(shiftMonth({ year: 2026, month: 0 }, -1)).toEqual({
      year: 2025,
      month: 11,
    });
  });

  it("crosses into the next year from December", () => {
    expect(shiftMonth({ year: 2026, month: 11 }, 1)).toEqual({
      year: 2027,
      month: 0,
    });
  });
});
