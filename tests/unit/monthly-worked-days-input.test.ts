import { describe, expect, it } from "vitest";
import {
  normalizeWorkedDaysInput,
  shouldReplaceDaysInputValue,
} from "@/lib/monthly-worked-days-ui";

describe("normalizeWorkedDaysInput", () => {
  it("keeps an empty string so the field can stay blank with a placeholder", () => {
    expect(normalizeWorkedDaysInput("")).toBe("");
  });

  it("keeps a lone zero when the user intentionally types zero", () => {
    expect(normalizeWorkedDaysInput("0")).toBe("0");
  });

  it("strips a leading zero so 010 becomes 10", () => {
    expect(normalizeWorkedDaysInput("010")).toBe("10");
    expect(normalizeWorkedDaysInput("01")).toBe("1");
  });

  it("leaves ordinary day counts unchanged", () => {
    expect(normalizeWorkedDaysInput("10")).toBe("10");
    expect(normalizeWorkedDaysInput("22")).toBe("22");
  });
});

describe("shouldReplaceDaysInputValue", () => {
  it("flags a lone zero so focus/mouseup can clear it before the next keystroke", () => {
    expect(shouldReplaceDaysInputValue("0")).toBe(true);
  });

  it("leaves empty and non-zero values alone", () => {
    expect(shouldReplaceDaysInputValue("")).toBe(false);
    expect(shouldReplaceDaysInputValue("10")).toBe(false);
  });
});
