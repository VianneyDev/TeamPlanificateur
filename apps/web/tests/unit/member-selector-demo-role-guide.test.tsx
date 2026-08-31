import { createElement } from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import MemberSelector, {
  MemberSelectorForm,
} from "@/components/islands/member/MemberSelector";

const MEMBER_EXPLANATION = "consulte ses congés et soumet des demandes.";
const EXTERNAL_MEMBER_EXPLANATION =
  "consulte ses congés, soumet des demandes et renseigne ses jours travaillés chaque mois.";
const MANAGER_EXPLANATION =
  "approuve les demandes, corrige les congés des membres, gère les équipes et les membres.";
const EXTERNAL_MANAGER_EXPLANATION =
  "mêmes actions qu'un manager, et renseigne ses jours travaillés chaque mois.";
const MANAGER_HINT = "commencez par un manager";

describe("MemberSelector demo role guide", () => {
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

  function mockEmptyLists() {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ data: [] }), {
        headers: { "Content-Type": "application/json" },
      }),
    );
  }

  function mountSelector(demoResetEnabled?: boolean) {
    mockEmptyLists();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => {
      root!.render(
        createElement(
          MemberSelector,
          demoResetEnabled === undefined ? {} : { demoResetEnabled },
        ),
      );
    });
  }

  function mountForm(demoResetEnabled?: boolean) {
    mockEmptyLists();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => {
      root!.render(
        createElement(
          MemberSelectorForm,
          demoResetEnabled === undefined ? {} : { demoResetEnabled },
        ),
      );
    });
  }

  function text(): string {
    return container!.textContent ?? "";
  }

  function countOccurrences(snippet: string): number {
    const haystack = text();
    let count = 0;
    let from = 0;
    while (from < haystack.length) {
      const index = haystack.indexOf(snippet, from);
      if (index === -1) break;
      count += 1;
      from = index + snippet.length;
    }
    return count;
  }

  it("hides role explanations when the demo lock is off", () => {
    mountSelector(false);

    expect(text()).not.toContain(MEMBER_EXPLANATION);
    expect(text()).not.toContain(EXTERNAL_MEMBER_EXPLANATION);
    expect(text()).not.toContain(MANAGER_EXPLANATION);
    expect(text()).not.toContain(EXTERNAL_MANAGER_EXPLANATION);
    expect(text()).not.toContain(MANAGER_HINT);
  });

  it("hides role explanations when the demo lock prop is omitted", () => {
    mountSelector();

    expect(text()).not.toContain(MEMBER_EXPLANATION);
    expect(text()).not.toContain(MANAGER_HINT);
  });

  it("explains each role once and points to manager when the demo lock is on", () => {
    mountSelector(true);

    expect(countOccurrences(MEMBER_EXPLANATION)).toBe(1);
    expect(countOccurrences(EXTERNAL_MEMBER_EXPLANATION)).toBe(1);
    expect(countOccurrences(MANAGER_EXPLANATION)).toBe(1);
    expect(countOccurrences(EXTERNAL_MANAGER_EXPLANATION)).toBe(1);
    expect(text()).toContain(MANAGER_HINT);
    expect(text()).toContain("Membre externe");
    expect(text()).toContain("Manager externe");
  });

  it("keeps the same guide on the form used in the change-member dialog", () => {
    mountForm(true);

    expect(text()).toContain(MEMBER_EXPLANATION);
    expect(text()).toContain(MANAGER_HINT);
    expect(container!.querySelector(".panel")).toBeNull();
  });
});
