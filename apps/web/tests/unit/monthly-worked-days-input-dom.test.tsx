import { createElement, useState } from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import {
  normalizeWorkedDaysInput,
  shouldReplaceDaysInputValue,
} from "@/lib/monthly-worked-days-ui";

/**
 * Mirrors the panel's days input: empty default + sync clear on focus/mouseup
 * so a click beside "0" cannot leave a caret that produces "50" / "05".
 */
function DaysInputProbe({
  initial = "",
  onValue,
}: {
  initial?: string;
  onValue: (value: string) => void;
}) {
  const [days, setDays] = useState(initial);

  const clearLoneZeroInput = (input: HTMLInputElement) => {
    input.value = "";
    setDays("");
  };

  onValue(days);

  return createElement("input", {
    "data-testid": "days",
    type: "number",
    value: days,
    placeholder: "0",
    onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
      if (shouldReplaceDaysInputValue(e.currentTarget.value)) {
        clearLoneZeroInput(e.currentTarget);
      }
    },
    onMouseUp: (e: React.MouseEvent<HTMLInputElement>) => {
      if (shouldReplaceDaysInputValue(e.currentTarget.value)) {
        e.preventDefault();
        clearLoneZeroInput(e.currentTarget);
      }
    },
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setDays(normalizeWorkedDaysInput(e.target.value));
    },
  });
}

describe("days worked input interaction", () => {
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

  function mount(initial: string) {
    let value = initial;
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => {
      root!.render(
        createElement(DaysInputProbe, {
          initial,
          onValue: (next) => {
            value = next;
          },
        }),
      );
    });
    const input = container.querySelector(
      '[data-testid="days"]',
    ) as HTMLInputElement;
    return {
      input,
      getValue: () => value,
    };
  }

  it("starts empty with a zero placeholder", () => {
    const { input, getValue } = mount("");
    expect(getValue()).toBe("");
    expect(input.value).toBe("");
    expect(input.placeholder).toBe("0");
  });

  it("clears a lone zero on mouseup before a digit can append beside it", () => {
    const { input, getValue } = mount("0");
    expect(input.value).toBe("0");

    act(() => {
      input.dispatchEvent(new FocusEvent("focus", { bubbles: true }));
      input.dispatchEvent(
        new MouseEvent("mouseup", { bubbles: true, cancelable: true }),
      );
    });

    expect(getValue()).toBe("");
    expect(input.value).toBe("");
  });
});
