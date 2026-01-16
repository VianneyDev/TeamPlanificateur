import type { APIRoute } from "astro";
import { db } from "../../lib/db";

export const GET: APIRoute = async ({ url }) => {
  const teamId = url.searchParams.get("teamId");

  if (!teamId) {
    return new Response(JSON.stringify([]), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const members = await db.member.findMany({
    where: {
      teamId: teamId,
      archived: false,
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      teamId: true,
    },
  });

  return new Response(JSON.stringify(members), {
    headers: { "Content-Type": "application/json" },
  });
};
