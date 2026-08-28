import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { Member } from "@/lib/types";
import { generateDailyRecap } from "@/lib/recap";
import {
  CreateMemberSchema,
  MemberExternalQuerySchema,
  MemberStatusSchema,
  PatchMemberSchema,
  UpdateMemberSchema,
} from "@/lib/schemas/member";
import {
  CreateTeamSchema,
  DeleteTeamSchema,
  TeamStatusSchema,
  UpdateTeamSchema,
} from "@/lib/schemas/team";
import { parseListPagination } from "@/lib/schemas/pagination";
import {
  MEMBER_REQUIRES_TEAM_CODE,
  MEMBER_REQUIRES_TEAM_ERROR,
  TEAM_WOULD_ORPHAN_MEMBERS_CODE,
  TEAM_WOULD_ORPHAN_MEMBERS_ERROR,
} from "@/lib/member-team-codes";
import {
  activeMemberHasNonArchivedTeam,
  countActiveTeamsAmong,
  findActiveMembersOrphanedWithoutTeam,
} from "@/lib/member-team-invariant";
import { isManager, resolveActingMember } from "@/lib/api/acting-member";
import {
  UpsertMonthlyWorkedDaysSchema,
  isDaysExceedMonthIssue,
} from "@/lib/schemas/monthly-worked-days";
import { DayOffYearSchema, ToggleDayOffSchema } from "@/lib/schemas/day-off";
import {
  CreateLeaveRequestSchema,
  LeaveRequestListQuerySchema,
} from "@/lib/schemas/leave-request";
import { enumerateWeekdayDates, isWeekendDate } from "@/lib/day-off-range";
import { isFutureMonth } from "@/lib/monthly-worked-days-rules";
import {
  DAYS_EXCEED_MONTH_CODE,
  FUTURE_MONTH_NOT_ALLOWED_CODE,
  FUTURE_MONTH_NOT_ALLOWED_ERROR,
  MEMBER_ARCHIVED_CODE,
  MEMBER_ARCHIVED_ERROR,
  MEMBER_NOT_EXTERNAL_CODE,
  MEMBER_NOT_EXTERNAL_ERROR,
} from "@/lib/monthly-worked-days-codes";
import {
  DAY_OFF_CREATE_FORBIDDEN_CODE,
  DAY_OFF_CREATE_FORBIDDEN_ERROR,
  INVALID_TRANSITION_CODE,
  INVALID_TRANSITION_ERROR,
  MEMBER_ARCHIVED_CODE as LEAVE_MEMBER_ARCHIVED_CODE,
  MEMBER_ARCHIVED_ERROR as LEAVE_MEMBER_ARCHIVED_ERROR,
  WEEKEND_NOT_ALLOWED_CODE,
  WEEKEND_NOT_ALLOWED_ERROR,
} from "@/lib/leave-request-codes";

const listMembersQuerySchema = MemberStatusSchema.optional().transform(
  (status) => status ?? "active",
);

const app = new Hono().basePath("/api");

app.get("/members", async (c) => {
  const statusResult = listMembersQuerySchema.safeParse(c.req.query("status"));
  const externalResult = MemberExternalQuerySchema.safeParse(
    c.req.query("isExternal"),
  );
  const teamId = c.req.query("teamId");
  const paginationResult = parseListPagination({
    page: c.req.query("page"),
    limit: c.req.query("limit"),
  });

  if (!paginationResult.success) {
    return c.json(
      {
        error: "Invalid pagination",
        issues: z.treeifyError(paginationResult.error),
      },
      400,
    );
  }

  const { page, limit } = paginationResult.data;
  const search = c.req.query("search");
  const skip = (page - 1) * limit;

  const searchFilter: Prisma.MemberWhereInput = search
    ? {
        name: {
          contains: search,
          mode: "insensitive",
        },
      }
    : {};

  if (!statusResult.success) {
    return c.json({ error: "Invalid status query parameter" }, 400);
  }

  if (!externalResult.success) {
    return c.json({ error: "Invalid isExternal query parameter" }, 400);
  }

  const status = statusResult.data;
  const isExternal = externalResult.data;
  const archivedFilter =
    status === "active"
      ? { archived: false }
      : status === "archived"
        ? { archived: true }
        : undefined;

  const where: Prisma.MemberWhereInput = {
    ...(teamId && { teams: { some: { id: teamId } } }),
    ...archivedFilter,
    ...searchFilter,
    ...(isExternal !== undefined && { isExternal }),
  };

  const [members, total] = await Promise.all([
    db.member.findMany({
      where,
      include: { teams: true },
      orderBy: [{ name: "asc" }, { archived: "asc" }, { updatedAt: "desc" }],
      skip,
      take: limit,
    }),

    db.member.count({
      where,
    }),
  ]);

  const sorted: Member[] =
    status === "archived"
      ? [...members].sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        )
      : [...members].sort((a, b) => {
          const teamA = a.teams.map((t) => t.name).sort()[0] ?? "";
          const teamB = b.teams.map((t) => t.name).sort()[0] ?? "";
          if (teamA !== teamB) return teamA.localeCompare(teamB);
          if (a.name !== b.name) return a.name.localeCompare(b.name);
          if (a.archived !== b.archived) return a.archived ? 1 : -1;
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        });

  return c.json({
    data: sorted,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});

app.post("/members", zValidator("json", CreateMemberSchema), async (c) => {
  const body = c.req.valid("json");

  const teamIds =
    body.teamIds ??
    (Array.isArray((body as Record<string, unknown>).teamId)
      ? ((body as Record<string, unknown>).teamId as string[])
      : (body as Record<string, unknown>).teamId
        ? [String((body as Record<string, unknown>).teamId)]
        : []);

  const activeTeamCount = await countActiveTeamsAmong(teamIds);
  if (activeTeamCount === 0) {
    return c.json(
      {
        error: MEMBER_REQUIRES_TEAM_ERROR,
        code: MEMBER_REQUIRES_TEAM_CODE,
      },
      400,
    );
  }

  const member = await db.member.create({
    data: {
      name: body.name,
      ...(body.role && { role: body.role }),
      ...(body.isExternal !== undefined && { isExternal: body.isExternal }),
      teams: {
        connect: teamIds.map((id) => ({ id })),
      },
    },
    include: { teams: true },
  });

  return c.json(member, 201);
});

app.put("/members", zValidator("json", UpdateMemberSchema), async (c) => {
  const body = c.req.valid("json");

  if (body.archived === false) {
    const hasTeam = await activeMemberHasNonArchivedTeam(body.id);
    if (!hasTeam) {
      return c.json(
        {
          error: MEMBER_REQUIRES_TEAM_ERROR,
          code: MEMBER_REQUIRES_TEAM_CODE,
        },
        400,
      );
    }
  }

  const member = await db.member.update({
    where: { id: body.id },
    data: {
      ...(body.name && { name: body.name }),
      ...(body.role !== undefined && { role: body.role }),
      ...(body.archived !== undefined && { archived: body.archived }),
    },
  });

  return c.json(member);
});

app.patch("/members/:id", zValidator("json", PatchMemberSchema), async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");

  if (!id) {
    return c.json({ error: "ID is required" }, 400);
  }

  if (body.teamIds !== undefined) {
    const existing = await db.member.findUnique({
      where: { id },
      select: { archived: true },
    });

    if (!existing) {
      return c.json({ error: "Member not found" }, 404);
    }

    if (!existing.archived) {
      const activeTeamCount = await countActiveTeamsAmong(body.teamIds);
      if (activeTeamCount === 0) {
        return c.json(
          {
            error: MEMBER_REQUIRES_TEAM_ERROR,
            code: MEMBER_REQUIRES_TEAM_CODE,
          },
          400,
        );
      }
    }
  }

  const updated = await db.member.update({
    where: { id },
    data: {
      name: body.name,
      role: body.role,
      ...(body.teamIds !== undefined && {
        teams: {
          set: body.teamIds.map((teamId) => ({ id: teamId })),
        },
      }),
    },
    include: { teams: true },
  });

  return c.json(updated);
});

app.post("/members/:id/archive", async (c) => {
  const id = c.req.param("id");

  if (!id) {
    return c.json({ error: "Member ID is required" }, 400);
  }

  await db.member.update({
    where: { id },
    data: { archived: true },
    include: { teams: true },
  });

  return c.json({ success: true });
});

app.get("/teams", async (c) => {
  const statusResult = TeamStatusSchema.optional()
    .transform((s) => s ?? "active")
    .safeParse(c.req.query("status"));

  if (!statusResult.success) {
    return c.json({ error: "Invalid status query parameter" }, 400);
  }

  const status = statusResult.data;
  const paginationResult = parseListPagination({
    page: c.req.query("page"),
    limit: c.req.query("limit"),
  });

  if (!paginationResult.success) {
    return c.json(
      {
        error: "Invalid pagination",
        issues: z.treeifyError(paginationResult.error),
      },
      400,
    );
  }

  const { page, limit } = paginationResult.data;
  const search = c.req.query("search");
  const skip = (page - 1) * limit;

  const searchFilter: Prisma.TeamWhereInput = search
    ? {
        name: {
          contains: search,
          mode: "insensitive",
        },
      }
    : {};

  const archivedFilter: Prisma.TeamWhereInput =
    status === "active"
      ? { archived: false }
      : status === "archived"
        ? { archived: true }
        : {};

  const where: Prisma.TeamWhereInput = {
    ...archivedFilter,
    ...searchFilter,
  };

  const [teams, total] = await Promise.all([
    db.team.findMany({
      where,
      include: {
        _count: {
          select: {
            members: {
              where: { archived: false },
            },
          },
        },
      },
      orderBy: { name: "asc" },
      skip,
      take: limit,
    }),
    db.team.count({ where }),
  ]);

  return c.json({
    data: teams,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});

app.post("/teams", zValidator("json", CreateTeamSchema), async (c) => {
  const body = c.req.valid("json");

  const team = await db.team.create({
    data: { name: body.name },
    include: { members: true },
  });

  return c.json(team, 201);
});

app.put("/teams", zValidator("json", UpdateTeamSchema), async (c) => {
  const body = c.req.valid("json");

  if (body.archived === true) {
    const orphans = await findActiveMembersOrphanedWithoutTeam(body.id);
    if (orphans.length > 0) {
      return c.json(
        {
          error: TEAM_WOULD_ORPHAN_MEMBERS_ERROR,
          code: TEAM_WOULD_ORPHAN_MEMBERS_CODE,
        },
        400,
      );
    }
  }

  const team = await db.team.update({
    where: { id: body.id },
    data: {
      ...(body.name && { name: body.name }),
      ...(body.archived !== undefined && { archived: body.archived }),
    },
    include: { members: true },
  });

  return c.json(team);
});

app.delete("/teams", zValidator("json", DeleteTeamSchema), async (c) => {
  const body = c.req.valid("json");

  const orphans = await findActiveMembersOrphanedWithoutTeam(body.id);
  if (orphans.length > 0) {
    return c.json(
      {
        error: TEAM_WOULD_ORPHAN_MEMBERS_ERROR,
        code: TEAM_WOULD_ORPHAN_MEMBERS_CODE,
      },
      400,
    );
  }

  await db.team.delete({ where: { id: body.id } });

  return c.json({ success: true });
});

app.get("/days-off", async (c) => {
  const acting = await resolveActingMember(c);
  if (!acting || acting.archived) {
    return c.json({ error: "Acting Member required" }, 401);
  }

  const yearResult = DayOffYearSchema.safeParse(c.req.query("year"));
  if (!yearResult.success) {
    return c.json({ error: "Invalid year query parameter" }, 400);
  }

  const year = yearResult.data;
  const start = new Date(
    `${String(year).padStart(4, "0")}-01-01T00:00:00.000Z`,
  );
  const end = new Date(
    `${String(year + 1).padStart(4, "0")}-01-01T00:00:00.000Z`,
  );

  const manager = isManager(acting);
  let memberFilter: Prisma.MemberWhereInput = { archived: false };

  if (!manager) {
    const actingWithTeams = await db.member.findUnique({
      where: { id: acting.id },
      select: {
        teams: {
          where: { archived: false },
          select: { id: true },
        },
      },
    });
    const teamIds = actingWithTeams?.teams.map((team) => team.id) ?? [];

    memberFilter = {
      archived: false,
      OR: [
        { id: acting.id },
        ...(teamIds.length > 0
          ? [{ teams: { some: { id: { in: teamIds } } } }]
          : []),
      ],
    };
  }

  const daysOff = await db.dayOff.findMany({
    where: {
      date: { gte: start, lt: end },
      member: memberFilter,
    },
    include: {
      member: { select: { id: true, name: true } },
    },
    orderBy: [{ date: "asc" }, { memberId: "asc" }],
  });

  const pendingWhere: Prisma.LeaveRequestDateWhereInput = {
    date: { gte: start, lt: end },
    leaveRequest: {
      status: "pending",
      ...(manager
        ? {}
        : {
            memberId: acting.id,
          }),
    },
  };

  const pendingDates = await db.leaveRequestDate.findMany({
    where: pendingWhere,
    include: {
      leaveRequest: {
        select: { id: true, memberId: true },
      },
    },
    orderBy: [{ date: "asc" }],
  });

  const pending = pendingDates.map((entry) => ({
    leaveRequestId: entry.leaveRequest.id,
    memberId: entry.leaveRequest.memberId,
    date: entry.date,
  }));

  return c.json({ data: daysOff, pending });
});

app.put(
  "/days-off/toggle",
  zValidator("json", ToggleDayOffSchema),
  async (c) => {
    const acting = await resolveActingMember(c);
    if (!acting) {
      return c.json({ error: "Acting Member required" }, 401);
    }

    if (acting.archived) {
      return c.json(
        {
          error: "Day Offs cannot be created for an Archived Member",
          code: "MEMBER_ARCHIVED",
        },
        400,
      );
    }

    const body = c.req.valid("json");
    const targetMemberId = body.memberId ?? acting.id;
    const manager = isManager(acting);

    if (targetMemberId !== acting.id && !manager) {
      return c.json({ error: "Forbidden" }, 403);
    }

    const target =
      targetMemberId === acting.id
        ? acting
        : await db.member.findUnique({
            where: { id: targetMemberId },
            select: {
              id: true,
              name: true,
              role: true,
              isExternal: true,
              archived: true,
            },
          });

    if (!target) {
      return c.json({ error: "Member not found" }, 404);
    }

    if (target.archived) {
      return c.json(
        {
          error: "Day Offs cannot be created for an Archived Member",
          code: "MEMBER_ARCHIVED",
        },
        400,
      );
    }

    const submittedDates = body.date ? [body.date] : [body.from!, body.to!];
    if (submittedDates.some((date) => isWeekendDate(date))) {
      return c.json(
        {
          error: "Day Offs cannot include weekend dates",
          code: "WEEKEND_NOT_ALLOWED",
        },
        400,
      );
    }

    if (body.from && body.to) {
      const calendarDates = enumerateWeekdayDates(body.from, body.to);
      const dates = calendarDates.map(
        (calendarDate) => new Date(`${calendarDate}T00:00:00.000Z`),
      );
      const existing = await db.dayOff.findMany({
        where: {
          memberId: target.id,
          date: { in: dates },
        },
      });

      const allActive = existing.length === calendarDates.length;

      if (allActive) {
        await db.dayOff.deleteMany({
          where: {
            memberId: target.id,
            date: { in: dates },
          },
        });
        return c.json({ active: false, dayOffs: [] });
      }

      if (!manager) {
        return c.json(
          {
            error: DAY_OFF_CREATE_FORBIDDEN_ERROR,
            code: DAY_OFF_CREATE_FORBIDDEN_CODE,
          },
          403,
        );
      }

      const existingKeys = new Set(
        existing.map((dayOff) => dayOff.date.toISOString().slice(0, 10)),
      );
      const missing = calendarDates.filter((date) => !existingKeys.has(date));

      if (missing.length > 0) {
        await db.dayOff.createMany({
          data: missing.map((calendarDate) => ({
            memberId: target.id,
            date: new Date(`${calendarDate}T00:00:00.000Z`),
          })),
        });
      }

      const dayOffs = await db.dayOff.findMany({
        where: {
          memberId: target.id,
          date: { in: dates },
        },
        orderBy: { date: "asc" },
      });

      return c.json({ active: true, dayOffs });
    }

    const calendarDate = body.date!;
    const date = new Date(`${calendarDate}T00:00:00.000Z`);
    const existing = await db.dayOff.findUnique({
      where: {
        memberId_date: {
          memberId: target.id,
          date,
        },
      },
    });

    if (existing) {
      await db.dayOff.delete({ where: { id: existing.id } });
      return c.json({ active: false, dayOff: null });
    }

    if (!manager) {
      return c.json(
        {
          error: DAY_OFF_CREATE_FORBIDDEN_ERROR,
          code: DAY_OFF_CREATE_FORBIDDEN_CODE,
        },
        403,
      );
    }

    const dayOff = await db.dayOff.create({
      data: {
        date,
        memberId: target.id,
      },
    });

    return c.json({ active: true, dayOff });
  },
);

app.get("/leave-requests", async (c) => {
  const acting = await resolveActingMember(c);
  if (!acting || acting.archived) {
    return c.json({ error: "Acting Member required" }, 401);
  }

  const queryResult = LeaveRequestListQuerySchema.safeParse({
    status: c.req.query("status") || undefined,
  });
  if (!queryResult.success) {
    return c.json(
      {
        error: "Invalid query",
        issues: z.treeifyError(queryResult.error),
      },
      400,
    );
  }

  const { status } = queryResult.data;
  const manager = isManager(acting);
  const queueForManagers = manager && status === "pending";

  const leaveRequests = await db.leaveRequest.findMany({
    where: queueForManagers
      ? { status: "pending" }
      : {
          memberId: acting.id,
          ...(status ? { status } : {}),
        },
    include: {
      dates: { orderBy: { date: "asc" } },
      member: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return c.json({ data: leaveRequests });
});

app.post(
  "/leave-requests",
  zValidator("json", CreateLeaveRequestSchema),
  async (c) => {
    const acting = await resolveActingMember(c);
    if (!acting) {
      return c.json({ error: "Acting Member required" }, 401);
    }

    if (acting.archived) {
      return c.json(
        {
          error: LEAVE_MEMBER_ARCHIVED_ERROR,
          code: LEAVE_MEMBER_ARCHIVED_CODE,
        },
        400,
      );
    }

    if (isManager(acting)) {
      return c.json({ error: "Forbidden" }, 403);
    }

    const body = c.req.valid("json");

    if (body.dates.some((date) => isWeekendDate(date))) {
      return c.json(
        {
          error: WEEKEND_NOT_ALLOWED_ERROR,
          code: WEEKEND_NOT_ALLOWED_CODE,
        },
        400,
      );
    }

    const sortedDates = [...body.dates].sort();

    const leaveRequest = await db.leaveRequest.create({
      data: {
        memberId: acting.id,
        status: "pending",
        dates: {
          create: sortedDates.map((calendarDate) => ({
            date: new Date(`${calendarDate}T00:00:00.000Z`),
          })),
        },
      },
      include: {
        dates: { orderBy: { date: "asc" } },
      },
    });

    return c.json(leaveRequest, 201);
  },
);

app.post("/leave-requests/:id/withdraw", async (c) => {
  const acting = await resolveActingMember(c);
  if (!acting || acting.archived) {
    return c.json({ error: "Acting Member required" }, 401);
  }

  const id = c.req.param("id");
  const leaveRequest = await db.leaveRequest.findUnique({
    where: { id },
    include: {
      dates: { orderBy: { date: "asc" } },
      member: { select: { id: true, name: true } },
    },
  });

  if (!leaveRequest) {
    return c.json({ error: "Leave Request not found" }, 404);
  }

  if (leaveRequest.memberId !== acting.id) {
    return c.json({ error: "Forbidden" }, 403);
  }

  if (leaveRequest.status !== "pending") {
    return c.json(
      {
        error: INVALID_TRANSITION_ERROR,
        code: INVALID_TRANSITION_CODE,
      },
      409,
    );
  }

  const updated = await db.leaveRequest.update({
    where: { id },
    data: { status: "withdrawn" },
    include: {
      dates: { orderBy: { date: "asc" } },
      member: { select: { id: true, name: true } },
    },
  });

  return c.json(updated);
});

app.post("/leave-requests/:id/approve", async (c) => {
  const acting = await resolveActingMember(c);
  if (!acting || acting.archived) {
    return c.json({ error: "Acting Member required" }, 401);
  }

  if (!isManager(acting)) {
    return c.json({ error: "Forbidden" }, 403);
  }

  const id = c.req.param("id");

  type ApproveOutcome =
    | { kind: "not_found" }
    | { kind: "conflict" }
    | { kind: "archived" }
    | {
        kind: "ok";
        leaveRequest: Awaited<
          ReturnType<typeof db.leaveRequest.findUniqueOrThrow>
        >;
      };

  const outcome = await db.$transaction(async (tx): Promise<ApproveOutcome> => {
    const leaveRequest = await tx.leaveRequest.findUnique({
      where: { id },
      include: {
        dates: { orderBy: { date: "asc" } },
        member: { select: { id: true, name: true, archived: true } },
      },
    });

    if (!leaveRequest) {
      return { kind: "not_found" };
    }

    if (leaveRequest.status !== "pending") {
      return { kind: "conflict" };
    }

    if (leaveRequest.member.archived) {
      return { kind: "archived" };
    }

    const transition = await tx.leaveRequest.updateMany({
      where: { id, status: "pending" },
      data: { status: "approved" },
    });

    if (transition.count === 0) {
      return { kind: "conflict" };
    }

    const existing = await tx.dayOff.findMany({
      where: {
        memberId: leaveRequest.memberId,
        date: { in: leaveRequest.dates.map((entry) => entry.date) },
      },
    });
    const existingKeys = new Set(
      existing.map((dayOff) => dayOff.date.toISOString().slice(0, 10)),
    );
    const missing = leaveRequest.dates.filter(
      (entry) => !existingKeys.has(entry.date.toISOString().slice(0, 10)),
    );

    if (missing.length > 0) {
      await tx.dayOff.createMany({
        data: missing.map((entry) => ({
          memberId: leaveRequest.memberId,
          date: entry.date,
        })),
      });
    }

    const updated = await tx.leaveRequest.findUniqueOrThrow({
      where: { id },
      include: {
        dates: { orderBy: { date: "asc" } },
        member: { select: { id: true, name: true } },
      },
    });

    return { kind: "ok", leaveRequest: updated };
  });

  if (outcome.kind === "not_found") {
    return c.json({ error: "Leave Request not found" }, 404);
  }

  if (outcome.kind === "archived") {
    return c.json(
      {
        error: LEAVE_MEMBER_ARCHIVED_ERROR,
        code: LEAVE_MEMBER_ARCHIVED_CODE,
      },
      400,
    );
  }

  if (outcome.kind === "conflict") {
    return c.json(
      {
        error: INVALID_TRANSITION_ERROR,
        code: INVALID_TRANSITION_CODE,
      },
      409,
    );
  }

  return c.json(outcome.leaveRequest);
});

app.post("/leave-requests/:id/reject", async (c) => {
  const acting = await resolveActingMember(c);
  if (!acting || acting.archived) {
    return c.json({ error: "Acting Member required" }, 401);
  }

  if (!isManager(acting)) {
    return c.json({ error: "Forbidden" }, 403);
  }

  const id = c.req.param("id");
  const leaveRequest = await db.leaveRequest.findUnique({
    where: { id },
    include: {
      dates: { orderBy: { date: "asc" } },
      member: { select: { id: true, name: true } },
    },
  });

  if (!leaveRequest) {
    return c.json({ error: "Leave Request not found" }, 404);
  }

  if (leaveRequest.status !== "pending") {
    return c.json(
      {
        error: INVALID_TRANSITION_ERROR,
        code: INVALID_TRANSITION_CODE,
      },
      409,
    );
  }

  const transition = await db.leaveRequest.updateMany({
    where: { id, status: "pending" },
    data: { status: "rejected" },
  });

  if (transition.count === 0) {
    return c.json(
      {
        error: INVALID_TRANSITION_ERROR,
        code: INVALID_TRANSITION_CODE,
      },
      409,
    );
  }

  const updated = await db.leaveRequest.findUniqueOrThrow({
    where: { id },
    include: {
      dates: { orderBy: { date: "asc" } },
      member: { select: { id: true, name: true } },
    },
  });

  return c.json(updated);
});

app.get("/monthly-worked-days", async (c) => {
  const acting = await resolveActingMember(c);
  if (!acting || acting.archived) {
    return c.json({ error: "Acting Member required" }, 401);
  }

  const memberIdFilter = c.req.query("memberId");
  const manager = isManager(acting);

  if (!manager && !acting.isExternal) {
    return c.json({ error: "Forbidden" }, 403);
  }

  if (memberIdFilter && !manager && memberIdFilter !== acting.id) {
    return c.json({ error: "Forbidden" }, 403);
  }

  const where: Prisma.MonthlyWorkedDaysWhereInput = manager
    ? {
        ...(memberIdFilter && { memberId: memberIdFilter }),
      }
    : { memberId: acting.id };

  const rows = await db.monthlyWorkedDays.findMany({
    where,
    include: {
      member: { select: { id: true, name: true, isExternal: true } },
    },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  return c.json({ data: rows });
});

app.put(
  "/monthly-worked-days",
  zValidator("json", UpsertMonthlyWorkedDaysSchema, (result, c) => {
    if (!result.success) {
      const exceed = result.error.issues.find(isDaysExceedMonthIssue);
      if (exceed) {
        return c.json(
          {
            error: exceed.message,
            code: DAYS_EXCEED_MONTH_CODE,
          },
          400,
        );
      }
      return c.json(
        {
          error: "Invalid body",
          issues: z.treeifyError(result.error),
        },
        400,
      );
    }
  }),
  async (c) => {
    const acting = await resolveActingMember(c);
    if (!acting || acting.archived) {
      return c.json({ error: "Acting Member required" }, 401);
    }

    const body = c.req.valid("json");
    const manager = isManager(acting);

    if (!manager && body.memberId !== acting.id) {
      return c.json({ error: "Forbidden" }, 403);
    }

    if (!manager && !acting.isExternal) {
      return c.json({ error: "Forbidden" }, 403);
    }

    if (isFutureMonth(body.year, body.month)) {
      return c.json(
        {
          error: FUTURE_MONTH_NOT_ALLOWED_ERROR,
          code: FUTURE_MONTH_NOT_ALLOWED_CODE,
        },
        400,
      );
    }

    const target = await db.member.findUnique({
      where: { id: body.memberId },
      select: { id: true, isExternal: true, archived: true },
    });

    if (!target) {
      return c.json({ error: "Member not found" }, 404);
    }

    if (target.archived) {
      return c.json(
        {
          error: MEMBER_ARCHIVED_ERROR,
          code: MEMBER_ARCHIVED_CODE,
        },
        400,
      );
    }

    if (!target.isExternal) {
      return c.json(
        {
          error: MEMBER_NOT_EXTERNAL_ERROR,
          code: MEMBER_NOT_EXTERNAL_CODE,
        },
        400,
      );
    }

    const row = await db.monthlyWorkedDays.upsert({
      where: {
        memberId_year_month: {
          memberId: body.memberId,
          year: body.year,
          month: body.month,
        },
      },
      create: {
        memberId: body.memberId,
        year: body.year,
        month: body.month,
        days: body.days,
      },
      update: {
        days: body.days,
      },
      include: {
        member: { select: { id: true, name: true, isExternal: true } },
      },
    });

    return c.json(row);
  },
);

app.post("/logout", (c) => {
  c.header("Set-Cookie", "selectedMemberId=; Path=/; Max-Age=0");
  return c.redirect("/", 302);
});

app.post("/jobs/daily-recap", async (c) => {
  const recapToken = process.env.RECAP_TOKEN;
  if (!recapToken || c.req.header("x-recap-token") !== recapToken) {
    return c.json({ error: "Forbidden" }, 403);
  }

  const result = await generateDailyRecap();
  return c.json({ ok: true, ...result });
});

export default app;
