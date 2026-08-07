import { describe, expect, it } from "vitest";
import {
  daysInputAfterBlur,
  daysInputAfterFocus,
  normalizeWorkedDaysInput,
} from "@/lib/monthly-worked-days-ui";

describe("normalizeWorkedDaysInput", () => {
  it("keeps an empty string so the field can be cleared while typing", () => {
    expect(normalizeWorkedDaysInput("")).toBe("");
  });

  it("keeps a lone zero", () => {
    expect(normalizeWorkedDaysInput("0")).toBe("0");
  });

  it("strips a leading zero so typing 10 after a default 0 does not show 010", () => {
    expect(normalizeWorkedDaysInput("010")).toBe("10");
    expect(normalizeWorkedDaysInput("01")).toBe("1");
  });

  it("leaves ordinary day counts unchanged", () => {
    expect(normalizeWorkedDaysInput("10")).toBe("10");
    expect(normalizeWorkedDaysInput("22")).toBe("22");
  });
});

describe("daysInputAfterFocus", () => {
  it("clears a default zero so the next keystrokes are not prefixed", () => {
    expect(daysInputAfterFocus("0")).toBe("");
  });

  it("keeps a non-zero value for correction", () => {
    expect(daysInputAfterFocus("10")).toBe("10");
  });
});

describe("daysInputAfterBlur", () => {
  it("restores zero when the field is left empty", () => {
    expect(daysInputAfterBlur("")).toBe("0");
    expect(daysInputAfterBlur("   ")).toBe("0");
  });

  it("keeps a typed value", () => {
    expect(daysInputAfterBlur("10")).toBe("10");
  });
});
