import { z } from "zod";
import {
  CreateMemberSchema,
  UpdateMemberSchema,
  PatchMemberSchema,
  MemberStatusSchema,
  MemberExternalQuerySchema,
} from "./member";
import {
  CreateTeamSchema,
  UpdateTeamSchema,
  DeleteTeamSchema,
  TeamArchivedQuerySchema,
  TeamStatusSchema,
} from "./team";
import {
  PaginationQuerySchema,
  MAX_LIST_PAGE_SIZE,
  parseListPagination,
} from "./pagination";
import { UpsertMonthlyWorkedDaysSchema } from "./monthly-worked-days";
import { ToggleDayOffSchema } from "./day-off";
import { CreateLeaveRequestSchema } from "./leave-request";

export type CreateMemberInput = z.infer<typeof CreateMemberSchema>;
export type UpdateMemberInput = z.infer<typeof UpdateMemberSchema>;
export type PatchMemberInput = z.infer<typeof PatchMemberSchema>;
export type MemberStatus = z.infer<typeof MemberStatusSchema>;
export type MemberExternalQuery = z.infer<typeof MemberExternalQuerySchema>;
export type CreateTeamInput = z.infer<typeof CreateTeamSchema>;
export type UpdateTeamInput = z.infer<typeof UpdateTeamSchema>;
export type DeleteTeamInput = z.infer<typeof DeleteTeamSchema>;
export type TeamArchivedQuery = z.infer<typeof TeamArchivedQuerySchema>;
export type TeamStatus = z.infer<typeof TeamStatusSchema>;
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
export type ListPagination = z.infer<typeof parseListPagination>;
export type MaxListPageSize = typeof MAX_LIST_PAGE_SIZE;
export type UpsertMonthlyWorkedDaysInput = z.infer<
  typeof UpsertMonthlyWorkedDaysSchema
>;
export type ToggleDayOffInput = z.infer<typeof ToggleDayOffSchema>;
export type CreateLeaveRequestInput = z.infer<typeof CreateLeaveRequestSchema>;
