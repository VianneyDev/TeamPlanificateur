import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { Member } from "@/lib/types";
import {
  CreateMemberSchema,
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

const listMembersQuerySchema = MemberStatusSchema.optional().transform(
  (status) => status ?? "active",
);

const app = new Hono().basePath("/api");

app.get("/members", async (c) => {
  const statusResult = listMembersQuerySchema.safeParse(c.req.query("status"));
  const teamId = c.req.query("teamId");

  const page = Number(c.req.query("page") ?? 1);
  const limit = Number(c.req.query("limit") ?? 10);
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

  const status = statusResult.data;
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

  if (teamIds.length === 0) {
    return c.json({ error: "Name and at least one team are required" }, 400);
  }

  const member = await db.member.create({
    data: {
      name: body.name,
      ...(body.role && { role: body.role }),
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

  const updated = await db.member.update({
    where: { id },
    data: {
      name: body.name,
      role: body.role,
      ...(body.teamIds && {
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
  const where =
    status === "active"
      ? { archived: false }
      : status === "archived"
        ? { archived: true }
        : undefined;

  const teams = await db.team.findMany({
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
  });

  return c.json(teams);
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

  await db.team.delete({ where: { id: body.id } });

  return c.json({ success: true });
});

app.post("/logout", (c) => {
  c.header("Set-Cookie", "selectedMemberId=; Path=/; Max-Age=0");
  return c.redirect("/", 302);
});

export default app;
