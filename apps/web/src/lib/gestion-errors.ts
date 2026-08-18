import {
  MEMBER_REQUIRES_TEAM_CODE,
  TEAM_WOULD_ORPHAN_MEMBERS_CODE,
} from "@/lib/member-team-codes";
import { ApiError } from "@/lib/api/errors";

/** French Gestion copy for known domain rejection codes. */
export function gestionErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof ApiError) || !error.code) {
    return fallback;
  }

  switch (error.code) {
    case MEMBER_REQUIRES_TEAM_CODE:
      return "Un membre actif doit appartenir à au moins une équipe.";
    case TEAM_WOULD_ORPHAN_MEMBERS_CODE:
      return "Impossible : des membres actifs n’auraient plus d’équipe.";
    default:
      return fallback;
  }
}
