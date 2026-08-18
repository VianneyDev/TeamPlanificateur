export const MEMBER_REQUIRES_TEAM_CODE = "MEMBER_REQUIRES_TEAM" as const;
export const TEAM_WOULD_ORPHAN_MEMBERS_CODE =
  "TEAM_WOULD_ORPHAN_MEMBERS" as const;

export const MEMBER_REQUIRES_TEAM_ERROR =
  "An active Member must belong to at least one Team";

export const TEAM_WOULD_ORPHAN_MEMBERS_ERROR =
  "Cannot remove this Team: one or more active Members would be left without a Team";
