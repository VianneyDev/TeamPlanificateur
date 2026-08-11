import { describe, expect, it } from "vitest";
import {
  groupDayOffsByDate,
  memberInitials,
} from "@/lib/day-off-calendar";
import type { DayOff } from "@/lib/types";

describe("memberInitials", () => {
  it("uses first and last name initials for multi-word names", () => {
    expect(memberInitials("Alice Martin")).toBe("AM");
  });

  it("uses up to two letters of a single-word name", () => {
    expect(memberInitials("Bob")).toBe("BO");
  });

  it("ignores extra whitespace and lowercases input", () => {
    expect(memberInitials("  claire  dupont  ")).toBe("CD");
  });

  it("falls back when the name is empty", () => {
    expect(memberInitials("   ")).toBe("?");
  });
});

describe("groupDayOffsByDate", () => {
  const actingId = "acting";
  const editId = "edit";

  it("keeps other members nominative with id and name", () => {
    const daysOff: DayOff[] = [
      {
        id: "1",
        memberId: "other",
        date: "2026-08-12T00:00:00.000Z",
        member: { id: "other", name: "Alice Martin" },
      },
    ];

    const entry = groupDayOffsByDate(daysOff, actingId, editId).get(
      "2026-08-12",
    );

    expect(entry).toEqual({
      primary: false,
      editTargetOff: false,
      others: [{ id: "other", name: "Alice Martin" }],
    });
  });
});
