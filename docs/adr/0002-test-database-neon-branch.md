# Dedicated Neon branch for Vitest

API tests hit a real Postgres via Prisma. Running them against the local `.env` Neon **dev** branch polluted Gestion (archived test rows accumulate). Tests therefore use a **stable, dedicated Neon test branch**.

## Setup

1. Create a Neon branch (schema-only is fine; a branch copied from parent already has tables).
2. Copy `.env.test.example` → `.env.test` and set `DATABASE_URL` to that branch.
3. Apply migrations: `pnpm db:migrate:test`  
   If the branch already has the schema but no Prisma migration history (common for a Neon copy), baseline once with `node --import ./scripts/load-env-test.mjs ./node_modules/prisma/build/index.js migrate resolve --applied <migration_name>` for each migration under `prisma/migrations`, then re-run `pnpm db:migrate:test`.
4. Run tests: `pnpm test` / `pnpm test:api`

Vitest loads `.env.test` in `tests/setup-env.ts` (not `.env`). The setup fails fast if `.env.test` is missing or targets the same Neon endpoint as `.env`. `pnpm db:migrate:test` uses `scripts/load-env-test.mjs` with `override: true` so a shell `DATABASE_URL` cannot accidentally point migrate at dev. Do not commit `.env.test`.

CI ephemeral branches are out of scope; this is a local stable test branch only.
