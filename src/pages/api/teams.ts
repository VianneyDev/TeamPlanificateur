import type { APIRoute } from "astro";
import { db } from "../../lib/db";

export const GET: APIRoute = async () => {
  const teams = await db.team.findMany({
    orderBy: { name: "asc" },
  });
  return new Response(JSON.stringify(teams), {
    headers: { "Content-Type": "application/json" },
  });
};
