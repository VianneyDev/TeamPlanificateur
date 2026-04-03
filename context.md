# Team Planning Engine (TPE)

**Orientation rapide (agents)** — Application web SSR avec **Astro 5** et îlots **React 19**. Les pages vivent dans `src/pages/*.astro` ; l’interactivité (listes, modales) est dans `src/components/islands/` avec `client:load`. L’API HTTP est **un seul point d’entrée** (fichier catch-all `src/pages/api/[...path].ts`) qui délègue à **Hono** ([`src/lib/api/app.ts`](src/lib/api/app.ts)). Données : **Prisma 7** + PostgreSQL via le driver adapter `pg` ([`src/lib/db.ts`](src/lib/db.ts)). Côté client : **TanStack Query** ([`AppProviders.tsx`](src/components/islands/providers/AppProviders.tsx)). Prérequis : `DATABASE_URL` ; dev : `pnpm dev` (port **4321** par défaut). Alias TypeScript : `@/*` → `./src/*`.

> Le nom du package npm (`package.json`) est `eccentric-equinox` ; le libellé produit dans l’UI est **TPE / Team Planning Engine**.

## Produit

Dashboard pour la gestion d’équipes et de membres. Les managers administrent équipes et membres. À terme : employés externes saisissent les jours travaillés par mois ; tous les membres gèrent jours off et congés dans un calendrier annuel.

## Stack technique

- **Framework** : Astro 5, `output: "server"`, adapter `@astrojs/node` (mode standalone)
- **UI** : React 19 (îlots), Tailwind CSS v4 (`@tailwindcss/vite`), composants Radix (`src/components/islands/ui/`) + `class-variance-authority`, `tailwind-merge`, `clsx`, toasts **Sonner**
- **API** : Hono (`basePath("/api")`), validation `@hono/zod-validator`
- **Données client** : TanStack Query (fetch, cache, optimistic updates sur les mutations)
- **BDD** : Prisma 7, client JS avec `@prisma/adapter-pg` et pool `pg` ; PostgreSQL (URL standard `DATABASE_URL`)
- **Validation** : Zod v4 — schémas partagés dans `src/lib/schemas/`

## Flux de données (résumé)

```text
Îlot React → hook use*(TanStack Query) → fetch("/api/...") → Hono → Prisma → JSON
```

Les mutations passent par les routes Hono ; les `useMutation` peuvent appliquer des **optimistic updates** côté client (pas de Server Actions Next).

## Architecture

Pas de monorepo : un seul paquet à la racine.

| Zone                                | Rôle                                                      |
| ----------------------------------- | --------------------------------------------------------- |
| `src/pages/*.astro`                 | Routes SSR ; `prerender = false` sur les pages dynamiques |
| `src/pages/api/[...path].ts`        | Route catch-all Astro → `app.fetch(request)` (Hono)       |
| `src/middleware.ts`                 | Session légère + garde d’accès                            |
| `src/layouts/Layout.astro`          | Coquille (sidebar, nav, déconnexion)                      |
| `src/components/islands/`           | Composants React hydratés depuis les pages                |
| `src/components/islands/<domaine>/` | UI par domaine (`member`, `team`, `providers`, `ui`)      |
| `src/hooks/<domaine>/`              | Hooks TanStack Query (ex. `members`, `teams`)             |
| `src/hooks/useQueryState.ts`        | État synchronisé avec l’URL (query string)                |
| `src/lib/api/`                      | Clients / helpers fetch typés côté îlot                   |
| `src/lib/types/`                    | Types métier alignés avec l’API                           |
| `src/lib/schemas/`                  | Schémas Zod (création / mise à jour / query)              |
| `src/lib/db.ts`                     | Instance Prisma + pool                                    |
| `prisma/schema.prisma`              | Modèles et relations                                      |
| `src/env.d.ts`                      | Typage `App.Locals`                                       |

**Patterns** : organisation par **domaine métier** (équipes, membres) ; séparation UI / accès données / validation ; typage strict TypeScript + Zod.

## Session & accès (pas d’un auth “classique”)

- Un cookie **`selectedMemberId`** identifie le membre “connecté”.
- [`src/middleware.ts`](src/middleware.ts) charge le membre (avec équipes) et le pose dans **`Astro.locals.member`** (typé dans [`src/env.d.ts`](src/env.d.ts)).
- La route **`/gestion`** redirige vers `/` si aucun membre ou si `role !== "manager"`.
- **Déconnexion** : `POST /api/logout` (efface le cookie, redirection) — formulaire dans le layout.
- **Sélecteur de membre** : [`MemberSelector`](src/components/islands/member/MemberSelector.tsx) côté dashboard pour choisir qui est “connecté” (usage interne / démo).

## Schéma Prisma (référence métier)

- **Team** : `name`, `archived`
- **Member** : `name`, `role` (ex. `"member"` \| `"manager"`), `isExternal`, `archived`, relation N-N avec les équipes
- **DayOff** : jour off par membre (contrainte unique `memberId` + `date`) — **présent en BDD**, peu / pas d’UI encore
- **MonthlyWorkedDays** : jours travaillés par membre, année / mois — **présent en BDD**, peu / pas d’UI encore

## Fonctionnalités

### Implémenté (vérifié dans le code)

- [x] CRUD équipes et membres (API Hono + îlots)
- [x] Archivage / restauration membres ; archivage / suppression équipes (selon routes)
- [x] **Membres** : filtre par statut (actifs / archivés / tous), **recherche** `search` et **pagination** côté serveur ([`app.ts`](src/lib/api/app.ts))
- [x] **Équipes** : liste avec filtre statut (pas de pagination ni recherche dédiées comme pour les membres)
- [x] Mises à jour optimistes sur plusieurs mutations TanStack Query
- [x] États de chargement (ex. message “Chargement…” sur le panneau membres)

### Partiel / placeholder

- [~] **Dashboard** ([`index.astro`](src/pages/index.astro)) : sélection de membre ; contenu principal encore minimal
- [~] **Calendrier** ([`Calendar.astro`](src/components/calendar/Calendar.astro)) : squelette grille de mois, sans interaction ni branchement données
- [~] **Gestion** — onglet **Externes** ([`gestion.astro`](src/pages/gestion.astro)) : lien d’onglet présent, **pas de bloc conditionnel** pour le contenu `tab === "externes"`
- [~] Nav **“Jours travaillés”** pointe vers **`/external`** ([`Layout.astro`](src/layouts/Layout.astro)) mais **aucune page** `external.astro` à ce jour — lien à implémenter ou corriger

### À faire (roadmap)

- [ ] Calendrier jours off (brancher `DayOff`)
- [ ] Saisie jours travaillés pour externes (brancher `MonthlyWorkedDays`, page `/external`)
- [ ] Stats / reporting
- [ ] Fonctionnalités IA (vision produit)

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

**Vision produit**

- Outil augmenté par l’IA : recherche et analyse, aide à la décision, automatisation de tâches

## État actuel & focus

- Base solide côté **CRUD membres/équipes**, API cohérente, îlots React + TanStack Query
- **En cours / court terme** : debounce sur la recherche membres (aujourd’hui la query string est mise à jour à chaque frappe) et amélioration du feedback visuel au chargement (skeleton, réduction du flicker)
