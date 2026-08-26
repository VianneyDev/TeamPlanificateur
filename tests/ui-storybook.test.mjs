import assert from "node:assert/strict";
import { existsSync, globSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
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
  Dialog: ["Default", "WithoutCloseButton"],
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

  it("keeps one source story per required component variant", () => {
    for (const [component, storyNames] of Object.entries(REQUIRED_STORIES)) {
      const source = readText(
        join(
          "packages/ui/src/components",
          component,
          `${component}.stories.tsx`,
        ),
      );

      for (const storyName of storyNames) {
        assert.match(
          source,
          new RegExp(`export const ${storyName}\\b`),
          `${component} must export the ${storyName} story`,
        );
      }
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

describe("Storybook visual and accessibility CI contract (A8)", () => {
  it("keeps Storybook building in CI instead of this contract suite", () => {
    const source = readText("tests/ui-storybook.test.mjs");
    const storybookSourceContract = source.slice(
      0,
      source.indexOf('describe("Storybook visual and accessibility CI contract'),
    );
    const ui = readJson("packages/ui/package.json");

    assert.equal(typeof ui.scripts["build-storybook"], "string");
    assert.match(ui.scripts["build-storybook"], /^storybook build(?:\s|$)/);
    assert.doesNotMatch(storybookSourceContract, /node:child_process/);
    assert.doesNotMatch(
      storybookSourceContract,
      /storybook-static\/index\.(?:html|json)/,
    );
  });

  it("runs screenshot comparison and axe against the built Storybook", () => {
    const root = readJson("package.json");
    const config = readText("playwright.config.mjs");
    const suite = readText("tests/storybook.spec.mjs");

    assert.match(root.scripts["test:storybook"], /playwright test/);
    assert.match(config, /packages\/ui\/storybook-static/);
    assert.match(suite, /toHaveScreenshot/);
    assert.match(suite, /@axe-core\/playwright/);
    assert.match(suite, /["']serious["']/);
    assert.match(suite, /["']critical["']/);
  });

  it("builds once and passes the static Storybook artifact to one Docker test job", () => {
    const workflow = readText(".github/workflows/ci.yml");

    assert.match(workflow, /workflow_dispatch:/);
    assert.match(workflow, /mcr\.microsoft\.com\/playwright:v[\d.]+-noble/);
    assert.match(workflow, /actions\/upload-artifact@/);
    assert.match(workflow, /actions\/download-artifact@/);
    assert.match(workflow, /packages\/ui\/storybook-static/);
    assert.match(workflow, /pnpm test:storybook/);
    assert.match(workflow, /--update-snapshots/);
    assert.match(workflow, /contents:\s*write/);
    assert.match(
      workflow,
      /commit -m "test: update Storybook visual snapshots"/,
    );
    assert.match(workflow, /git push origin/);
  });
});
