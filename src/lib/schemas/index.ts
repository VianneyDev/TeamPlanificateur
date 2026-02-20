import { z } from "zod";
import {
  CreateMemberSchema,
  UpdateMemberSchema,
  PatchMemberSchema,
  MemberStatusSchema,
} from "./member";
import {
  CreateTeamSchema,
  UpdateTeamSchema,
  DeleteTeamSchema,
  TeamArchivedQuerySchema,
} from "./team";

export type CreateMemberInput = z.infer<typeof CreateMemberSchema>;
export type UpdateMemberInput = z.infer<typeof UpdateMemberSchema>;
export type PatchMemberInput = z.infer<typeof PatchMemberSchema>;
export type MemberStatus = z.infer<typeof MemberStatusSchema>;
export type CreateTeamInput = z.infer<typeof CreateTeamSchema>;
export type UpdateTeamInput = z.infer<typeof UpdateTeamSchema>;
export type DeleteTeamInput = z.infer<typeof DeleteTeamSchema>;
export type TeamArchivedQuery = z.infer<typeof TeamArchivedQuerySchema>;
