import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, globSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const uiRoot = join(repoRoot, "packages/ui");

const COMPONENTS = [
  "Button",
  "TextField",
  "Label",
  "Dialog",
  "Select",
  "DropdownMenu",
  "Badge",
];

const REQUIRED_STORIES = {
  Button: ["Default", "Ghost", "Outline", "Danger"],
  TextField: ["Default"],
  Label: ["Default"],
  Dialog: ["Default", "Without Close Button"],
  Select: ["Default", "Small"],
  DropdownMenu: ["Default", "Destructive"],
  Badge: ["Default", "Accent"],
};

function readText(relativePath) {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

describe("UI Storybook contract (A6)", () => {
  it("keeps Storybook config in the UI package and stories next to components", () => {
    assert.equal(
      existsSync(join(uiRoot, ".storybook/main.ts")),
      true,
      "packages/ui/.storybook/main.ts must exist (ADR-0011)",
    );
    const previewFile = ["preview.ts", "preview.tsx"]
      .map((name) => join("packages/ui/.storybook", name))
      .find((relativePath) => existsSync(join(repoRoot, relativePath)));
    assert.ok(
      previewFile,
      "packages/ui/.storybook/preview.ts or preview.tsx must exist",
    );

    const main = readText("packages/ui/.storybook/main.ts");
    assert.match(main, /@storybook\/react-vite/);
    assert.match(main, /@storybook\/addon-a11y/);
    assert.match(main, /@storybook\/addon-docs/);
    assert.match(main, /\.\.\/src\/\*\*\/\*\.stories\.tsx/);
    assert.doesNotMatch(main, /src\/stories/);
    assert.doesNotMatch(main, /packages\/ui\/stories/);

    const preview = readText(previewFile);
    assert.match(preview, /import ["']\.\.\/src\/styles\.css["']/);
    assert.match(preview, /autodocs/);
    assert.match(preview, /test:\s*["']error["']/);
    assert.doesNotMatch(preview, /@vianneytraina\/ui/);
    assert.doesNotMatch(preview, /manual:\s*true/);
    assert.doesNotMatch(preview, /test:\s*["']off["']/);

    for (const name of COMPONENTS) {
      const story = join(uiRoot, "src/components", name, `${name}.stories.tsx`);
      const component = join(uiRoot, "src/components", name, `${name}.tsx`);
      assert.equal(existsSync(component), true, `${name}.tsx must exist`);
      assert.equal(
        existsSync(story),
        true,
        `${name}.stories.tsx must be colocated with ${name}.tsx (ADR-0011)`,
      );
    }
  });

  it("imports component source from colocated stories, never the package name", () => {
    const storyFiles = globSync("src/**/*.stories.tsx", { cwd: uiRoot });
    assert.ok(storyFiles.length > 0, "expected colocated story files");

    const barrel = readText("packages/ui/src/index.ts");
    assert.doesNotMatch(barrel, /\.stories/);

    for (const relativePath of storyFiles) {
      const source = readText(join("packages/ui", relativePath));
      assert.match(
        source,
        /^export default\b/m,
        `${relativePath} must default-export CSF3 meta (ADR-0009)`,
      );
      assert.doesNotMatch(
        source,
        /from\s+["']@vianneytraina\/ui(?:\/[^"']*)?["']/,
        `${relativePath} must not import the published package (ADR-0013)`,
      );
      assert.doesNotMatch(
        source,
        /from\s+["'][^"']*\/dist\//,
        `${relativePath} must not import dist/ (ADR-0013)`,
      );
    }
  });

  it("exposes Storybook scripts and keeps stories out of the tsup entry", () => {
    const ui = readJson("packages/ui/package.json");
    const config = readText("packages/ui/tsup.config.ts");

    assert.equal(typeof ui.scripts.storybook, "string");
    assert.match(ui.scripts.storybook, /storybook dev/);
    assert.equal(typeof ui.scripts["build-storybook"], "string");
    assert.match(ui.scripts["build-storybook"], /storybook build/);
    assert.match(config, /entry:\s*\[["']src\/index\.ts["']\]/);
  });
});

describe("UI Storybook static site (A6)", { concurrency: 1 }, () => {
  before(() => {
    execFileSync("pnpm", ["--filter", "@vianneytraina/ui", "build-storybook"], {
      cwd: repoRoot,
      stdio: "pipe",
    });
  });

  it("builds a static site A8 can serve, with one story per variant and a docs page", () => {
    const staticDir = join(uiRoot, "storybook-static");
    assert.equal(
      existsSync(join(staticDir, "index.html")),
      true,
      "storybook build must emit storybook-static/index.html",
    );

    const indexPath = join(staticDir, "index.json");
    assert.equal(
      existsSync(indexPath),
      true,
      "storybook-static/index.json must list built stories",
    );

    const index = JSON.parse(readFileSync(indexPath, "utf8"));
    const storiesByTitle = {};
    const docsTitles = new Set();

    for (const entry of Object.values(index.entries ?? {})) {
      if (entry.type === "story") {
        (storiesByTitle[entry.title] ??= []).push(entry.name);
      }
      if (entry.type === "docs") {
        docsTitles.add(entry.title);
      }
    }

    for (const [title, names] of Object.entries(REQUIRED_STORIES)) {
      assert.ok(
        docsTitles.has(title),
        `docs page missing for ${title}`,
      );
      for (const name of names) {
        assert.ok(
          (storiesByTitle[title] ?? []).includes(name),
          `${title} is missing story "${name}" (got: ${(storiesByTitle[title] ?? []).join(", ")})`,
        );
      }
    }
  });

  it("does not leak stories into the tsup dist after a package build", () => {
    execFileSync("pnpm", ["--filter", "@vianneytraina/ui", "build"], {
      cwd: repoRoot,
      stdio: "pipe",
    });

    const distFiles = readdirSync(join(uiRoot, "dist"));
    assert.ok(
      !distFiles.some((name) => name.includes(".stories")),
      `dist/ must not contain story files (got: ${distFiles.join(", ")})`,
    );
  });
});
