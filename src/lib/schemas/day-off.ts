import { z } from "zod";

const calendarDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected a calendar date (YYYY-MM-DD)")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
  }, "Invalid calendar date");

export const DayOffYearSchema = z.coerce.number().int().min(1).max(9999);

export const ToggleDayOffSchema = z
  .object({
    date: calendarDateSchema,
  })
  .strict();

export type ToggleDayOffInput = z.infer<typeof ToggleDayOffSchema>;
