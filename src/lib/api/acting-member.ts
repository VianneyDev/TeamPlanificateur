import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import { db } from "@/lib/db";

export type ActingMember = {
  id: string;
  name: string;
  role: string;
  isExternal: boolean;
  archived: boolean;
};

/**
 * Resolve the Acting Member from the `selectedMemberId` cookie.
 * Returns null when missing or unknown.
 */
export async function resolveActingMember(
  c: Context,
): Promise<ActingMember | null> {
  const memberId = getCookie(c, "selectedMemberId");
  if (!memberId) return null;

  const member = await db.member.findUnique({
    where: { id: memberId },
    select: {
      id: true,
      name: true,
      role: true,
      isExternal: true,
      archived: true,
    },
  });

  return member;
}

export function isManager(member: ActingMember): boolean {
  return member.role === "manager";
}
