import path from "node:path";
import { defineConfig } from "vitest/config";

const alias = {
  "@": path.resolve(__dirname, "./src"),
};

export default defineConfig({
  resolve: { alias },
  test: {
    projects: [
      {
        resolve: { alias },
        test: {
          name: "api",
          environment: "node",
          include: ["tests/api/**/*.test.ts"],
          setupFiles: ["./tests/setup-env.ts"],
          // Neon preview branches (CI) can cold-start; beforeAll seeds several
          // sequential Hono round-trips and must outlive the default 10s hook.
          hookTimeout: 60_000,
          testTimeout: 30_000,
        },
      },
      {
        resolve: { alias },
        test: {
          name: "unit",
          environment: "jsdom",
          include: ["tests/unit/**/*.test.ts", "tests/unit/**/*.test.tsx"],
        },
      },
    ],
  },
});
