import { z } from "zod";

export const UpsertMonthlyWorkedDaysSchema = z.object({
  memberId: z.string().min(1),
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
  days: z.number().int().min(0).max(31),
});
