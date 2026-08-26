import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, globSync, readFileSync, realpathSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const localUiPackage = realpathSync(join(repoRoot, "packages/ui"));

function readText(relativePath) {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function resolveAppUiPackageRoot() {
  const resolved = execFileSync(
    "node",
    [
      "--input-type=module",
      "-e",
      'process.stdout.write(import.meta.resolve("@vianneytraina/ui"))',
    ],
    { cwd: join(repoRoot, "apps/web"), encoding: "utf8" },
  );
  return realpathSync(join(dirname(fileURLToPath(resolved)), ".."));
}

describe("app consumes published @vianneytraina/ui (A9)", () => {
  it("declares a registry semver range without the workspace protocol", () => {
    const app = readJson("apps/web/package.json");
    const range = app.dependencies["@vianneytraina/ui"];

    assert.equal(range, "^1.0.0");
    assert.doesNotMatch(String(range), /workspace:/);
  });

  it("installs the registry tarball, not a symlink to the local UI package", () => {
    const installedRoot = resolveAppUiPackageRoot();

    assert.notEqual(
      installedRoot,
      localUiPackage,
      "apps/web must resolve @vianneytraina/ui from the registry, not packages/ui",
    );
    assert.ok(
      existsSync(join(installedRoot, "dist/index.js")),
      "installed package must contain the published dist entry",
    );
    assert.ok(
      existsSync(join(installedRoot, "dist/index.css")),
      "installed package must contain the published CSS file",
    );
    assert.equal(
      existsSync(join(installedRoot, "src")),
      false,
      "registry tarball must not ship src/",
    );
  });

  it("imports package CSS exactly once in the Astro layout", () => {
    const layout = readText("apps/web/src/layouts/Layout.astro");
    const appFiles = globSync("**/*.{astro,css,js,mjs,ts,tsx}", {
      cwd: join(repoRoot, "apps/web"),
    }).filter((relativePath) => !relativePath.includes("node_modules"));

    const occurrences = appFiles.flatMap((relativePath) => {
      const source = readText(join("apps/web", relativePath));
      return [...source.matchAll(/@vianneytraina\/ui\/styles\.css/g)].map(
        () => relativePath,
      );
    });

    assert.match(
      layout,
      /import ["']@vianneytraina\/ui\/styles\.css["']/,
      "Layout.astro must import the public CSS specifier",
    );
    assert.deepEqual(
      occurrences,
      ["src/layouts/Layout.astro"],
      `package CSS must be imported exactly once in the layout (found: ${occurrences.join(", ") || "none"})`,
    );
  });

  it("consumes package components on the Gestion screen", () => {
    const gestionIslands = [
      "apps/web/src/components/islands/team/TeamsPanel.tsx",
      "apps/web/src/components/islands/team/TeamModal.tsx",
      "apps/web/src/components/islands/team/TeamRowActions.tsx",
      "apps/web/src/components/islands/member/MembersPanel.tsx",
      "apps/web/src/components/islands/member/MemberModal.tsx",
      "apps/web/src/components/islands/member/MemberRowActions.tsx",
    ];
    const sources = gestionIslands.map((relativePath) => ({
      relativePath,
      source: readText(relativePath),
    }));
    const fromPackage = sources.filter(({ source }) =>
      /from ["']@vianneytraina\/ui["']/.test(source),
    );
    const combined = fromPackage.map(({ source }) => source).join("\n");

    assert.ok(
      fromPackage.length > 0,
      "Gestion islands must import from @vianneytraina/ui",
    );
    assert.match(combined, /\bButton\b/);
    assert.match(combined, /\bDialog\b/);
    assert.match(combined, /\bBadge\b/);
  });
});
