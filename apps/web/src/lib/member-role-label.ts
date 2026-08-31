export const MEMBER_ROLE_LABELS = {
  member: "Membre",
  manager: "Manager",
} as const;

const UNKNOWN_MEMBER_ROLE_LABEL = "Rôle inconnu";

export function memberBaseRoleLabel(role: string): string {
  // Prisma stores Member.role as an unconstrained String, so reads may contain
  // historical or out-of-band values despite validation on API writes.
  return Object.hasOwn(MEMBER_ROLE_LABELS, role)
    ? MEMBER_ROLE_LABELS[role as keyof typeof MEMBER_ROLE_LABELS]
    : UNKNOWN_MEMBER_ROLE_LABEL;
}

export function memberRoleLabel({
  role,
  isExternal,
}: {
  role: string;
  isExternal: boolean;
}): string {
  const base = memberBaseRoleLabel(role);
  if (base === UNKNOWN_MEMBER_ROLE_LABEL) return base;

  return isExternal ? `${base} externe` : base;
}
