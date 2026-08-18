# Design system package `exports` (flat, types first)

The published design system is **`@vianneytraina/ui`** (directory `packages/ui`). It is ESM-only. Its public surface is the `exports` map, not legacy entry fields.

## Decision

```json
{
  "name": "@vianneytraina/ui",
  "type": "module",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "default": "./dist/index.js"
    },
    "./styles.css": "./dist/index.css"
  }
}
```

- Conditional object is **flat**: `types`, then `import`, then `default`.
- Top-level `"types"` is kept (npm TS badge; fallback if a tool ignores `exports`).
- No `"main"`. No `"module"`.

The public JS API is **only named re-exports** in `src/index.ts`. No `export *`. No `index.ts` in a component folder; the barrel imports the file module:

```ts
export { Button } from "./components/Button/Button";
export type { ButtonProps } from "./components/Button/Button";
```

Component modules (`Button.tsx`, etc.) use **named exports only** (`export function Button`). No `export default` there.

`*.stories.tsx` **keep** a default export: CSF3 requires it as the meta object. Individual stories in those files stay named exports. Banning default in all of `src/` would break Storybook.

`export *` makes the public surface implicit: you cannot read the barrel and know what the package exposes. A10 removes a public prop and announces a breaking change; that requires a one-file readable API. Named barrel lines are also the diff shown in the CHANGELOG.

A default export is **renamable at import** (`import Foo from '…'`). The component name is part of the design-system public contract: it is what makes a consumer code search or a codemod possible. A10 announces a breaking change on `Button`, so `Button` must be a stable, searchable identifier, not a local binding.

A per-component `index.ts` is an extra graph node where `export *` can reach a colocated story. dts exclude does not stop the JS graph (ADR-0011).

Colocated `*.stories.tsx` under `src/` are not public: they are not on the barrel, not in `exports`, and not reachable from the tsup entry. `exports` encapsulates runtime specifiers; the barrel is the authoring rule that stops stories from entering the graph.

### `exports` vs `files`

Two different encapsulations:

| Field | Encapsulates | Effect |
|---|---|---|
| `exports` | What is **importable** by specifier | Unlisted subpaths throw `ERR_PACKAGE_PATH_NOT_EXPORTED` |
| `files` | What is **shipped** in the npm tarball | Unlisted paths are omitted from `pnpm pack` / `npm publish` |

A file can be in the tarball and still not be importable by its on-disk path. That is `dist/index.css`: it is packed, but consumers reach it only via `./styles.css`.

```json
{
  "files": ["dist", "README.md", "LICENSE"]
}
```

`package.json` is always packed; it must not be listed. `src/`, Storybook, and build config are omitted.

- **README.md** is required in `files` so npm renders the package page from the shipped README. That page is an A11 proof; a package without a README demonstrates nothing.
- **LICENSE** lives at `packages/ui/LICENSE`, a **copy** of the repo-root MIT (same copyright). `pnpm pack` does not walk above the package; `files` must not use `../../LICENSE`.

### npm registry identity (A11 page)

Frozen `packages/ui/package.json` identity:

```json
{
  "name": "@vianneytraina/ui",
  "private": false,
  "author": "Vianney Traina",
  "license": "MIT",
  "description": "Composants React accessibles et tokens de design distribués en package versionné, extraits de TeamPlanificateur.",
  "homepage": "https://github.com/VianneyDev/TeamPlanificateur/tree/master/packages/ui",
  "repository": {
    "type": "git",
    "url": "https://github.com/VianneyDev/TeamPlanificateur.git",
    "directory": "packages/ui"
  },
  "publishConfig": {
    "access": "public"
  }
}
```

`repository.directory` is what makes the npm “Repository” link open the monorepo **subfolder**, not the repo root. The npm page is an A11 proof; these fields are what make that page readable.

The npm scope `@vianneytraina` is the npm account (create it if missing). A scoped package is **private by default** on npm. The first publish without public access fails with a paid-plan error.

Do **not** rely on remembering `npm publish --access public`. Set `"publishConfig": { "access": "public" }` on the package so access does not depend on the CLI invocation. Changesets `access: public` (ADR-0012) must match; `publishConfig` is the source of truth if someone publishes without Changesets.

**A7 acceptance:** `packages/ui/package.json` has `"publishConfig": { "access": "public" }` and `"private": false` (ADR-0012). A dry-run or first publish must not require a paid private-package plan. Missing `publishConfig` fails A7 even if someone used `--access public` once locally. `"private": true` must make publish **fail with an explicit error** (npm will not publish a private package), not succeed silently as a restricted/unlisted package.

The CSS **public** specifier is `./styles.css` (what consumers write). The **on-disk** target is tsup’s sibling file `./dist/index.css` today (ADR-0011). That mapping may change (e.g. Vite library mode) without changing the import consumers use.

## Rationale

Node treats key order as significant. Community condition `"types"` must come first; `"default"` must come last ([Node.js packages](https://nodejs.org/api/packages.html#conditional-exports), [community conditions](https://nodejs.org/api/packages.html#community-conditions-definitions)). TypeScript 4.7 states the same for `"types"`.

`exports` takes precedence over `"main"` when both exist. For a new ESM-only package, Node recommends `exports`. `"module"` is not a Node field.

Once `exports` exists, unspecified subpaths are encapsulated. The CSS file must be listed or `import '@vianneytraina/ui/styles.css'` fails.

`./styles.css` is a public contract, not a copy of the bundler output name. Collapsing the specifier onto `index.css` would couple consumers to tsup’s sibling-file convention and force a breaking import change if the build moves to Vite library mode (or any other CSS emit path).

Consumers **must** import the CSS themselves. tsup with `injectStyle: false` (ADR-0011) emits a sibling file; it does not inject `<style>` at runtime. Runtime injection is rejected (no runtime CSS injection): unhydrated Astro islands would have no styles (FOUC / missing CSS). The package README must state this, in these terms:

```js
import "@vianneytraina/ui/styles.css";
```

once, in the Astro layout (not per island). Omitting it is the first reason “the DS does not show up” after install.

**A9 acceptance:** `apps/web` includes exactly one `import '@vianneytraina/ui/styles.css'` in the layout. Missing that import fails A9 even if the JS package is declared and islands render.

## Alternatives not taken

- **Nested** `"import": { "types", "default" }` (TypeScript 4.7 dual-package example). Valid; unused because this package is ESM-only, not dual CJS/ESM.
- **Keep `"main"`** beside `exports` (Node fallback for Node 10 / old tools). Rejected: consumers are Astro 5 / modern bundlers.
- **Keep `"module"`** for old bundlers. Rejected: not in the Node spec; modern bundlers read `exports`.
- **Public specifier `./index.css`** (match tsup output). Rejected: leaks the bundler filename into the package contract.
- Unscoped name (`vianneytraina-ui`). Rejected: scope is the npm account; matches the public-package proof.
- Relying only on `npm publish --access public`. Rejected: a scoped package is private by default; forgetting the flag fails with a paid-plan error. `publishConfig.access` is in the artefact.
- `export *` from `src/index.ts`. Rejected: public API becomes implicit; A10 breaking changes and CHANGELOG diffs need a one-file named surface.
- Per-component `index.ts`. Rejected: extra graph node where `export *` can pull a colocated story into the tsup JS graph.
- `export default` on component modules. Rejected: the public name is no longer a stable identifier (A10 / consumer search / codemod). CSF3 story **meta** remains default; that exception is not a component export.
