# Design system React peers, not bundled React

`packages/ui` is a React library consumed by an Astro app with React islands. It must use the consumer’s React, not ship its own.

## Decision

`packages/ui` `package.json`:

```json
{
  "peerDependencies": {
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0"
  },
  "devDependencies": {
    "react": "<same as apps/web>",
    "react-dom": "<same as apps/web>",
    "@types/react": "<same as apps/web>",
    "@types/react-dom": "<same as apps/web>"
  }
}
```

- `react` and `react-dom` are **peerDependencies** only. Neither appears in `dependencies`.
- Peer ranges are `>=18.0.0`, not `^19.0.0`. Nothing in the DS requires a React 19 API yet. If a component later needs one, tighten the peer range in the **same** major Changeset as that component.
- `@types/react` and `@types/react-dom` are **devDependencies** only, not peers. Types resolve in the consumer’s tree. Declaring them as peers warns pnpm users who did not add `@types/*` explicitly, and adds no extra guarantee.
- Dev ranges for `react`, `react-dom`, and both `@types` packages **mirror `apps/web`** (`apps/web/package.json`: `react` / `react-dom` `^19.2.3`, `@types/react` `^19.2.8`, `@types/react-dom` `^19.2.3`). Update `packages/ui` when `apps/web` moves.

This ADR is a **prerequisite** of ADR-0011: tsup has no `external` field, which only keeps React out of the bundle if these peers exist ([tsup excluding packages](https://tsup.egoist.dev/)). If this ADR is reverted, ADR-0011 must gain `external: ['react', 'react-dom']` or React will be bundled.

## Rationale

Two Reacts in one island tree break hooks. tsup bundles everything except `dependencies` and `peerDependencies`. Peers are the contract; `devDependencies` exist so the package can typecheck and run Storybook.

A `^19` peer would reject a React 18 consumer for no DS reason. `>=18` stays honest until an actual 19-only API ships.

## Alternatives not taken

- `^19.0.0` peers. Would lock out React 18 without a code reason.
- `@types/react` / `@types/react-dom` as `peerDependencies`. pnpm peer warning for consumers who rely on types bundled with their React toolchain; types already resolve from the app.
- React in `dependencies`. Would install a second copy for consumers and still bundle it unless also externalised.
- `external` in tsup **instead of** peers. Would keep React out of *this* bundle but would not declare the runtime contract on npm.
