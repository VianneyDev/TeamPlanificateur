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
| `pnpm test` / `pnpm test:api` | Run Vitest (API tests against Neon test branch) |
| `pnpm db:migrate:test` | Apply Prisma migrations to the Neon test branch  |

## Testing (database isolation)

API tests use a **dedicated Neon branch**, not the dev database from `.env`.

1. Copy `.env.test.example` → `.env.test` and set `DATABASE_URL` to your Neon test branch.
2. Apply the schema once (and after new migrations): `pnpm db:migrate:test`
3. Run `pnpm test` - Vitest loads `.env.test` via `tests/setup-env.ts` and refuses to run if that URL targets the same Neon endpoint as `.env`.

`.env.test` is gitignored. See [docs/adr/0002-test-database-neon-branch.md](docs/adr/0002-test-database-neon-branch.md).

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
