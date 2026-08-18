# Design system build: tsup ESM, dts, extracted CSS

`packages/ui` is built with tsup. The artefact is ESM JS, declaration files, and a sibling CSS file (not injected into JS). CSS reaches that sibling through a **single** JS entry that side-effect-imports the stylesheet (esbuild path A). One entry, one pipeline.

## Decision

```ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  injectStyle: false,
  splitting: false,
  tsconfig: "tsconfig.build.json",
});
```

No CSS-only tsup entry. No `publicDir` / `onSuccess` copy of CSS.

`src/index.ts` **must** contain a binding-free side-effect import whose only job is to feed esbuild:

```ts
// Side-effect import for tsup/esbuild (ADR-0011). Do not remove:
// it is the only reason dist/index.css is emitted. A linter or agent
// will see it as unused. Consumers still import '@vianneytraina/ui/styles.css'
// themselves (ADR-0009). ADR-0010 (`sideEffects: ["*.css"]`) is the
// consumer-side counterpart: it stops *their* bundler dropping that
// CSS import. This source import never ships as `src/`; it is baked
// in at package build time.
import "./styles.css";
```

Removing that import silently yields JS+d.ts and **no** `index.css`. Nothing else in the tsup config would fail the build.

No `external` field. That choice is valid **only** because ADR-0014 puts `react` and `react-dom` in `peerDependencies` (tsup always excludes `dependencies` and `peerDependencies`). ADR-0014 is a prerequisite of this ADR; dropping the peers without adding `external` would bundle React.

`injectStyle: false` is also the tsup default; it is set explicitly so a later default change cannot start injecting CSS. Runtime injection is rejected (no runtime CSS injection, ADR-0009): injected `<style>` on hydrated islands would leave unhydrated islands unstyled (FOUC / missing CSS).

`splitting: false` overrides the ESM default (`true`) so the JS public entry stays a single `dist/index.js` (plus sibling `dist/index.css` from esbuild). `./dist/index.css` is an implementation path. The public import remains `'@vianneytraina/ui/styles.css'` (ADR-0009); a later bundler (Vite library mode) may emit a different filename without changing that specifier.

### Storybook: colocated stories, not a public entry

- Config: `packages/ui/.storybook/` (package root).
- Stories: **colocated** with components, e.g. `src/components/Button/Button.stories.tsx` next to `Button.tsx`. Default Storybook convention. A separate `stories/` tree is the dominant failure mode (stories drift from the component).
- Stories import **source** (ADR-0013). `.stories.tsx` is not a public specifier. CSF3 **requires** a default export (meta); individual stories stay named. Component modules have no default (ADR-0009). The public API is **named** re-exports in `src/index.ts` only: no `export *`, no per-component `index.ts`. An agent treating a file under `src/` as exported is wrong unless it is listed on that barrel.

Build isolation (the real colocation risk):

- tsup `entry` remains `src/index.ts` only. No story file is reachable from that barrel (named exports to file modules only), so esbuild does not follow `.stories.tsx`.
- The **build** tsconfig (`tsconfig.build.json`, passed as tsup `tsconfig`) **excludes** `**/*.stories.tsx` and `**/*.test.tsx`, so `dts: true` does not emit declarations for them. Storybook typechecking uses a broader tsconfig that **includes** stories. One tsconfig that excludes stories would break Storybook; one that includes them would leak `.d.ts` into `dist/` if used by tsup. tsup `tsconfig` is therefore `"tsconfig.build.json"` (see snippet above).

### A4 acceptance (plumbing)

After `tsup`, `packages/ui/dist/` contains **exactly** three files:

- `index.js`
- `index.css`
- `index.d.ts`

No JS chunks, no extra CSS, no sourcemaps in `dist/`. Enabling `sourcemap` or `metafile` without moving those outputs out of `dist/` fails A4. **`dist/` contains no file whose name includes `.stories` or `.test`.**

Additionally:

- `index.js` must not contain `react` or `react-dom` as bundled modules (inspect `dist/` / a one-off metafile outside `dist/`). Presence of either fails A4, even if the tsup config matches the snippet above.
- `dist/index.css` exists, is **non-empty**, and contains **at least one** CSS custom-property declaration (`--*`) that originates from `src/styles.css`. This proves path A crossed esbuild into the sibling file. It does **not** check token names, layers, or themes. If `index.css` is missing, path A is broken and tsup still exits 0.
- Out-of-tree resolution: the packed artefact is importable from a folder **outside** the workspace (cadrage: consume from an external directory). Complements the in-repo `dist/` checks.
- `pnpm pack --dry-run` (from `packages/ui`) lists **exactly** `dist/**`, `README.md`, `LICENSE`, and `package.json`. No `src/`, no `.storybook/`, no `*.stories.tsx`, no test files, no build config (`tsup.config.*`, `tsconfig.json`, `tsconfig.build.json`, etc.). `files` is `["dist", "README.md", "LICENSE"]` (ADR-0009); npm always adds `package.json`. The `files` field already implies this; the explicit check documents that Storybook/tests must not ship.
- `packages/ui/LICENSE` exists, is MIT, and its copyright matches the repo-root `LICENSE`.
- `packages/ui/package.json` `name` is `"@vianneytraina/ui"`. It contains `"private": false` (ADR-0012), `author`, `license`, `repository` (with `"directory": "packages/ui"`), `homepage`, `description`, and `"publishConfig": { "access": "public" }` (ADR-0009). **`"private": true` fails A4.** Missing `directory` would point the npm “Repository” link at the monorepo root.
- `description` and `homepage` are non-empty strings, not `"TODO"` / placeholder text. `description` is between 60 and 150 characters (frozen value is 112).
- `src/index.ts` contains **no** `export *` (ADR-0009).
- No file under `src/components/` is named `index.ts`.
- No `export default` under `src/` except in `*.stories.tsx` (CSF3 meta).

### A3 acceptance (content)

A3 owns token **content**. After the same build:

- All three token levels are present in `dist/index.css`.
- The alternative theme reassigns at least two semantic tokens.

A3 and A4 validate each other: A4 without A3 can ship an empty-of-meaning `--*` plumbing file; A3 without A4 cannot prove those tokens survived the sibling emit.

The token list is A3’s deliverable (extracted from TeamPlanificateur). Names, layers, the component consumption rule, and the dark semantic reassignment live in **ADR-0015**. This ADR does not record that list.

Cadrage decisions are referenced by **title**. Repo ADRs are referenced by **docs/adr/ number**. Never the reverse (a cadrage “0003” is not an ADR id; repo ADR-0003 is Monthly Worked Days).

## Rationale

- `format`: tsup default is cjs; this package is ESM-only (ADR-0009).
- `dts: true`: emit `.d.ts` next to JS ([tsup](https://tsup.egoist.dev/)).
- `injectStyle: false` plus `import './styles.css'` in the JS entry: esbuild gathers CSS referenced from that entry into a sibling CSS file ([esbuild CSS](https://esbuild.github.io/content-types/#css)). Consumers still load it via the `./styles.css` export (ADR-0009). esbuild does not inject that sibling into the app.
- No `external`: redundant **given ADR-0014**; listing `external` would duplicate the peer list and drift from `package.json`. Without ADR-0014 this option is incorrect.

## Alternatives not taken

- `experimentalDts` / `--experimental-dts` (api-extractor). Not needed for a single ESM entry.
- `injectStyle: true`. Would embed CSS in JS and contradict no runtime CSS injection (ADR-0009; FOUC on unhydrated islands).
- CSS as a second tsup `entry` (path B) or copy via `publicDir` / `onSuccess` (path C). Extra pipeline; `dist/index.css` would no longer be the documented esbuild sibling of the JS entry.
- `splitting: true` (ESM default). Would emit extra chunks not listed in `exports`, and fail the A4 “exactly three files” check.
- Separate `packages/ui/stories/` (or `src/stories/`). Rejected: stories drift from components. Public-API leakage is prevented by the named barrel + `exports` (ADR-0009), not by keeping stories off `src/`.
- Per-component `index.ts` or `export *` from `src/index.ts`. Rejected: JS graph can reach a story; dts exclude does not help (ADR-0009).
- A single tsconfig that both Storybook and tsup use. Either stories leak into `dts` or Storybook cannot typecheck them.
- `external: ['react', 'react-dom']` **in addition to** ADR-0014. Harmless duplication; rejected to keep a single source of truth (`peerDependencies`).
