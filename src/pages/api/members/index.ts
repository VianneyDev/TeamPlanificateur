import type { APIRoute } from "astro";
import { db } from "@/lib/db";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const teamId = url.searchParams.get("teamId");

  const members = await db.member.findMany({
    where: {
      ...(teamId && { teamId }),
      archived: false,
    },
    include: {
      team: true,
    },
    orderBy: { name: "asc" },
  });

  return new Response(JSON.stringify(members), {
    headers: { "Content-Type": "application/json" },
  });
};

export const POST: APIRoute = async ({ request }) => {
  let body;

  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { name, role } = body;
  const teamIds = Array.isArray(body.teamIds)
    ? body.teamIds
    : Array.isArray(body.teamId)
      ? body.teamId
      : body.teamId
        ? [body.teamId]
        : [];

  if (!name || teamIds.length === 0) {
    return new Response(
      JSON.stringify({ error: "Name and at least one team are required" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const members = await Promise.all(
    teamIds.map((teamId: string) =>
      db.member.create({
        data: {
          name,
          teamId,
          ...(role && { role }),
        },
        include: {
          team: true,
        },
      })
    )
  );

  return new Response(
    JSON.stringify(members.length === 1 ? members[0] : members),
    {
      status: 201,
      headers: { "Content-Type": "application/json" },
    }
  );
};

export const PUT: APIRoute = async ({ request }) => {
  let body;

  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { id, name, role, archived } = body;

  if (!id) {
    return new Response(JSON.stringify({ error: "ID is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const member = await db.member.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(role !== undefined && { role }),
      ...(archived !== undefined && { archived }),
    },
  });

  return new Response(JSON.stringify(member), {
    headers: { "Content-Type": "application/json" },
  });
};
