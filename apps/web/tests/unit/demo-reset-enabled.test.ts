import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
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

describe("demo lock import boundary", () => {
  const layoutSource = readFileSync(
    path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      "../../src/layouts/Layout.astro",
    ),
    "utf8",
  );

  it("lets the layout read the lock without importing the wipe module", () => {
    expect(layoutSource).toContain('from "@/lib/demo-reset-enabled"');
    expect(layoutSource).not.toMatch(/from ["']@\/lib\/demo-reset["']/);
  });

  it("passes the lock into AppHeader so the change-member entry stays gated", () => {
    expect(layoutSource).toContain("demoResetEnabled={demoResetEnabled}");
  });
});
