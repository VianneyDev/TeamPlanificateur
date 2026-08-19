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

  it("declares primitive --color-blue-500 as a literal palette step", () => {
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
    assert.equal(dark["--color-action-primary"], "var(--color-blue-600)");
    assert.equal(dark["--color-surface-canvas"], "var(--color-ops-canvas)");
    assert.equal(
      light["--color-action-primary"],
      dark["--color-action-primary"],
      "dark action-primary stays on --color-blue-600 so white text meets 4.5:1",
    );
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

function parseContrastPairs(adr) {
  const heading = /^### Contrast pairs \(WCAG AA\)\s*$/m;
  const split = adr.split(heading);
  assert.equal(split.length, 2, "ADR-0015 must declare a Contrast pairs (WCAG AA) section");
  const section = split[1].split(/^### /m)[0];
  const pairs = [];
  for (const line of section.split("\n")) {
    const cells = line
      .split("|")
      .map((cell) => cell.trim())
      .filter((cell) => cell.length > 0);
    if (cells.length < 3) continue;
    if (cells[0] === "Foreground") continue;
    if (/^:?-{3,}:?$/.test(cells[0])) continue;
    const foreground = cells[0].replace(/`/g, "");
    const background = cells[1].replace(/`/g, "");
    const minimum = Number.parseFloat(cells[2]);
    assert.equal(foreground.startsWith("--"), true, `contrast foreground must be a token, got ${cells[0]}`);
    assert.equal(background.startsWith("--"), true, `contrast background must be a token, got ${cells[1]}`);
    assert.equal(Number.isFinite(minimum), true, `contrast minimum must be a ratio, got ${cells[2]}`);
    pairs.push({ foreground, background, minimum });
  }
  assert.ok(pairs.length > 0, "ADR-0015 contrast table must list at least one pair");
  return pairs;
}

function namedForegroundPairs(tokenNames) {
  const names = new Set(tokenNames);
  const pairs = [];
  for (const name of tokenNames) {
    const base = name.endsWith("-foreground")
      ? name.slice(0, -"-foreground".length)
      : name.endsWith("-fg")
        ? name.slice(0, -"-fg".length)
        : null;
    if (base && names.has(base)) {
      pairs.push({ foreground: name, background: base });
    }
  }
  return pairs;
}

function terminalSemantic(props, name) {
  const seen = new Set();
  let current = name;
  while (!seen.has(current)) {
    seen.add(current);
    const value = props[current];
    const next = varTarget(value);
    if (next === null) return current;
    if (Object.hasOwn(props, next) && varTarget(props[next]) === null) {
      return current;
    }
    current = next;
  }
  assert.fail(`token cycle while resolving ${name}`);
}

function parseColor(value) {
  const hexMatch = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) {
      hex = [...hex].map((char) => char + char).join("");
    }
    return {
      r: Number.parseInt(hex.slice(0, 2), 16),
      g: Number.parseInt(hex.slice(2, 4), 16),
      b: Number.parseInt(hex.slice(4, 6), 16),
    };
  }

  const rgbMatch =
    /^rgba?\(\s*([\d.]+)\s*[, ]\s*([\d.]+)\s*[, ]\s*([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/i.exec(
      value,
    );
  if (rgbMatch) {
    const alpha =
      rgbMatch[4] == null
        ? 1
        : rgbMatch[4].endsWith("%")
          ? Number.parseFloat(rgbMatch[4]) / 100
          : Number.parseFloat(rgbMatch[4]);
    assert.equal(
      alpha,
      1,
      `contrast pairs must resolve to opaque colors, got ${value}`,
    );
    return {
      r: Number(rgbMatch[1]),
      g: Number(rgbMatch[2]),
      b: Number(rgbMatch[3]),
    };
  }

  assert.fail(`cannot parse color ${value}`);
}

function resolveColor(props, name) {
  const seen = new Set();
  let current = name;
  while (!seen.has(current)) {
    seen.add(current);
    const value = props[current];
    assert.ok(value, `${name} did not resolve: missing ${current}`);
    const next = varTarget(value);
    if (next === null) return parseColor(value);
    current = next;
  }
  assert.fail(`token cycle while resolving ${name}`);
}

function srgbToLinear(channel) {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(color) {
  return (
    0.2126 * srgbToLinear(color.r) +
    0.7152 * srgbToLinear(color.g) +
    0.0722 * srgbToLinear(color.b)
  );
}

function contrastRatio(foreground, background) {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

function semanticColorNames(props) {
  return Object.keys(props).filter(
    (name) => name.startsWith("--color-") && usesVar(props[name]),
  );
}

describe("design-system semantic contrast (A3b)", () => {
  it("declares a contrast target for every named semantic foreground/background pair", () => {
    const adr = readText("docs/adr/0015-design-system-tokens.md");
    const declared = parseContrastPairs(adr);
    const light = cascade(readText(TOKEN_CSS), isLightRoot);
    const names = semanticColorNames(light);

    const declaredTerminals = new Set(
      declared.map(
        (pair) =>
          `${terminalSemantic(light, pair.foreground)} ${terminalSemantic(light, pair.background)}`,
      ),
    );

    const declaredForegrounds = new Set(
      declared.map((pair) => terminalSemantic(light, pair.foreground)),
    );

    for (const pair of namedForegroundPairs(names)) {
      const key = `${terminalSemantic(light, pair.foreground)} ${terminalSemantic(light, pair.background)}`;
      assert.ok(
        declaredTerminals.has(key),
        `${pair.foreground} on ${pair.background} is a semantic pair without a declared contrast target in ADR-0015`,
      );
    }

    for (const name of names) {
      if (!/^--color-text-/.test(name)) continue;
      const terminal = terminalSemantic(light, name);
      assert.ok(
        declaredForegrounds.has(terminal),
        `${name} is a semantic text token without a declared contrast target in ADR-0015`,
      );
    }
  });

  it("meets WCAG AA contrast for every declared pair in light and dark themes", () => {
    const pairs = parseContrastPairs(readText("docs/adr/0015-design-system-tokens.md"));
    const css = readText(TOKEN_CSS);
    const themes = [
      { name: "light", props: cascade(css, isLightRoot) },
      {
        name: "dark",
        props: cascade(css, (selectors) => isLightRoot(selectors) || isDarkRoot(selectors)),
      },
    ];

    const failures = [];
    for (const theme of themes) {
      for (const pair of pairs) {
        const ratio = contrastRatio(
          resolveColor(theme.props, pair.foreground),
          resolveColor(theme.props, pair.background),
        );
        if (ratio + 1e-9 < pair.minimum) {
          failures.push(
            `${theme.name} ${pair.foreground} on ${pair.background}: ${ratio.toFixed(2)}:1 (need ${pair.minimum}:1)`,
          );
        }
      }
    }

    assert.equal(failures.length, 0, failures.join("\n"));
  });
});
