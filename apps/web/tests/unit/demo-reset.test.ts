import { describe, expect, it } from "vitest";
import { isWeekendDate } from "@/lib/day-off-range";
import { isFutureMonth } from "@/lib/monthly-worked-days-rules";
import { planDemoDataset } from "@/lib/demo-reset";

function utcYmd(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function offsetFrom(now: Date, ymd: string): number {
  const start = Date.parse(`${utcYmd(now)}T00:00:00.000Z`);
  const end = Date.parse(`${ymd}T00:00:00.000Z`);
  return (end - start) / 86_400_000;
}

describe("planDemoDataset", () => {
  it("keeps leave dates relative so March and September resets stay equivalent", () => {
    const march = new Date("2026-03-03T12:00:00.000Z");
    const september = new Date("2026-09-03T12:00:00.000Z");
    const marchPlan = planDemoDataset(march);
    const septemberPlan = planDemoDataset(september);

    expect(marchPlan.teams).toEqual(septemberPlan.teams);
    expect(marchPlan.members).toEqual(septemberPlan.members);
    expect(marchPlan.leaveRequests.map((request) => request.status)).toEqual(
      septemberPlan.leaveRequests.map((request) => request.status),
    );
    expect(marchPlan.leaveRequests).toHaveLength(septemberPlan.leaveRequests.length);
    expect(marchPlan.daysOff).toHaveLength(septemberPlan.daysOff.length);
    expect(marchPlan.monthlyWorkedDays).toHaveLength(
      septemberPlan.monthlyWorkedDays.length,
    );

    const marchPending = marchPlan.leaveRequests.find(
      (request) => request.status === "pending",
    );
    const septemberPending = septemberPlan.leaveRequests.find(
      (request) => request.status === "pending",
    );
    expect(marchPending).toBeDefined();
    expect(septemberPending).toBeDefined();

    const marchToday = utcYmd(march);
    const septemberToday = utcYmd(september);
    for (const date of marchPending!.dates) {
      expect(date > marchToday).toBe(true);
      expect(isWeekendDate(date)).toBe(false);
    }
    for (const date of septemberPending!.dates) {
      expect(date > septemberToday).toBe(true);
      expect(isWeekendDate(date)).toBe(false);
    }

    expect(offsetFrom(march, marchPending!.dates[0]!)).toBe(
      offsetFrom(september, septemberPending!.dates[0]!),
    );
  });

  it("never plans Monthly Worked Days in a future month", () => {
    const now = new Date("2026-01-15T12:00:00.000Z");
    const plan = planDemoDataset(now);
    expect(plan.monthlyWorkedDays.length).toBeGreaterThan(0);
    for (const entry of plan.monthlyWorkedDays) {
      expect(isFutureMonth(entry.year, entry.month, now)).toBe(false);
    }
  });
});
