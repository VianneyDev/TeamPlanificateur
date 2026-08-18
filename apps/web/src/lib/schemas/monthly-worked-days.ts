import { z } from "zod";
import { daysInMonth } from "@/lib/monthly-worked-days-rules";
import {
  DAYS_EXCEED_MONTH_CODE,
  daysExceedMonthError,
} from "@/lib/monthly-worked-days-codes";

export const UpsertMonthlyWorkedDaysSchema = z
  .object({
    memberId: z.string().min(1),
    year: z.number().int().min(2000).max(2100),
    month: z.number().int().min(1).max(12),
    days: z.number().int().min(0),
  })
  .superRefine((data, ctx) => {
    const maxDays = daysInMonth(data.year, data.month);
    if (data.days > maxDays) {
      ctx.addIssue({
        code: "custom",
        path: ["days"],
        message: daysExceedMonthError(maxDays),
        params: { code: DAYS_EXCEED_MONTH_CODE, maxDays },
      });
    }
  });

/** True when a Zod issue is the calendar-days bound failure. */
export function isDaysExceedMonthIssue(issue: {
  code: string;
  params?: unknown;
}): boolean {
  if (issue.code !== "custom") return false;
  const params = issue.params;
  return (
    typeof params === "object" &&
    params !== null &&
    "code" in params &&
    (params as { code?: unknown }).code === DAYS_EXCEED_MONTH_CODE
  );
}
