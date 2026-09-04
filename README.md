# TeamPlanificateur

Team Planning Engine is a team planning tool for one organisation: rest-day calendars, worked days for external members, and a leave-request approval workflow.

This repository is also a pnpm monorepo that publishes [`@vianneytraina/ui`](https://www.npmjs.com/package/@vianneytraina/ui), a public ESM design-system package extracted from the product UI.

## Architecture

```text
apps/web          Team Planning Engine (private Astro app, never published)
packages/ui       @vianneytraina/ui (public ESM package on npm)
```

The app consumes the published package from the registry (`^2.0.0`). It does not use a `workspace:` link. The app imports `'@vianneytraina/ui/styles.css'` once in the Astro layout. The JavaScript entry does not inject CSS at runtime.

Product behaviour (Acting Member cookie, Leave Requests, Team Calendar, Monthly Worked Days) lives in `apps/web`. The package is presentational only: tokens, Button, TextField, Label, Badge, Dialog, Select, and DropdownMenu.

## Design system

This sits next to an in-house design-system contribution elsewhere. What this repository adds is a packaged, distributed system: semantic versioning, a public npm artefact, visual and accessibility gates in CI, and a breaking change taken through this app.

The only consumer is Team Planning Engine in this repository. No other team uses `@vianneytraina/ui` in production. The v2 Button migration (`variant` to `intent` + `emphasis`) is this app workspace only.

### Four proofs

| Proof | What you can open without running the repo |
| --- | --- |
| Semantic versioning | [npm version history](https://www.npmjs.com/package/@vianneytraina/ui?activeTab=versions) (`1.0.0`, `1.1.0`, `2.0.0`) and the generated [`packages/ui/CHANGELOG.md`](packages/ui/CHANGELOG.md) |
| Breaking-change management | [`2.0.0` changelog](packages/ui/CHANGELOG.md) and the mapping table in [`packages/ui/README.md`](packages/ui/README.md). App range bump is a separate commit after publish. |
| Visual-regression prevention | CI that failed on an intentional Badge capture diff, then passed after explicit snapshot acceptance. Pixel captures in [`docs/proofs/`](docs/proofs/). |
| Accessibility in CI | The same Storybook Playwright job runs `@axe-core/playwright` and fails on critical or serious violations. |

Captures and live URLs: [`docs/proofs/`](docs/proofs/).

### Frozen decisions

These eight decisions are the packaging contract. Justifications stay short; the ADRs are the source of truth.

1. **Public ESM exports** - TypeScript, Node, and npm must resolve one surface: a named JS entry plus a CSS specifier. That specifier can retarget if the bundler changes. [ADR-0009](docs/adr/0009-design-system-exports.md).
2. **No runtime CSS injection** - Injected `<style>` would style hydrated islands and leave static Astro islands unstyled. The app loads the CSS itself, once. [ADR-0009](docs/adr/0009-design-system-exports.md).
3. **`sideEffects` keeps the CSS import** - A binding-free CSS import is otherwise tree-shaken away. [ADR-0010](docs/adr/0010-design-system-side-effects.md).
4. **tsup, with Vite library mode as the alternative** - tsup emits ESM, types, and a sibling CSS file from one JS entry. tsup is not actively maintained; Vite library mode is the identified alternative if that becomes a blocker. [ADR-0011](docs/adr/0011-design-system-tsup.md).
5. **Changesets versions the package, never the app** - The app is private and stays out of the release. [ADR-0012](docs/adr/0012-design-system-changesets.md).
6. **The app installs from the registry** - A workspace symlink would only prove a local link. Ranges name versions that already exist on npm. [ADR-0013](docs/adr/0013-design-system-app-semver-dependency.md).
7. **React is a peer, not bundled** - Two Reacts in one island tree break hooks. Peer range is `>=18`. [ADR-0014](docs/adr/0014-design-system-react-peers.md).
8. **Three-level tokens in one CSS file** - Primitive, semantic, and component custom properties, no Style Dictionary, no JS theme module. Components never reference primitives. [ADR-0015](docs/adr/0015-design-system-tokens.md).

Dialog, Select, and DropdownMenu wrap Radix. Button, TextField, Label, and Badge do not. Why, and what that costs, is [ADR-0016](docs/adr/0016-radix-primitives.md).

## Stack

Astro (islands) · React · Hono (API) · Prisma · PostgreSQL / Neon · TypeScript · Vitest · pnpm workspaces · Storybook · Playwright

## Notable technical points

- API tests at the Hono seam (`app.request`), isolated on a dedicated Neon branch
- GitHub Actions CI: ephemeral Neon branch per PR, deleted on merge
- Blocking ESLint, typecheck, and build on every PR
- Storybook visual baselines generated in the official Playwright Docker image; axe fails the same job on critical or serious violations
- Astro islands + React architecture (SSR pages, interactive client islands)
- Architecture decisions recorded in [`docs/adr/`](docs/adr/)

## Getting started

**Prerequisites:** Node 22, [pnpm](https://pnpm.io/), and a [Neon](https://neon.tech/) PostgreSQL database.

```sh
pnpm install
# Set DATABASE_URL in apps/web/.env to your Neon connection string
pnpm dev
```

The app runs at `http://localhost:4321`. Leave `DEMO_RESET_ENABLED` unset locally so the nightly demo reset and its banner stay off.

Production Cloud Run also uses `DEMO_RESET_ENABLED` and `DEMO_RESET_TOKEN` (see [docs/deploiement-gcp.md](docs/deploiement-gcp.md)).

## Commands

All commands are run from the root of the project, from a terminal:

| Command                       | Action                                           |
| :---------------------------- | :----------------------------------------------- |
| `pnpm install`                | Installs dependencies                            |
| `pnpm dev`                    | Starts local dev server at `localhost:4321`      |
| `pnpm build`                  | Build your production site to `./apps/web/dist/` |
| `pnpm preview`                | Preview your build locally, before deploying     |
| `pnpm astro ...`              | Run CLI commands like `astro add`, `astro check` |
| `pnpm astro -- --help`        | Get help using the Astro CLI                     |
| `pnpm typecheck`              | TypeScript check (`tsc --noEmit`)                |
| `pnpm lint`                   | ESLint (narrow correctness rules; Astro + React) |
| `pnpm test` / `pnpm test:api` | Run Vitest (API tests against Neon test branch)  |
| `pnpm test:ssr`               | CSRF/origin checks against the built Node server |
| `pnpm test:ui`                | UI package unit tests                            |
| `pnpm test:storybook`         | Visual + axe against the built Storybook         |
| `pnpm --filter @vianneytraina/ui storybook` | Component catalog at `localhost:6006` |
| `pnpm db:migrate:test`        | Apply Prisma migrations to the Neon test branch  |

## Deployment (GCP)

Cloud Run, Secret Manager, GCS recap bucket, IAM, and Cloud Scheduler: [docs/deploiement-gcp.md](docs/deploiement-gcp.md).

## Tests & database isolation

API tests use a **dedicated Neon branch**, not the dev database from `.env`.

1. Copy `apps/web/.env.test.example` → `apps/web/.env.test` and set `DATABASE_URL` to your Neon test branch.
2. Apply the schema once (and after new migrations): `pnpm db:migrate:test`
3. Run `pnpm test` - Vitest loads `apps/web/.env.test` via `apps/web/tests/setup-env.ts` and refuses to run if that URL targets the same Neon endpoint as `apps/web/.env`.

`.env.test` is gitignored. See [docs/adr/0002-test-database-neon-branch.md](docs/adr/0002-test-database-neon-branch.md).

`pnpm test:ssr` starts the compiled Node server (`apps/web/dist/server/entry.mjs`). Run `pnpm build` first. It does not use the database.

## CI

PRs run [`.github/workflows/ci.yml`](.github/workflows/ci.yml):

1. **Lint, typecheck & build** (no database) - `pnpm lint`, `pnpm typecheck`, `pnpm build`, then `pnpm test:ssr` against `dist/server/entry.mjs`
2. **Storybook visual and accessibility** - build the static catalog, compare screenshots to Docker-generated baselines, fail on critical or serious axe violations. A `workflow_dispatch` input (`update_snapshots`) regenerates baselines after an intentional visual change.
3. **API tests** - create an ephemeral Neon branch `preview/pr-<number>-<branch>`, apply Prisma migrations with the **direct (unpooled)** connection string, then `pnpm test`
4. **Cleanup** - on PR close, delete that Neon branch (required to stay under Neon branch quotas)

**Prerequisite:** install the [Neon GitHub Integration](https://neon.tech/docs/guides/neon-github-integration) on this repo so `NEON_API_KEY` (secret) and `NEON_PROJECT_ID` (variable) exist. Without them, the test and cleanup jobs fail.

## Architecture decisions

Design choices are recorded as ADRs under [`docs/adr/`](docs/adr/). Notable examples:

- [Cookie-based identity (V1)](docs/adr/0001-v1-identity-selected-member.md) - acting member via `selectedMemberId` cookie, no real login yet
- [Test isolation via Neon branch](docs/adr/0002-test-database-neon-branch.md) - API tests never touch the dev database
- [Leave-request approval workflow (V2)](docs/adr/0004-v2-day-off-approval.md) - members submit requests; managers approve or reject
- [Design-system packaging](docs/adr/0009-design-system-exports.md) through [ADR-0016](docs/adr/0016-radix-primitives.md) - exports, CSS, tsup, Changesets, registry consumption, React peers, tokens, Radix wrappers

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
