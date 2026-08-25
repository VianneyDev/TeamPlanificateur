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

describe("pnpm monorepo workspace contract (A1)", () => {
  it("declares apps/* and packages/* workspaces", () => {
    const manifest = readText("pnpm-workspace.yaml");
    assert.match(manifest, /apps\/\*/);
    assert.match(manifest, /packages\/\*/);
  });

  it("disables workspace linking at the root", () => {
    const npmrc = readText(".npmrc");
    assert.match(npmrc, /^link-workspace-packages\s*=\s*false\s*$/m);
  });

  it("keeps the app private and free of a design-system dependency", () => {
    const app = readJson("apps/web/package.json");
    assert.equal(app.name, "eccentric-equinox");
    assert.equal(app.private, true);

    const declared = {
      ...app.dependencies,
      ...app.devDependencies,
      ...app.optionalDependencies,
      ...app.peerDependencies,
    };
    assert.equal(
      Object.hasOwn(declared, "@vianneytraina/ui"),
      false,
      "apps/web must not depend on @vianneytraina/ui until A9",
    );
  });

  it("publishes @vianneytraina/ui identity at 1.0.0", () => {
    const ui = readJson("packages/ui/package.json");
    assert.equal(ui.name, "@vianneytraina/ui");
    assert.equal(ui.version, "1.0.0");
    assert.equal(ui.private, false);
    assert.equal(ui.author, "Vianney Traina");
    assert.equal(ui.license, "MIT");
    assert.equal(
      ui.description,
      "Composants React accessibles et tokens de design distribués en package versionné, extraits de TeamPlanificateur.",
    );
    assert.equal(
      ui.homepage,
      "https://github.com/VianneyDev/TeamPlanificateur/tree/master/packages/ui",
    );
    assert.deepEqual(ui.repository, {
      type: "git",
      url: "git+https://github.com/VianneyDev/TeamPlanificateur.git",
      directory: "packages/ui",
    });
    assert.deepEqual(ui.publishConfig, { access: "public" });
  });
});
