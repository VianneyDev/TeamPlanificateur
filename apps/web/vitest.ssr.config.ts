import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "ssr",
    environment: "node",
    include: ["tests/ssr/**/*.test.ts"],
    hookTimeout: 60_000,
    testTimeout: 30_000,
  },
});
