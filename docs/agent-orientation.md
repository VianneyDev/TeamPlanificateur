# Team Planning Engine (TPE)

**Orientation rapide (agents)** — Application web SSR avec **Astro 5** et îlots **React 19**, dans un monorepo pnpm (`apps/web` + `packages/ui`). Les pages vivent dans `apps/web/src/pages/*.astro` ; l’interactivité (listes, modales) est dans `apps/web/src/components/islands/` avec `client:load`. L’API HTTP est **un seul point d’entrée** (fichier catch-all `apps/web/src/pages/api/[...path].ts`) qui délègue à **Hono** ([`src/lib/api/app.ts`](../apps/web/src/lib/api/app.ts)). Données : **Prisma 7** + PostgreSQL via le driver adapter `pg` ([`src/lib/db.ts`](../apps/web/src/lib/db.ts)). Côté client : **TanStack Query** ([`AppProviders.tsx`](../apps/web/src/components/islands/providers/AppProviders.tsx)). Prérequis : `DATABASE_URL` dans `apps/web/.env` ; dev : `pnpm dev` à la racine (port **4321** par défaut). Alias TypeScript : `@/*` → `./src/*` (dans `apps/web`).

> Le nom du package npm de l’app (`apps/web/package.json`) est `eccentric-equinox` ; le libellé produit dans l’UI est **TPE / Team Planning Engine**. Le package design system est `@vianneytraina/ui` (`packages/ui`).

## Produit

Dashboard pour la gestion d’équipes et de membres. Les managers administrent équipes et membres. À terme : employés externes saisissent les jours travaillés par mois ; tous les membres gèrent jours off et congés dans un calendrier mensuel.

## Stack technique

- **Framework** : Astro 5, `output: "server"`, adapter `@astrojs/node` (mode standalone)
- **UI** : React 19 (îlots), Tailwind CSS v4 (`@tailwindcss/vite`), composants Radix (`apps/web/src/components/islands/ui/`) + `class-variance-authority`, `tailwind-merge`, `clsx`, toasts **Sonner**
- **API** : Hono (`basePath("/api")`), validation `@hono/zod-validator`
- **Données client** : TanStack Query (fetch, cache, optimistic updates sur les mutations)
- **BDD** : Prisma 7, client JS avec `@prisma/adapter-pg` et pool `pg` ; PostgreSQL (URL standard `DATABASE_URL` dans `apps/web/.env`). Les tests Vitest utilisent `apps/web/.env.test` (branche Neon dédiée), pas `.env` - voir `docs/adr/0002-test-database-neon-branch.md`. Jobs Cloud Run : `RECAP_TOKEN` / `RECAP_BUCKET` (récap quotidien), `DEMO_RESET_ENABLED` / `DEMO_RESET_TOKEN` (réinitialisation de démo). Ne pas activer `DEMO_RESET_ENABLED` en local.
- **Validation** : Zod v4 — schémas partagés dans `apps/web/src/lib/schemas/`

## Flux de données (résumé)

```text
Îlot React → hook use*(TanStack Query) → fetch("/api/...") → Hono → Prisma → JSON
```

Les mutations passent par les routes Hono ; les `useMutation` peuvent appliquer des **optimistic updates** côté client (pas de Server Actions Next).

## Architecture

Monorepo pnpm : `apps/web` (app privée `eccentric-equinox`) et `packages/ui` (`@vianneytraina/ui`). L’app consomme `@vianneytraina/ui` depuis le registry (`^2.0.0`, ADR-0013).

| Zone                                         | Rôle                                                      |
| -------------------------------------------- | --------------------------------------------------------- |
| `apps/web/src/pages/*.astro`                 | Routes SSR ; `prerender = false` sur les pages dynamiques |
| `apps/web/src/pages/api/[...path].ts`        | Route catch-all Astro → `app.fetch(request)` (Hono)       |
| `apps/web/src/middleware.ts`                 | Session légère + garde d’accès                            |
| `apps/web/src/layouts/Layout.astro`          | Coquille (sidebar, nav, déconnexion)                      |
| `apps/web/src/components/islands/`           | Composants React hydratés depuis les pages                |
| `apps/web/src/components/islands/<domaine>/` | UI par domaine (`member`, `team`, `providers`, `ui`)      |
| `apps/web/src/hooks/<domaine>/`              | Hooks TanStack Query (ex. `members`, `teams`)             |
| `apps/web/src/hooks/useQueryState.ts`        | État synchronisé avec l’URL (query string)                |
| `apps/web/src/lib/api/`                      | Clients / helpers fetch typés côté îlot                   |
| `apps/web/src/lib/types/`                    | Types métier alignés avec l’API                           |
| `apps/web/src/lib/schemas/`                  | Schémas Zod (création / mise à jour / query)              |
| `apps/web/src/lib/db.ts`                     | Instance Prisma + pool                                    |
| `apps/web/prisma/schema.prisma`              | Modèles et relations                                      |
| `apps/web/src/env.d.ts`                      | Typage `App.Locals`                                       |

**Patterns** : organisation par **domaine métier** (équipes, membres) ; séparation UI / accès données / validation ; typage strict TypeScript + Zod.

## Session & accès (pas d’un auth “classique”)

- Un cookie **`selectedMemberId`** identifie le membre “connecté”.
- [`src/middleware.ts`](../apps/web/src/middleware.ts) charge le membre (avec équipes) et le pose dans **`Astro.locals.member`** (typé dans [`src/env.d.ts`](../apps/web/src/env.d.ts)).
- La route **`/gestion`** redirige vers `/` si aucun membre ou si `role !== "manager"`.
- **Déconnexion** : `POST /api/logout` (efface le cookie, redirection) — formulaire dans le layout.
- **Sélecteur de membre** : [`MemberSelector`](../apps/web/src/components/islands/member/MemberSelector.tsx) côté dashboard pour choisir qui est “connecté” (usage interne / démo).

## Schéma Prisma (référence métier)

- **Team** : `name`, `archived`
- **Member** : `name`, `role` (ex. `"member"` \| `"manager"`), `isExternal`, `archived`, relation N-N avec les équipes
- **DayOff** : jour off par membre (contrainte unique `memberId` + `date`) — **présent en BDD**, peu / pas d’UI encore
- **MonthlyWorkedDays** : jours travaillés par membre, année / mois — **présent en BDD**, peu / pas d’UI encore

## Règles & conventions

**Patterns**

- Architecture par domaine dans `hooks/` et `components/islands/`
- **Hono** pour toutes les routes API sous `/api`
- **TanStack Query** pour le fetching, le cache et les optimistic updates
- **Zod** pour valider les entrées API (et tout schéma partagé front/back)

**Conventions**

- Séparation nette : UI / accès données / validation
- Typage strict (TypeScript + Zod), éviter `any` sauf exception justifiée
- **Code** (identifiants, fichiers) : anglais. **UI produit** : français
- Commentaires seulement si le code n’est pas suffisamment clair

**Git**

- Préfixer les commits : `feat:`, `fix:`, `refactor:`, `chore:`, etc.
- Messages courts et explicites

**Ce qu’on ne fait pas (sans décision explicite)**

-

## Contexte métier

**Profils (alignés sur le schéma)**

- **Manager** (`role === "manager"`) : accès **Gestion** (équipes, membres) ; même base membre que les autres (cookie + middleware)
- **Membre avec `isExternal: true`** : ciblé pour la saisie des jours travaillés (à venir)
- **Membre interne** : calendrier / congés (à venir) ; aujourd’hui surtout sélection d’identité et navigation

**Usage principal aujourd’hui**

- Gérer équipes et membres (côté manager)
- Suivre archivage et rattachement aux équipes
- Filtrer / chercher / paginer la liste des membres
