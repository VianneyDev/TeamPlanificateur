export const MEMBER_ROLE_LABELS = {
  member: "Membre",
  manager: "Manager",
} as const;

export function memberRoleLabel({
  role,
  isExternal,
}: {
  role: string;
  isExternal: boolean;
}): string {
  const base =
    role === "manager"
      ? MEMBER_ROLE_LABELS.manager
      : MEMBER_ROLE_LABELS.member;
  return isExternal ? `${base} externe` : base;
}
