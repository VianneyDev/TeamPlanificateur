import { z } from "zod";
import { calendarDateSchema } from "@/lib/schemas/calendar-date";

export const LeaveRequestStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected",
  "withdrawn",
]);

export const CreateLeaveRequestSchema = z
  .object({
    dates: z.array(calendarDateSchema).min(1),
  })
  .strict()
  .superRefine((value, ctx) => {
    const unique = new Set(value.dates);
    if (unique.size !== value.dates.length) {
      ctx.addIssue({
        code: "custom",
        message: "dates must be unique",
        path: ["dates"],
      });
    }
  });

export type CreateLeaveRequestInput = z.infer<typeof CreateLeaveRequestSchema>;
export type LeaveRequestStatus = z.infer<typeof LeaveRequestStatusSchema>;
