import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { Member } from "@/lib/types";
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
import {
  isManager,
  resolveActingMember,
} from "@/lib/api/acting-member";
import { UpsertMonthlyWorkedDaysSchema } from "@/lib/schemas/monthly-worked-days";
import { isFutureMonth } from "@/lib/monthly-worked-days-rules";
import {
  FUTURE_MONTH_NOT_ALLOWED_CODE,
  FUTURE_MONTH_NOT_ALLOWED_ERROR,
  MEMBER_ARCHIVED_CODE,
  MEMBER_ARCHIVED_ERROR,
  MEMBER_NOT_EXTERNAL_CODE,
  MEMBER_NOT_EXTERNAL_ERROR,
} from "@/lib/monthly-worked-days-codes";

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
  zValidator("json", UpsertMonthlyWorkedDaysSchema),
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

export default app;
