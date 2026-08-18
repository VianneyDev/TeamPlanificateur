# Design system `sideEffects` preserves importable CSS

The design system ships JS that should tree-shake and a CSS file that must not be dropped when imported.

## Decision

```json
{
  "sideEffects": ["*.css"]
}
```

Not `false`. Not a list of JS files.

This protects the **consumer** import `import '@vianneytraina/ui/styles.css'` (ADR-0009, A9). That import has no binding, so a consumer bundler with `sideEffects: false` inferred would drop it.

It is the counterpart of the **source** side-effect `import './styles.css'` in `packages/ui/src/index.ts` (ADR-0011). That source import feeds tsup/esbuild at package build time; it is not what the app tree-shakes. A linter/agent deleting it is stopped by the comment in `src/index.ts`, not by this field. If tsup leaves a CSS import in `dist/index.js`, this field covers that too.

## Rationale

webpack’s `package.json` `"sideEffects"` marks which files have side effects. `false` means every module is pure: an import with no used exports can be pruned. A CSS import typically has no exports, so `sideEffects: false` drops it in production ([webpack tree shaking](https://webpack.js.org/guides/tree-shaking/)).

The documented form for “JS is shakable, CSS is not” is an array of CSS globs. webpack treats a pattern without `/` (`*.css`) as `**/*.css`.

## Alternatives not taken

- `"**/*.css"` appears later on the same webpack page. Equivalent under webpack’s glob rule; `*.css` is the form in the CSS-specific note.
- Listing only `./dist/index.css`. More precise, more brittle if tsup emits additional CSS.
