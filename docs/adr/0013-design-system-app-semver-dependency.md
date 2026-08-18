# App depends on the published design system, not the workspace

`apps/web` must consume the npm artefact of the design system, not a local workspace link. That is the point of the packaging work.

## Decision

- `link-workspace-packages=false` (pnpm). A bare semver range resolves from the registry ([pnpm workspaces](https://pnpm.io/workspaces)).
- Do **not** use the `workspace:` protocol on this dependency.
- `apps/web` declares **no** dependency on the design system until issue A9.
- Until A9, the only in-repo consumer is Storybook **inside** `packages/ui` (`.storybook/` at the package root; stories **colocated** as `*.stories.tsx` next to components under `src/`), importing **source** (not the package name, not `dist/`). Stories are not tsup entries (ADR-0011).
- A9, **after** `1.0.0` is on the registry: add `"@vianneytraina/ui": "^1.0.0"`.
- **A9 acceptance (CSS):** the Astro layout imports `'@vianneytraina/ui/styles.css'` **once** (ADR-0009). The JS entry does not inject CSS. Forgetting this import fails A9.
- Later range edits (A10 and after) are **manual deliverables**, written only **after** the target version is published. Changesets will not update this range (ADR-0012: the app is not in the release).

Operating rule: a naked semver range in `apps/web` may only name a version **already** on the registry.

## Rationale

`workspace:` would still symlink the local package when `link-workspace-packages` is false. That would prove a local link, not an npm install.

With the app absent from the dependency graph, `pnpm install` cannot fail on this package during DS development.

Changesets updates internal ranges only if the **dependent** is being released ([`updateInternalDependencies`](https://changesets.dev/guide/config)). The app is never released, so range bumps are manual by spec, not by neglect. Folding them into A9/A10 is the process that matches the tool.

## What this does not do

It does not rely on Changesets *avoiding* `ERR_PNPM_NO_MATCHING_VERSION`. That error appears when a range already points at a version the registry does not have yet. Changesets will not rewrite `apps/web`’s range (ADR-0012). The remaining way to create the error is a human (or A9/A10) writing the new range **before** publish. The operating rule above is what actually closes that window.

## Alternatives not taken

- `"workspace:^"` / `"workspace:*"` (option A). Local link; invalidates the “consumed from npm” proof.
- Declare `^1.0.0` in `apps/web` before the first publish. First `pnpm install` would request a missing registry version.
- Experimental `updateInternalDependents: "always"`. Would patch-bump the app and contradict ADR-0012.
