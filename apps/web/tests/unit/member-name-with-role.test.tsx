import { createElement } from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import MemberSelector, {
  MemberNameWithRole,
} from "@/components/islands/member/MemberSelector";

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

describe("MemberSelector", () => {
  let root: Root | undefined;
  let container: HTMLDivElement | undefined;

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    container?.remove();
    root = undefined;
    container = undefined;
    vi.restoreAllMocks();
  });

  it("keeps the home-page card chrome around the selector", () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ data: [] }), {
        headers: { "Content-Type": "application/json" },
      }),
    );
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => {
      root!.render(createElement(MemberSelector));
    });

    const card = container!.querySelector(".panel");
    expect(card).not.toBeNull();
    expect(card!.textContent).toContain("Accès au planning");
    expect(card!.textContent).toContain("Sélectionnez votre équipe et votre nom");
  });
});
