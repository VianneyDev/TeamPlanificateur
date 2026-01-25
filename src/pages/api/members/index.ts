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

  const { name, teamId, role } = body;

  if (!name || !teamId) {
    return new Response(
      JSON.stringify({ error: "Name and teamId are required" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const member = await db.member.create({
    data: {
      name,
      teamId,
      ...(role && { role }),
    },
  });

  return new Response(JSON.stringify(member), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
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
