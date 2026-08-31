import { afterEach, describe, expect, it } from "vitest";
import { isDemoResetEnabled } from "@/lib/demo-reset-enabled";

describe("isDemoResetEnabled", () => {
  const previous = process.env.DEMO_RESET_ENABLED;

  afterEach(() => {
    if (previous === undefined) {
      delete process.env.DEMO_RESET_ENABLED;
    } else {
      process.env.DEMO_RESET_ENABLED = previous;
    }
  });

  it('is true only when DEMO_RESET_ENABLED is exactly "true"', () => {
    delete process.env.DEMO_RESET_ENABLED;
    expect(isDemoResetEnabled()).toBe(false);

    process.env.DEMO_RESET_ENABLED = "true";
    expect(isDemoResetEnabled()).toBe(true);

    process.env.DEMO_RESET_ENABLED = "TRUE";
    expect(isDemoResetEnabled()).toBe(false);

    process.env.DEMO_RESET_ENABLED = "1";
    expect(isDemoResetEnabled()).toBe(false);
  });
});
