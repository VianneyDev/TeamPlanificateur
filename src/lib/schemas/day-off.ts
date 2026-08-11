import { z } from "zod";
import { calendarDateSchema } from "@/lib/schemas/calendar-date";

export const DayOffYearSchema = z.coerce.number().int().min(1).max(9999);

export const ToggleDayOffSchema = z
  .object({
    date: calendarDateSchema.optional(),
    from: calendarDateSchema.optional(),
    to: calendarDateSchema.optional(),
    memberId: z.string().min(1).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    const hasDate = value.date !== undefined;
    const hasFrom = value.from !== undefined;
    const hasTo = value.to !== undefined;

    if (hasDate === (hasFrom || hasTo)) {
      ctx.addIssue({
        code: "custom",
        message: "Provide either date or from/to",
        path: hasDate ? ["date"] : ["from"],
      });
    }

    if (!hasDate && !(hasFrom && hasTo)) {
      ctx.addIssue({
        code: "custom",
        message: "Range toggle requires both from and to",
        path: hasFrom ? ["to"] : ["from"],
      });
    }

    if (hasFrom && hasTo && value.from! > value.to!) {
      ctx.addIssue({
        code: "custom",
        message: "from must be on or before to",
        path: ["to"],
      });
    }
  });

export type ToggleDayOffInput = z.infer<typeof ToggleDayOffSchema>;
