import { defineConfig, devices } from "@playwright/test";

const storybookUrl = "http://127.0.0.1:6006";

export default defineConfig({
  testDir: "./tests",
  testMatch: "storybook.spec.mjs",
  forbidOnly: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["line"],
    ["html", { open: "never", outputFolder: "playwright-report" }],
  ],
  outputDir: "test-results",
  updateSnapshots: "none",
  expect: {
    toHaveScreenshot: {
      animations: "disabled",
      caret: "hide",
      maxDiffPixels: 0,
    },
  },
  use: {
    baseURL: storybookUrl,
    trace: "retain-on-failure",
  },
  webServer: {
    command:
      "pnpm exec http-server packages/ui/storybook-static --port 6006 --silent",
    url: `${storybookUrl}/index.json`,
    reuseExistingServer: false,
    timeout: 30_000,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
      },
    },
  ],
});
