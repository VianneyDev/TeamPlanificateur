# Astro Starter Kit: Basics

```sh
pnpm create astro@latest -- --template basics
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src
│   ├── assets
│   │   └── astro.svg
│   ├── components
│   │   └── Welcome.astro
│   ├── layouts
│   │   └── Layout.astro
│   └── pages
│       └── index.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `pnpm install`             | Installs dependencies                            |
| `pnpm dev`             | Starts local dev server at `localhost:4321`      |
| `pnpm build`           | Build your production site to `./dist/`          |
| `pnpm preview`         | Preview your build locally, before deploying     |
| `pnpm astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `pnpm astro -- --help` | Get help using the Astro CLI                     |
| `pnpm lint` / `pnpm typecheck` | TypeScript check (`tsc --noEmit`; no separate ESLint yet) |
| `pnpm test` / `pnpm test:api` | Run Vitest (API tests against Neon test branch) |
| `pnpm db:migrate:test` | Apply Prisma migrations to the Neon test branch  |

## CI (GitHub Actions)

PRs run [`.github/workflows/ci.yml`](.github/workflows/ci.yml):

1. **Lint / typecheck / build** (no database) - `pnpm lint`, `pnpm typecheck`, `pnpm build`
2. **API tests** - create an ephemeral Neon branch `preview/pr-<number>-<branch>`, apply Prisma migrations with the **direct (unpooled)** connection string, then `pnpm test`
3. **Cleanup** - on PR close, delete that Neon branch (required to stay under Neon branch quotas)

**Prerequisite (one-time, human):** install the [Neon GitHub Integration](https://neon.tech/docs/guides/neon-github-integration) on this repo so `NEON_API_KEY` (secret) and `NEON_PROJECT_ID` (variable) exist. Without them, the test and cleanup jobs fail.

## Testing (database isolation)

API tests use a **dedicated Neon branch**, not the dev database from `.env`.

1. Copy `.env.test.example` → `.env.test` and set `DATABASE_URL` to your Neon test branch.
2. Apply the schema once (and after new migrations): `pnpm db:migrate:test`
3. Run `pnpm test` - Vitest loads `.env.test` via `tests/setup-env.ts` and refuses to run if that URL targets the same Neon endpoint as `.env`.

`.env.test` is gitignored. See [docs/adr/0002-test-database-neon-branch.md](docs/adr/0002-test-database-neon-branch.md).

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
