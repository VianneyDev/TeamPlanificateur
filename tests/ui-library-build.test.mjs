import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  globSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

function readText(relativePath) {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

describe("UI library package contract (A4)", () => {
  it("exposes a types-first ESM exports map and ships only the published files", () => {
    const ui = readJson("packages/ui/package.json");

    assert.equal(ui.type, "module");
    assert.equal(ui.types, "./dist/index.d.ts");
    assert.equal(ui.main, undefined);
    assert.equal(ui.module, undefined);
    assert.deepEqual(ui.files, ["dist", "README.md", "LICENSE"]);
    assert.deepEqual(ui.exports, {
      ".": {
        types: "./dist/index.d.ts",
        import: "./dist/index.js",
        default: "./dist/index.js",
      },
      "./styles.css": "./dist/index.css",
    });
    assert.deepEqual(Object.keys(ui.exports["."]), [
      "types",
      "import",
      "default",
    ]);
  });

  it("marks CSS as the only side effect and keeps React as peers", () => {
    const ui = readJson("packages/ui/package.json");
    const app = readJson("apps/web/package.json");

    assert.deepEqual(ui.sideEffects, ["*.css"]);
    assert.deepEqual(ui.peerDependencies, {
      react: ">=18.0.0",
      "react-dom": ">=18.0.0",
    });
    assert.equal(ui.dependencies?.react, undefined);
    assert.equal(ui.dependencies?.["react-dom"], undefined);
    assert.equal(ui.peerDependencies?.["@types/react"], undefined);
    assert.equal(ui.peerDependencies?.["@types/react-dom"], undefined);
    assert.equal(ui.devDependencies.react, app.dependencies.react);
    assert.equal(ui.devDependencies["react-dom"], app.dependencies["react-dom"]);
    assert.equal(ui.devDependencies["@types/react"], app.dependencies["@types/react"]);
    assert.equal(
      ui.devDependencies["@types/react-dom"],
      app.dependencies["@types/react-dom"],
    );
  });

  it("builds with the ADR-0011 tsup config and a dedicated build tsconfig", () => {
    const config = readText("packages/ui/tsup.config.ts");
    const buildTsconfig = readJson("packages/ui/tsconfig.build.json");

    assert.match(config, /from ["']tsup["']/);
    assert.match(config, /entry:\s*\[["']src\/index\.ts["']\]/);
    assert.match(config, /format:\s*\[["']esm["']\]/);
    assert.match(config, /dts:\s*true/);
    assert.match(config, /injectStyle:\s*false/);
    assert.match(config, /splitting:\s*false/);
    assert.match(config, /tsconfig:\s*["']tsconfig\.build\.json["']/);
    assert.doesNotMatch(config, /\bexternal\s*:/);
    assert.doesNotMatch(config, /\bpublicDir\s*:/);
    assert.doesNotMatch(config, /\bonSuccess\s*:/);

    assert.ok(
      Array.isArray(buildTsconfig.exclude) &&
        buildTsconfig.exclude.includes("**/*.stories.tsx") &&
        buildTsconfig.exclude.includes("**/*.test.tsx"),
      "tsconfig.build.json must exclude stories and tests from dts emit",
    );
  });

  it("keeps a named barrel and a plumbing stylesheet with a custom property", () => {
    const barrel = readText("packages/ui/src/index.ts");
    const css = readText("packages/ui/src/styles.css");
    const componentIndexes = globSync("src/components/**/index.ts", {
      cwd: join(repoRoot, "packages/ui"),
    });
    const defaultExports = globSync("src/**/*.{ts,tsx}", {
      cwd: join(repoRoot, "packages/ui"),
    }).filter((relativePath) => !relativePath.endsWith(".stories.tsx"));

    assert.match(barrel, /import ["']\.\/styles\.css["']/);
    assert.doesNotMatch(barrel, /\bexport\s+\*/);
    assert.deepEqual(componentIndexes, []);

    for (const relativePath of defaultExports) {
      const source = readText(join("packages/ui", relativePath));
      assert.doesNotMatch(
        source,
        /^export\s+default\b/m,
        `${relativePath} must not default-export (CSF3 stories excepted)`,
      );
    }

    assert.match(css, /--[A-Za-z][\w-]*/);
  });
});

describe("UI library build artefact (A4)", { concurrency: 1 }, () => {
  before(() => {
    rmSync(join(repoRoot, "packages/ui/dist"), { recursive: true, force: true });
    execFileSync("pnpm", ["--filter", "@vianneytraina/ui", "build"], {
      cwd: repoRoot,
      stdio: "pipe",
    });
  });

  it("emits exactly three dist files with sibling CSS and no bundled React", () => {
    const distDir = join(repoRoot, "packages/ui/dist");
    const distFiles = readdirSync(distDir).sort();
    const sourceCss = readText("packages/ui/src/styles.css");
    const distCss = readText("packages/ui/dist/index.css");
    const distJs = readText("packages/ui/dist/index.js");
    const sourceCustomProperties = [
      ...sourceCss.matchAll(/--[A-Za-z][\w-]*/g),
    ].map((match) => match[0]);

    assert.deepEqual(distFiles, ["index.css", "index.d.ts", "index.js"]);
    assert.ok(distCss.trim().length > 0, "dist/index.css must be non-empty");
    assert.ok(
      sourceCustomProperties.some((property) => distCss.includes(property)),
      "dist/index.css must contain a custom property from src/styles.css",
    );
    assert.doesNotMatch(distJs, /__SECRET_INTERNALS_DO_NOT_USE/);
    assert.doesNotMatch(distJs, /react\.production\.min/);
    assert.ok(
      !distFiles.some((name) => name.includes(".stories") || name.includes(".test")),
    );
  });

  it("packs only dist, README, LICENSE, and package.json", () => {
    assert.equal(
      readText("packages/ui/LICENSE"),
      readText("LICENSE"),
      "packages/ui/LICENSE must copy the repo-root MIT copyright",
    );

    const packDir = mkdtempSync(join(tmpdir(), "ui-a4-pack-"));
    try {
      execFileSync("pnpm", ["pack", "--pack-destination", packDir], {
        cwd: join(repoRoot, "packages/ui"),
        stdio: "pipe",
      });
      const tarball = globSync("*.tgz", { cwd: packDir })[0];
      assert.ok(tarball, "pnpm pack must emit a tarball");

      const packed = execFileSync("tar", ["tzf", join(packDir, tarball)], {
        encoding: "utf8",
      })
        .split("\n")
        .map((line) => line.trim().replace(/^package\//, ""))
        .filter((entry) => entry.length > 0 && !entry.endsWith("/"))
        .sort();

      assert.deepEqual(packed, [
        "LICENSE",
        "README.md",
        "dist/index.css",
        "dist/index.d.ts",
        "dist/index.js",
        "package.json",
      ]);
    } finally {
      rmSync(packDir, { recursive: true, force: true });
    }
  });

  it("resolves the JS entry and CSS public specifier from outside the workspace", () => {
    const probeRoot = mkdtempSync(join(tmpdir(), "ui-a4-resolve-"));

    try {
      const packOutput = execFileSync(
        "pnpm",
        ["pack", "--pack-destination", probeRoot],
        {
          cwd: join(repoRoot, "packages/ui"),
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"],
        },
      );
      const tarballName = packOutput
        .trim()
        .split("\n")
        .filter((line) => line.endsWith(".tgz"))
        .at(-1)
        ?.trim()
        .split("/")
        .at(-1);
      assert.ok(tarballName?.endsWith(".tgz"), `expected a tarball, got ${packOutput}`);
      const tarballPath = join(probeRoot, tarballName);

      const consumer = join(probeRoot, "consumer");
      mkdirSync(consumer);
      writeFileSync(
        join(consumer, "package.json"),
        JSON.stringify({
          name: "ui-resolution-probe",
          private: true,
          type: "module",
        }),
      );
      execFileSync("npm", ["install", "--ignore-scripts", tarballPath, "react@19", "react-dom@19"], {
        cwd: consumer,
        stdio: "pipe",
      });

      writeFileSync(
        join(consumer, "probe.mjs"),
        `\
import { Button, TextField, Label } from "@vianneytraina/ui";
const js = import.meta.resolve("@vianneytraina/ui");
const css = import.meta.resolve("@vianneytraina/ui/styles.css");
if (!Button || !TextField || !Label) {
  throw new Error("named exports Button, TextField, Label must be present");
}
if (!js.endsWith("/dist/index.js")) {
  throw new Error("JS entry did not resolve to dist/index.js: " + js);
}
if (!css.endsWith("/dist/index.css")) {
  throw new Error("CSS specifier did not resolve to dist/index.css: " + css);
}
`,
      );

      execFileSync("node", ["probe.mjs"], {
        cwd: consumer,
        stdio: "pipe",
      });
    } finally {
      rmSync(probeRoot, { recursive: true, force: true });
    }
  });
});
