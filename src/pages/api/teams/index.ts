import type { APIRoute } from "astro";
import { db } from "@/lib/db";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const includeArchived = url.searchParams.get("archived") === "true";

  const teams = await db.team.findMany({
    where: includeArchived ? {} : { archived: false },
    include: { members: true },
    orderBy: { name: "asc" },
  });

  return new Response(JSON.stringify(teams), {
    headers: { "Content-Type": "application/json" },
  });
};

export const POST: APIRoute = async ({ request }) => {
   let body;

   try {
      body= await request.json();
   } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
         status: 400,
         headers: { "Content-Type": "application/json" },
      });   
   }

  const { name } = body;

  if (!name) {
    return new Response(JSON.stringify({ error: "Name is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const team = await db.team.create({
    data: { name },
    include: { members: true },
  });

  return new Response(JSON.stringify(team), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};

export const PUT: APIRoute = async ({ request }) => {
  const { id, name, archived } = await request.json();

  if (!id) {
    return new Response(JSON.stringify({ error: "ID is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const team = await db.team.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(archived !== undefined && { archived }),
    },
    include: { members: true },
  });

  return new Response(JSON.stringify(team), {
    headers: { "Content-Type": "application/json" },
  });
};

export const DELETE: APIRoute = async ({ request }) => {
  const { id } = await request.json();

  if (!id) {
    return new Response(JSON.stringify({ error: "ID is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  await db.team.delete({ where: { id } });

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
};