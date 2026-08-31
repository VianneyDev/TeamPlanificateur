import { describe, expect, it } from "vitest";
import { memberRoleLabel } from "@/lib/member-role-label";

describe("memberRoleLabel", () => {
  it("labels an external manager as Manager externe", () => {
    expect(
      memberRoleLabel({ role: "manager", isExternal: true }),
    ).toBe("Manager externe");
  });

  it("labels an external member as Membre externe", () => {
    expect(
      memberRoleLabel({ role: "member", isExternal: true }),
    ).toBe("Membre externe");
  });

  it("labels an internal manager as Manager", () => {
    expect(
      memberRoleLabel({ role: "manager", isExternal: false }),
    ).toBe("Manager");
  });

  it("labels an internal member as Membre", () => {
    expect(
      memberRoleLabel({ role: "member", isExternal: false }),
    ).toBe("Membre");
  });
});
