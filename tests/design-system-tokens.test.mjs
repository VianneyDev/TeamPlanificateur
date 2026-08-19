import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const TOKEN_CSS = "packages/ui/src/styles.css";

function readText(relativePath) {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

function customProperties(block) {
  const props = {};
  const re = /(--[A-Za-z0-9-]+)\s*:\s*([^;]+);/g;
  for (const match of stripComments(block).matchAll(re)) {
    props[match[1]] = match[2].trim();
  }
  return props;
}

function rules(css) {
  const source = stripComments(css);
  const result = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  for (const match of source.matchAll(re)) {
    result.push({
      selectors: match[1].trim(),
      props: customProperties(match[2]),
    });
  }
  return result;
}

function selectorList(selectors) {
  return selectors.split(",").map((part) => part.trim());
}

function cascade(css, predicate) {
  const props = {};
  for (const rule of rules(css)) {
    if (predicate(selectorList(rule.selectors))) {
      Object.assign(props, rule.props);
    }
  }
  return props;
}

function isLightRoot(selectors) {
  return selectors.some(
    (selector) => selector === ":root" || selector === ":root.light",
  );
}

function isDarkRoot(selectors) {
  return selectors.some((selector) => selector === ":root.dark");
}

function varTarget(value) {
  const match = /^var\((--[A-Za-z0-9-]+)\)$/.exec(value ?? "");
  return match ? match[1] : null;
}

function usesVar(value) {
  return varTarget(value) !== null;
}

function componentTokenNames(props) {
  return Object.keys(props).filter((name) =>
    /^--(button|text-field|label|dialog|select|dropdown-menu|badge)-/.test(name),
  );
}

describe("design-system token content (A3)", () => {
  it("ships a single source CSS file with no JS dependency", () => {
    const absolute = join(repoRoot, TOKEN_CSS);
    assert.equal(existsSync(absolute), true, `${TOKEN_CSS} must exist`);

    const css = readText(TOKEN_CSS);
    assert.ok(css.trim().length > 0, `${TOKEN_CSS} must not be empty`);
    const uncommented = stripComments(css);
    assert.doesNotMatch(uncommented, /<script\b/i);
    assert.doesNotMatch(uncommented, /\bimport\s+/);
    assert.doesNotMatch(uncommented, /\bexport\s+/);
    assert.doesNotMatch(uncommented, /\brequire\s*\(/);
  });

  it("documents primitive, semantic, and component levels", () => {
    const css = readText(TOKEN_CSS);
    assert.match(css, /primitive/i);
    assert.match(css, /semantic/i);
    assert.match(css, /component/i);
    assert.match(
      css,
      /components may use semantic or component-level tokens only, never primitives/i,
    );
  });

  it("declares primitive --color-blue-500 as the extracted TPE dark Operate Blue", () => {
    const light = cascade(readText(TOKEN_CSS), isLightRoot);
    assert.equal(light["--color-blue-500"], "#3b82f6");
    assert.equal(usesVar(light["--color-blue-500"]), false);
  });

  it("declares semantic --color-action-primary from a primitive in the light theme", () => {
    const light = cascade(readText(TOKEN_CSS), isLightRoot);
    assert.equal(light["--color-blue-600"], "#2563eb");
    assert.equal(light["--color-action-primary"], "var(--color-blue-600)");
  });

  it("declares component --button-bg-default from a semantic token", () => {
    const light = cascade(readText(TOKEN_CSS), isLightRoot);
    assert.equal(light["--button-bg-default"], "var(--color-action-primary)");
    const target = varTarget(light["--button-bg-default"]);
    assert.equal(usesVar(light[target]), true, "component tokens must not skip to a primitive");
  });

  it("reassigns at least two semantic tokens in the dark document-root theme", () => {
    const css = readText(TOKEN_CSS);
    const light = cascade(css, isLightRoot);
    const dark = cascade(css, (selectors) => isLightRoot(selectors) || isDarkRoot(selectors));

    const reassigned = Object.keys(light).filter((name) => {
      if (!name.startsWith("--color-")) return false;
      if (!usesVar(light[name])) return false;
      return dark[name] !== light[name];
    });

    assert.ok(
      reassigned.length >= 2,
      `dark theme must reassign at least two semantic tokens (got ${reassigned.join(", ") || "none"})`,
    );
    assert.equal(dark["--color-action-primary"], "var(--color-blue-500)");
    assert.equal(dark["--color-surface-canvas"], "var(--color-ops-canvas)");
    assert.notEqual(light["--color-action-primary"], dark["--color-action-primary"]);
    assert.notEqual(light["--color-surface-canvas"], dark["--color-surface-canvas"]);
  });

  it("does not reassign component tokens in the dark theme", () => {
    const css = readText(TOKEN_CSS);
    const light = cascade(css, isLightRoot);
    const darkOnly = cascade(css, isDarkRoot);
    const componentNames = componentTokenNames(light);

    assert.ok(componentNames.includes("--button-bg-default"));
    for (const name of componentNames) {
      assert.equal(
        Object.hasOwn(darkOnly, name),
        false,
        `${name} must follow semantic tokens instead of being reassigned in :root.dark`,
      );
    }
  });

  it("keeps component tokens off the primitive layer", () => {
    const light = cascade(readText(TOKEN_CSS), isLightRoot);
    const componentNames = componentTokenNames(light);

    for (const name of componentNames) {
      const value = light[name];
      if (!usesVar(value)) continue;
      const target = varTarget(value);
      assert.equal(
        usesVar(light[target]),
        true,
        `${name} points at ${target}, which is a primitive; components may use semantic or component-level tokens only, never primitives`,
      );
    }
  });

  it("records the extracted token list in ADR-0015, not ADR-0011", () => {
    const adr = readText("docs/adr/0015-design-system-tokens.md");
    assert.match(adr, /--color-blue-500/);
    assert.match(adr, /--color-action-primary/);
    assert.match(adr, /--button-bg-default/);
    assert.match(adr, /primitive/i);
    assert.match(adr, /semantic/i);
    assert.match(adr, /component/i);
    assert.match(
      adr,
      /components may use semantic or component-level tokens only, never primitives/i,
    );
    assert.match(adr, /:root\.dark/);
    assert.match(adr, /packages\/ui\/src\/styles\.css/);

    const bundlerAdr = readText("docs/adr/0011-design-system-tsup.md");
    assert.match(bundlerAdr, /ADR-0015/);
    assert.doesNotMatch(bundlerAdr, /--button-bg-default/);
  });
});
