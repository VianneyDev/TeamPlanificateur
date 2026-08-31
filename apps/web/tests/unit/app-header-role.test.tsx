import { createElement } from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import AppHeader from "@/components/islands/AppHeader";

describe("AppHeader member role", () => {
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

  function mount(member: {
    name: string;
    initials: string;
    role: string;
    isExternal: boolean;
  }) {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => {
      root!.render(
        createElement(AppHeader, { pathname: "/", member }),
      );
    });
  }

  it("shows Manager externe under an external manager's name", () => {
    mount({
      name: "Léa Martin",
      initials: "LM",
      role: "manager",
      isExternal: true,
    });

    expect(container!.textContent).toContain("Léa Martin");
    expect(container!.textContent).toContain("Manager externe");
    expect(container!.textContent).not.toContain("Acting Member");
  });
});
