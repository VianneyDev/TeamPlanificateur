import { describe, expect, it } from "vitest";
import { mergeDraftWeekdays } from "@/lib/leave-request-draft";

describe("mergeDraftWeekdays", () => {
  it("accumulates non-contiguous weekdays across gestures", () => {
    let draft: string[] = [];
    draft = mergeDraftWeekdays(draft, ["2026-09-07"]); // Monday
    draft = mergeDraftWeekdays(draft, ["2026-09-10"]); // Thursday
    draft = mergeDraftWeekdays(draft, ["2026-09-15"]); // next Tuesday

    expect(draft).toEqual(["2026-09-07", "2026-09-10", "2026-09-15"]);
    expect(draft).toHaveLength(3);
  });

  it("unions a contiguous range into an existing sparse draft", () => {
    const draft = mergeDraftWeekdays(
      ["2026-09-07", "2026-09-15"],
      ["2026-09-09", "2026-09-10", "2026-09-11"],
    );

    expect(draft).toEqual([
      "2026-09-07",
      "2026-09-09",
      "2026-09-10",
      "2026-09-11",
      "2026-09-15",
    ]);
  });

  it("toggles off days when the gesture repeats an already-selected set", () => {
    const draft = mergeDraftWeekdays(
      ["2026-09-07", "2026-09-10", "2026-09-15"],
      ["2026-09-10"],
    );

    expect(draft).toEqual(["2026-09-07", "2026-09-15"]);
  });
});
