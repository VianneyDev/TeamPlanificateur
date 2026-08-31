import { createElement } from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import AppHeader from "@/components/islands/AppHeader";

if (typeof Element !== "undefined") {
  if (typeof Element.prototype.hasPointerCapture !== "function") {
    Element.prototype.hasPointerCapture = () => false;
  }
  if (typeof Element.prototype.setPointerCapture !== "function") {
    Element.prototype.setPointerCapture = () => {};
  }
  if (typeof Element.prototype.releasePointerCapture !== "function") {
    Element.prototype.releasePointerCapture = () => {};
  }
  if (typeof Element.prototype.scrollIntoView !== "function") {
    Element.prototype.scrollIntoView = () => {};
  }
}

const member = {
  name: "Léa Martin",
  initials: "LM",
  role: "manager",
  isExternal: true,
};

describe("AppHeader demo change-member entry", () => {
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

  function mount(demoResetEnabled?: boolean) {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => {
      root!.render(
        createElement(AppHeader, {
          pathname: "/",
          member,
          ...(demoResetEnabled === undefined
            ? {}
            : { demoResetEnabled }),
        }),
      );
    });
  }

  function openActingMemberMenu() {
    const trigger = container!.querySelector(
      '[aria-label="Manager externe Léa Martin. Ouvrir le menu"]',
    );
    expect(trigger).toBeInstanceOf(HTMLButtonElement);
    act(() => {
      trigger!.dispatchEvent(
        new PointerEvent("pointerdown", { bubbles: true, cancelable: true }),
      );
    });
  }

  function menuItemLabels(): string[] {
    return [...document.querySelectorAll('[role="menuitem"]')].map(
      (item) => item.textContent?.replace(/\s+/g, " ").trim() ?? "",
    );
  }

  it("hides Changer de membre when the demo lock is off", () => {
    mount(false);
    openActingMemberMenu();

    const labels = menuItemLabels();
    expect(labels).not.toContain("Changer de membre");
    expect(labels).toContain("Se déconnecter");
  });

  it("hides Changer de membre when the demo lock prop is omitted", () => {
    mount();
    openActingMemberMenu();

    const labels = menuItemLabels();
    expect(labels).not.toContain("Changer de membre");
    expect(labels).toContain("Se déconnecter");
  });

  it("shows Changer de membre above Se déconnecter when the demo lock is on", () => {
    mount(true);
    openActingMemberMenu();

    const labels = menuItemLabels();
    expect(labels).toContain("Changer de membre");
    expect(labels).toContain("Se déconnecter");
    expect(labels.indexOf("Changer de membre")).toBeLessThan(
      labels.indexOf("Se déconnecter"),
    );
  });

  it("returns to the member selector through the existing logout POST", () => {
    const submit = vi
      .spyOn(HTMLFormElement.prototype, "submit")
      .mockImplementation(() => {});

    try {
      mount(true);
      openActingMemberMenu();

      const changeMember = [...document.querySelectorAll('[role="menuitem"]')].find(
        (item) => item.textContent?.includes("Changer de membre"),
      );
      expect(changeMember).toBeDefined();

      act(() => {
        changeMember!.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
        );
      });

      expect(submit).toHaveBeenCalledTimes(1);
      const form = submit.mock.contexts[0] as HTMLFormElement;
      expect(form.method.toLowerCase()).toBe("post");
      expect(new URL(form.action, "http://localhost").pathname).toBe(
        "/api/logout",
      );
    } finally {
      submit.mockRestore();
    }
  });

  it("keeps Se déconnecter posting to logout when the demo lock is on", () => {
    const submit = vi
      .spyOn(HTMLFormElement.prototype, "submit")
      .mockImplementation(() => {});

    try {
      mount(true);
      openActingMemberMenu();

      const logout = [...document.querySelectorAll('[role="menuitem"]')].find(
        (item) => item.textContent?.includes("Se déconnecter"),
      );
      expect(logout).toBeDefined();

      act(() => {
        logout!.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
        );
      });

      expect(submit).toHaveBeenCalledTimes(1);
      const form = submit.mock.contexts[0] as HTMLFormElement;
      expect(new URL(form.action, "http://localhost").pathname).toBe(
        "/api/logout",
      );
    } finally {
      submit.mockRestore();
    }
  });
});
