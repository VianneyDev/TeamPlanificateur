import type { APIRoute } from "astro";
import { db } from "@/lib/db";

export const prerender = false;

export const POST: APIRoute = async ({ params }) => {
  const { id } = params;

  if (!id) {
    return new Response(JSON.stringify({ error: "Member ID is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  await db.member.update({
    where: { id },
    data: { archived: true },
    include: {
      teams: true,
    },
  });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
  });
};
