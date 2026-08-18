import type { DayOff } from "@/lib/types";

export type DayOffCellMembers = {
  primary: boolean;
  editTargetOff: boolean;
  others: { id: string; name: string }[];
};

/** Initials for nominative secondary Day Off chips on the Team Calendar. */
export function memberInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toLocaleUpperCase("fr-FR");
  }
  const first = parts[0][0] ?? "";
  const last = parts[parts.length - 1][0] ?? "";
  return `${first}${last}`.toLocaleUpperCase("fr-FR");
}

/** Group list Day Offs by calendar date for Team Calendar cells. */
export function groupDayOffsByDate(
  daysOff: DayOff[],
  actingMemberId: string,
  editTargetId: string,
): Map<string, DayOffCellMembers> {
  const map = new Map<string, DayOffCellMembers>();

  for (const dayOff of daysOff) {
    const key = dayOff.date.slice(0, 10);
    const entry = map.get(key) ?? {
      primary: false,
      editTargetOff: false,
      others: [],
    };
    const name = dayOff.member?.name ?? "Membre";

    if (dayOff.memberId === actingMemberId) {
      entry.primary = true;
    } else {
      entry.others.push({ id: dayOff.memberId, name });
    }

    if (dayOff.memberId === editTargetId) {
      entry.editTargetOff = true;
    }

    map.set(key, entry);
  }

  return map;
}
