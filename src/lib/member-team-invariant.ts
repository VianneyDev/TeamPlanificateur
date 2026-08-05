import { db } from "@/lib/db";

/** Active Members who only belong to this Team among non-archived Teams. */
export async function findActiveMembersOrphanedWithoutTeam(teamId: string) {
  const members = await db.member.findMany({
    where: {
      archived: false,
      teams: { some: { id: teamId } },
    },
    select: {
      id: true,
      name: true,
      teams: {
        where: {
          archived: false,
          NOT: { id: teamId },
        },
        select: { id: true },
      },
    },
  });

  return members.filter((member) => member.teams.length === 0);
}

export async function countActiveTeamsAmong(teamIds: string[]) {
  if (teamIds.length === 0) return 0;
  return db.team.count({
    where: { id: { in: teamIds }, archived: false },
  });
}

export async function activeMemberHasNonArchivedTeam(memberId: string) {
  const count = await db.team.count({
    where: {
      archived: false,
      members: { some: { id: memberId } },
    },
  });
  return count > 0;
}
