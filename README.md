# TeamPlanificateur

Team planning tool for workforce management: rest-day calendars, worked days for external members, and a leave-request approval workflow.

## Stack

Astro (islands) · React · Hono (API) · Prisma · PostgreSQL / Neon · TypeScript · Vitest

## Notable technical points

- API tests at the Hono seam (`app.request`), isolated on a dedicated Neon branch
- GitHub Actions CI: ephemeral Neon branch per PR, deleted on merge
- Blocking ESLint, typecheck, and build on every PR
- Astro islands + React architecture (SSR pages, interactive client islands)
- Architecture decisions recorded in [`docs/adr/`](docs/adr/)

## Getting started

**Prerequisites:** Node 22, [pnpm](https://pnpm.io/), and a [Neon](https://neon.tech/) PostgreSQL database.

```sh
pnpm install
# Set DATABASE_URL in apps/web/.env to your Neon connection string
pnpm dev
```

The app runs at `http://localhost:4321`.

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
| `pnpm db:migrate:test`        | Apply Prisma migrations to the Neon test branch  |

## Tests & database isolation

API tests use a **dedicated Neon branch**, not the dev database from `.env`.

1. Copy `apps/web/.env.test.example` → `apps/web/.env.test` and set `DATABASE_URL` to your Neon test branch.
2. Apply the schema once (and after new migrations): `pnpm db:migrate:test`
3. Run `pnpm test` - Vitest loads `apps/web/.env.test` via `apps/web/tests/setup-env.ts` and refuses to run if that URL targets the same Neon endpoint as `apps/web/.env`.

`.env.test` is gitignored. See [docs/adr/0002-test-database-neon-branch.md](docs/adr/0002-test-database-neon-branch.md).

## CI

PRs run [`.github/workflows/ci.yml`](.github/workflows/ci.yml):

1. **Lint, typecheck & build** (no database) - `pnpm lint`, `pnpm typecheck`, `pnpm build`
2. **API tests** - create an ephemeral Neon branch `preview/pr-<number>-<branch>`, apply Prisma migrations with the **direct (unpooled)** connection string, then `pnpm test`
3. **Cleanup** - on PR close, delete that Neon branch (required to stay under Neon branch quotas)

**Prerequisite:** install the [Neon GitHub Integration](https://neon.tech/docs/guides/neon-github-integration) on this repo so `NEON_API_KEY` (secret) and `NEON_PROJECT_ID` (variable) exist. Without them, the test and cleanup jobs fail.

## Architecture decisions

Design choices are recorded as ADRs under [`docs/adr/`](docs/adr/). Notable examples:

- [Cookie-based identity (V1)](docs/adr/0001-v1-identity-selected-member.md) - acting member via `selectedMemberId` cookie, no real login yet
- [Test isolation via Neon branch](docs/adr/0002-test-database-neon-branch.md) - API tests never touch the dev database
- [Leave-request approval workflow (V2)](docs/adr/0004-v2-day-off-approval.md) - members submit requests; managers approve or reject

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
