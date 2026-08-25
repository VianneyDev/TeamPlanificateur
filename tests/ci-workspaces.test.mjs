import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

function readText(relativePath) {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function coversBothWorkspaces(script) {
  const recursive = /(?:^|\s)-r(?:\s|$)/.test(script);
  const bothPackageFilters =
    /eccentric-equinox/.test(script) && /@vianneytraina\/ui/.test(script);
  const bothGlobs = /apps\/\*/.test(script) && /packages\/\*/.test(script);
  return recursive || bothPackageFilters || bothGlobs;
}

describe("CI workspace retarget (A2)", () => {
  it("runs lint, typecheck, and build against both workspaces", () => {
    const root = readJson("package.json");

    for (const name of ["lint", "typecheck", "build"]) {
      const script = root.scripts[name];
      assert.equal(typeof script, "string", `root must declare ${name}`);
      assert.ok(
        coversBothWorkspaces(script),
        `root ${name} must run against apps/* and packages/* (got: ${script})`,
      );
    }

    for (const pkgPath of ["apps/web/package.json", "packages/ui/package.json"]) {
      const pkg = readJson(pkgPath);
      for (const name of ["lint", "typecheck", "build"]) {
        const script = pkg.scripts?.[name];
        assert.equal(
          typeof script,
          "string",
          `${pkgPath} must declare ${name} so recursive CI can invoke it`,
        );
        assert.ok(script.length > 0, `${pkgPath} ${name} must not be empty`);
      }
    }
  });

  it("keys the pnpm cache on the root lockfile", () => {
    const workflow = readText(".github/workflows/ci.yml");
    const cacheHits = [...workflow.matchAll(/cache:\s*pnpm/g)];
    const lockfileHits = [
      ...workflow.matchAll(/cache-dependency-path:\s*pnpm-lock\.yaml/g),
    ];

    assert.ok(
      cacheHits.length >= 2,
      "quality and API test jobs must enable the pnpm cache",
    );
    assert.equal(
      lockfileHits.length,
      cacheHits.length,
      "every pnpm cache must be keyed on the root pnpm-lock.yaml",
    );
  });

  it("keeps product API tests on the app workspace", () => {
    const root = readJson("package.json");
    assert.match(root.scripts.test, /eccentric-equinox/);
    assert.doesNotMatch(root.scripts.test, /(?:^|\s)-r(?:\s|$)/);
  });

  it("keeps the Neon ephemeral-branch workflow on pull requests", () => {
    const workflow = readText(".github/workflows/ci.yml");
    assert.match(workflow, /neondatabase\/create-branch-action@/);
    assert.match(workflow, /neondatabase\/delete-branch-action@/);
    assert.match(workflow, /apps\/web\/\.env\.test/);
    assert.match(
      workflow,
      /pnpm --filter eccentric-equinox exec prisma migrate deploy/,
    );
  });

  it("pins Vite 6 so Astro plugin types match the app bundler", () => {
    const root = readJson("package.json");
    const app = readJson("apps/web/package.json");
    const ui = readJson("packages/ui/package.json");

    assert.equal(root.pnpm?.overrides?.vite, "^6.4.1");
    assert.equal(app.devDependencies.vite, "^6.4.1");
    assert.equal(ui.devDependencies.vite, "^6.4.1");
    assert.doesNotMatch(
      readText("pnpm-lock.yaml"),
      /vite@7\./,
      "a second Vite major breaks @tailwindcss/vite vs astro/config Plugin types",
    );
  });
});
