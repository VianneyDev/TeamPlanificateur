import type { Prisma } from "@prisma/client";
import { isWeekendDate } from "@/lib/day-off-range";
import { isFutureMonth } from "@/lib/monthly-worked-days-rules";
import type { LeaveRequestStatus } from "@/lib/schemas/leave-request";

export type DemoResetCounts = {
  teams: number;
  members: number;
  leaveRequests: number;
  leaveRequestDates: number;
  daysOff: number;
  monthlyWorkedDays: number;
};

type DemoPlan = {
  teams: { name: string; archived: boolean }[];
  members: {
    name: string;
    role: "member" | "manager";
    isExternal: boolean;
    archived: boolean;
    teamNames: string[];
  }[];
  leaveRequests: {
    memberName: string;
    status: LeaveRequestStatus;
    dates: string[];
  }[];
  daysOff: { memberName: string; date: string }[];
  monthlyWorkedDays: {
    memberName: string;
    year: number;
    month: number;
    days: number;
  }[];
};

const TEAM_DEV = "Équipe Développement";
const TEAM_DESIGN = "Équipe Design";
const TEAM_MARKETING = "Équipe Marketing";
const TEAM_SUPPORT = "Équipe Support";
const TEAM_ARCHIVE = "Équipe Archive";

function utcYmd(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addUtcDays(ymd: string, days: number): string {
  const date = new Date(`${ymd}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function takeWeekdays(startYmd: string, count: number): string[] {
  const dates: string[] = [];
  let cursor = startYmd;
  while (dates.length < count) {
    if (!isWeekendDate(cursor)) {
      dates.push(cursor);
    }
    cursor = addUtcDays(cursor, 1);
  }
  return dates;
}

function toUtcDate(ymd: string): Date {
  return new Date(`${ymd}T00:00:00.000Z`);
}

function requireId(ids: Map<string, string>, name: string): string {
  const id = ids.get(name);
  if (!id) {
    throw new Error(`Demo dataset is missing ${name}`);
  }
  return id;
}

function monthAtOffset(
  now: Date,
  offset: number,
): { year: number; month: number } {
  const date = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

export function planDemoDataset(now: Date): DemoPlan {
  const today = utcYmd(now);
  const pendingDates = takeWeekdays(addUtcDays(today, 14), 3);
  const approvedDates = takeWeekdays(addUtcDays(today, -21), 2);
  const rejectedDates = takeWeekdays(addUtcDays(today, -10), 1);
  const withdrawnDates = takeWeekdays(addUtcDays(today, -7), 1);
  const dianaDates = takeWeekdays(addUtcDays(today, -5), 2);
  const julesDates = takeWeekdays(addUtcDays(today, 7), 1);
  const inesDates = takeWeekdays(addUtcDays(today, 3), 2);
  const charlieDates = takeWeekdays(addUtcDays(today, -3), 1);

  const workedMonths = [0, -1, -2]
    .map((offset) => monthAtOffset(now, offset))
    .filter((entry) => !isFutureMonth(entry.year, entry.month, now));

  const externals = [
    "Diana Leroy",
    "Eve Moreau",
    "Karim Benali",
    "Léa Rousseau",
  ];
  const monthlyDays = [18, 16, 20];

  return {
    teams: [
      { name: TEAM_DEV, archived: false },
      { name: TEAM_DESIGN, archived: false },
      { name: TEAM_MARKETING, archived: false },
      { name: TEAM_SUPPORT, archived: false },
      { name: TEAM_ARCHIVE, archived: true },
    ],
    members: [
      {
        name: "Alice Martin",
        role: "member",
        isExternal: false,
        archived: false,
        teamNames: [TEAM_DEV],
      },
      {
        name: "Bob Dupont",
        role: "member",
        isExternal: false,
        archived: false,
        teamNames: [TEAM_DEV],
      },
      {
        name: "Charlie Bernard",
        role: "manager",
        isExternal: false,
        archived: false,
        teamNames: [TEAM_DEV],
      },
      {
        name: "Diana Leroy",
        role: "member",
        isExternal: true,
        archived: false,
        teamNames: [TEAM_DESIGN],
      },
      {
        name: "Eve Moreau",
        role: "member",
        isExternal: true,
        archived: false,
        teamNames: [TEAM_DESIGN],
      },
      {
        name: "Frank Petit",
        role: "manager",
        isExternal: false,
        archived: false,
        teamNames: [TEAM_DESIGN],
      },
      {
        name: "Grace Dubois",
        role: "member",
        isExternal: false,
        archived: false,
        teamNames: [TEAM_MARKETING],
      },
      {
        name: "Hugo Lambert",
        role: "member",
        isExternal: false,
        archived: false,
        teamNames: [TEAM_MARKETING],
      },
      {
        name: "Inès Morel",
        role: "member",
        isExternal: false,
        archived: false,
        teamNames: [TEAM_SUPPORT],
      },
      {
        name: "Jules Garnier",
        role: "member",
        isExternal: false,
        archived: false,
        teamNames: [TEAM_DEV, TEAM_SUPPORT],
      },
      {
        name: "Karim Benali",
        role: "member",
        isExternal: true,
        archived: false,
        teamNames: [TEAM_SUPPORT],
      },
      {
        name: "Léa Rousseau",
        role: "member",
        isExternal: true,
        archived: false,
        teamNames: [TEAM_MARKETING],
      },
      {
        name: "Nina Caron",
        role: "member",
        isExternal: false,
        archived: true,
        teamNames: [TEAM_DEV],
      },
    ],
    leaveRequests: [
      { memberName: "Alice Martin", status: "pending", dates: pendingDates },
      { memberName: "Bob Dupont", status: "approved", dates: approvedDates },
      { memberName: "Grace Dubois", status: "rejected", dates: rejectedDates },
      {
        memberName: "Hugo Lambert",
        status: "withdrawn",
        dates: withdrawnDates,
      },
    ],
    daysOff: [
      ...approvedDates.map((date) => ({ memberName: "Bob Dupont", date })),
      ...dianaDates.map((date) => ({ memberName: "Diana Leroy", date })),
      ...julesDates.map((date) => ({ memberName: "Jules Garnier", date })),
      ...inesDates.map((date) => ({ memberName: "Inès Morel", date })),
      ...charlieDates.map((date) => ({ memberName: "Charlie Bernard", date })),
    ],
    monthlyWorkedDays: externals.flatMap((memberName, memberIndex) =>
      workedMonths.map((entry, monthIndex) => ({
        memberName,
        year: entry.year,
        month: entry.month,
        days: monthlyDays[(memberIndex + monthIndex) % monthlyDays.length],
      })),
    ),
  };
}

/** FK-safe wipe: children first, then Members, then Teams (join rows follow). */
async function wipeApplicationData(tx: Prisma.TransactionClient) {
  await tx.leaveRequestDate.deleteMany();
  await tx.leaveRequest.deleteMany();
  await tx.dayOff.deleteMany();
  await tx.monthlyWorkedDays.deleteMany();
  await tx.member.deleteMany();
  await tx.team.deleteMany();
}

export async function populateDemoDataset(
  tx: Prisma.TransactionClient,
  now = new Date(),
): Promise<DemoResetCounts> {
  const plan = planDemoDataset(now);
  const teamIds = new Map<string, string>();
  const memberIds = new Map<string, string>();

  for (const team of plan.teams) {
    const created = await tx.team.create({
      data: { name: team.name, archived: team.archived },
    });
    teamIds.set(team.name, created.id);
  }

  for (const member of plan.members) {
    const created = await tx.member.create({
      data: {
        name: member.name,
        role: member.role,
        isExternal: member.isExternal,
        archived: member.archived,
        teams: {
          connect: member.teamNames.map((name) => ({
            id: requireId(teamIds, name),
          })),
        },
      },
    });
    memberIds.set(member.name, created.id);
  }

  let leaveRequestDates = 0;
  for (const request of plan.leaveRequests) {
    await tx.leaveRequest.create({
      data: {
        memberId: requireId(memberIds, request.memberName),
        status: request.status,
        dates: {
          create: request.dates.map((date) => ({ date: toUtcDate(date) })),
        },
      },
    });
    leaveRequestDates += request.dates.length;
  }

  if (plan.daysOff.length > 0) {
    await tx.dayOff.createMany({
      data: plan.daysOff.map((entry) => ({
        memberId: requireId(memberIds, entry.memberName),
        date: toUtcDate(entry.date),
      })),
    });
  }

  if (plan.monthlyWorkedDays.length > 0) {
    await tx.monthlyWorkedDays.createMany({
      data: plan.monthlyWorkedDays.map((entry) => ({
        memberId: requireId(memberIds, entry.memberName),
        year: entry.year,
        month: entry.month,
        days: entry.days,
      })),
    });
  }

  return {
    teams: plan.teams.length,
    members: plan.members.length,
    leaveRequests: plan.leaveRequests.length,
    leaveRequestDates,
    daysOff: plan.daysOff.length,
    monthlyWorkedDays: plan.monthlyWorkedDays.length,
  };
}

export async function resetDemoDataset(
  now = new Date(),
): Promise<DemoResetCounts> {
  const { db } = await import("@/lib/db");
  return db.$transaction(
    async (tx) => {
      await wipeApplicationData(tx);
      return populateDemoDataset(tx, now);
    },
    { timeout: 30_000 },
  );
}
