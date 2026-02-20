import { z } from "zod";

const roleEnum = z.enum(["member", "manager"]);

export const MemberSchema = z.object({
  name: z.string().min(2, "Minimum 2 caractères"),
  role: roleEnum,
  teamIds: z.array(z.string()).optional(),
});

export const CreateMemberSchema = MemberSchema;

export const UpdateMemberSchema = z.object({
  id: z.string(),
  name: z.string().min(2).optional(),
  role: roleEnum.optional(),
  archived: z.boolean().optional(),
});

export const PatchMemberSchema = z.object({
  name: z.string().min(2, "Minimum 2 caractères"),
  role: roleEnum.optional(),
  teamIds: z.array(z.string()).optional(),
});

export const MemberStatusSchema = z.enum(["active", "archived", "all"]);
