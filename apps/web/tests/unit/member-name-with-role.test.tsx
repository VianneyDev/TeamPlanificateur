import { createElement } from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { MemberNameWithRole } from "@/components/islands/member/MemberSelector";

describe("MemberNameWithRole", () => {
  let root: Root | undefined;
  let container: HTMLDivElement | undefined;

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    container?.remove();
    root = undefined;
    container = undefined;
  });

  function mount(member: { name: string; role: string; isExternal: boolean }) {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => {
      root!.render(createElement(MemberNameWithRole, member));
    });
  }

  it("shows the member name beside a role badge", () => {
    mount({
      name: "Nora Chevalier",
      role: "manager",
      isExternal: true,
    });

    expect(container!.textContent).toContain("Nora Chevalier");
    expect(container!.textContent).toContain("Manager externe");

    const badge = container!.querySelector(".ui-badge");
    expect(badge).not.toBeNull();
    expect(badge!.textContent).toBe("Manager externe");
  });
});
