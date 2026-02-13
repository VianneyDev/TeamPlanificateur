import type { APIRoute } from "astro";
import { db } from "@/lib/db";

export const prerender = false;

export const PATCH: APIRoute = async ({ params, request }) => {
  const { id } = params;

  if (!id) {
    return new Response(JSON.stringify({ error: "ID is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { name, role, teamIds } = body;

  if (!name) {
    return new Response(JSON.stringify({ error: "Name is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const updated = await db.member.update({
    where: { id },
    data: {
      name,
      role,
      teams: {
        set: teamIds.map((teamId: string) => ({ id: teamId })),
      },
    },
    include: {
      teams: true,
    },
  });

  return new Response(JSON.stringify(updated), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
