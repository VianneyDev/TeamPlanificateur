import { z } from "zod";

export const TeamArchivedQuerySchema = z.enum(["true", "false"]).optional();

export const CreateTeamSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export const UpdateTeamSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  archived: z.boolean().optional(),
});

export const DeleteTeamSchema = z.object({
  id: z.string(),
});
