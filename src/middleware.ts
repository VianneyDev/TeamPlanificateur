import type { MiddlewareHandler } from "astro";
import { db } from "@/lib/db";

export const onRequest: MiddlewareHandler = async (context, next) => {
  const memberId = context.cookies.get("selectedMemberId")?.value;

  if (memberId) {
    const member = await db.member.findUnique({
      where: { id: memberId },
      include: { teams: true },
    });

    context.locals.member = member;
  } else {
    context.locals.member = null;
  }

  if (context.url.pathname === "/gestion") {
    const member = context.locals.member;
    if (!member || member.role !== "manager") {
      return context.redirect("/");
    }
  }

  return next();
};
