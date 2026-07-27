---
name: tpe-frontend-astro-react
description: Guides Astro 5 and React 19 frontend work in Team Planning Engine—islands, feature-based hooks (members, teams), TanStack Query, and UI patterns. Use when editing .astro pages, src/components/islands, src/hooks/members or src/hooks/teams, hydration directives, or when the user asks for Astro/React frontend best practices in this repository.
---

# TPE frontend — Astro islands and React

Stack-wide context (API entry, Prisma, session) lives in the project Cursor rule `.cursor/rules/team-planificateur-astro-react.mdc`. This skill focuses on **frontend workflow**: pages, islands, hooks by feature, and client data.

## When to apply

Use this skill for UI-facing work: new or changed Astro routes, React islands, lists/modals, URL-synced state, debounced search, TanStack Query hooks and mutations, and Radix/Tailwind composition.

## Astro (SSR + islands)

- Routes live under `src/pages/*.astro`. Use `export const prerender = false` when the page depends on runtime data, cookies, or authenticated context.
- Keep **heavy interactivity out of `.astro`**. Pass server-fetched data into islands as props when needed; let React own events, forms, and client state.
- Import interactive UI from `src/components/islands/` only (not arbitrary deep paths outside that tree for new UI).
- **Hydration**: prefer the lightest directive that satisfies UX—`client:visible` or `client:idle` when above-the-fold or immediate interactivity is not required; use `client:load` when the island must be ready on first paint (e.g. critical controls).

**Example**

```astro
---
import TeamsPanel from "@/components/islands/team/TeamsPanel";
---
<TeamsPanel client:visible />
```

## React structure (mirror features)

Under `src/components/islands/`:

| Folder | Role |
|--------|------|
| `member/` | Members UI (panels, modals, row actions, selector) |
| `team/` | Teams UI |
| `providers/` | `AppProviders` (TanStack Query) |
| `ui/` | Shared primitives (Radix wrappers) |

For new screens, **follow existing patterns**: `*Panel.tsx` for main surfaces, `*Modal.tsx` for dialogs, `*RowActions.tsx` for row menus, and `*WithProvider.tsx` when a subtree must wrap consumers with `AppProviders` or similar (see `MembersPanelWithProvider.tsx`, `TeamsPanelWithProvider.tsx`).

## Hooks by feature

- **Domain hooks** live in `src/hooks/members/` and `src/hooks/teams/` with consistent naming: `useMembers`, `useCreateMember`, `useUpdateTeam`, etc.
- **Cross-feature hooks** stay at `src/hooks/` root—for example `useQueryState.ts`, `useDebounce.ts`, `useDelayedFlag.ts`. Do not nest them under `members/` or `teams/` unless they are used only inside that feature and are not reusable.

When adding a new API-backed operation: add or extend a hook in the matching feature folder; keep fetch shapes and query keys aligned with existing calls in that folder.

## TanStack Query

- Islands that query or mutate should run under the provider tree from `src/components/islands/providers/AppProviders.tsx`.
- Use `fetch("/api/...")` (relative URLs). Reuse patterns already in the repo: query keys, invalidation, and optimistic updates on mutations where the codebase already does so.

## UI

- Compose from `src/components/islands/ui/` (Radix-based primitives). Product copy and labels: **French**. Code (variables, file names, routes in English where applicable): **English**.
- Use existing Tailwind utility style; avoid introducing parallel styling systems.

## Pre-merge checklist

- [ ] Island path under `src/components/islands/<feature>/` with a hydration directive justified by UX.
- [ ] New data-access logic in `src/hooks/members/` or `src/hooks/teams/` (or root hooks if cross-cutting).
- [ ] No duplicate API client or ad-hoc server route from the browser beyond `fetch("/api/...")` to the existing Hono app.
