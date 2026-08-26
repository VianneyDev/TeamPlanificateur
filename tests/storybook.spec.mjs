import { readFileSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const index = JSON.parse(
  readFileSync(
    new URL("../packages/ui/storybook-static/index.json", import.meta.url),
    "utf8",
  ),
);

const stories = Object.values(index.entries ?? {})
  .filter((entry) => entry.type === "story")
  .sort((left, right) => left.id.localeCompare(right.id));

if (stories.length === 0) {
  throw new Error("The built Storybook does not contain any stories");
}

const storyInteractions = {
  Dialog: async (page) => {
    await page.getByRole("button", { name: "Ouvrir" }).click();
    await page.getByRole("dialog").waitFor();
    return '[role="dialog"]';
  },
  DropdownMenu: async (page) => {
    await page.getByRole("button", { name: "Actions" }).click();
    await page.getByRole("menu").waitFor();
    return '[role="menu"]';
  },
  Select: async (page) => {
    await page.getByRole("combobox", { name: "Équipe" }).click();
    await page.getByRole("listbox").waitFor();
    return '[role="listbox"]';
  },
};

async function openInteractiveContent(page, title) {
  return storyInteractions[title]?.(page);
}

async function analyzeWhenAddonIsIdle(page, include) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const builder = new AxeBuilder({ page });
      return await (include ? builder.include(include) : builder).analyze();
    } catch (error) {
      if (
        !(error instanceof Error) ||
        !error.message.includes("Axe is already running") ||
        attempt === 49
      ) {
        throw error;
      }
      await page.waitForTimeout(100);
    }
  }

  throw new Error("Axe did not become idle");
}

function summarizeViolations(violations) {
  return violations
    .map(
      ({ help, id, impact, nodes }) =>
        `${impact}: ${id} - ${help}\n${nodes
          .map(({ target }) => `  ${target.join(" ")}`)
          .join("\n")}`,
    )
    .join("\n\n");
}

function expectNoSeriousViolations(scan) {
  const seriousViolations = scan.violations.filter(({ impact }) =>
    ["serious", "critical"].includes(impact),
  );

  expect(seriousViolations, summarizeViolations(seriousViolations)).toEqual([]);
}

for (const theme of ["light", "dark"]) {
  test.describe(`${theme} theme`, () => {
    for (const story of stories) {
      test(`${story.title} / ${story.name}`, async ({ page }) => {
        const query = new URLSearchParams({
          id: story.id,
          viewMode: "story",
          globals: `theme:${theme}`,
        });

        await page.goto(`/iframe.html?${query}`);
        await page.locator("#storybook-root").waitFor();
        await page.waitForFunction(
          () => document.querySelector("#storybook-root")?.children.length,
        );
        await page.evaluate(() => document.fonts.ready);

        expectNoSeriousViolations(await analyzeWhenAddonIsIdle(page));

        const interactiveContent = await openInteractiveContent(
          page,
          story.title,
        );
        if (interactiveContent) {
          expectNoSeriousViolations(
            await analyzeWhenAddonIsIdle(page, interactiveContent),
          );
        }

        await expect(page).toHaveScreenshot(`${story.id}-${theme}.png`);
      });
    }
  });
}
