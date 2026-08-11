# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Three co-primary audiences, equally important for the UI:

- **Manager**: administers Teams and Members for the organisation; approves or rejects Leave Requests as a whole; may create or correct any Member's Day Offs and Monthly Worked Days.
- **Member (non-manager)**: works mainly from the Team Calendar - sees nominative absences of teammates, submits Leave Requests, may withdraw pending requests and clear own Day Offs.
- **External Member**: self-declares Monthly Worked Days for current/past months; Day Off / Leave Request rules follow the same V2 model as other Members (and may also be a Manager).

Identity is **Acting Member** selection (cookie `selectedMemberId`), not classical login credentials (V1).

## Product Purpose

Team Planning Engine (TPE) is an internal team planning tool for one organisation. Managers run headcount and leave administration; Members manage absences; External Members declare monthly worked-day counts. Success means accurate shared visibility of who is off, reliable leave approval into effective Day Offs, and correct monthly declarations for externals.

This repository is also a **portfolio project**: recruiters and engineers will open it cold. The product must read as a credible enterprise tool on first contact - clear, calm, and professional - not as an experimental art direction.

## Positioning

Single-organisation internal planning: shared Team Calendar (nominative Day Offs), Leave Request → Day Off approval for non-managers, and Monthly Worked Days for External Members. Not a general HRIS, timesheet day-by-day log, or multi-org SaaS marketing site.

## Operating Context

- Web app (Astro SSR + React islands), French UI.
- Surfaces: Dashboard (Acting Member selection + calendar), Gestion (manager CRUD for teams/members), External / Jours travaillés (monthly declarations).
- Domain vocabulary is authoritative in `CONTEXT.md` (Member, Acting Member, Manager, External Member, Team, Archived, Day Off, Leave Request, Team Calendar, Monthly Worked Days).
- Feedback for leave is in-app only (lists + calendar state); no email/push in V2.
- Weekends shown but not selectable for leave/day-off writes.

## Capabilities and Constraints

- Confirmed: Teams/Members CRUD with archive/restore (and team delete where applicable); Acting Member session; manager-gated Gestion; External Monthly Worked Days route; Team Calendar / Day Off / Leave Request domain model (see ADRs under `docs/adr/`).
- Technical: Astro 5 SSR (`@astrojs/node`), React 19 islands, Hono API, Prisma 7 + PostgreSQL, TanStack Query, Tailwind CSS v4, Radix UI primitives.
- Undecided / out of scope for this product record: real authentication, multi-tenancy, stats/reporting UI, AI features.

## Brand Commitments

- Product name in UI: **TPE** / **Team Planning Engine**.
- Interface language: French.
- Domain terms from `CONTEXT.md` must not be replaced by avoided synonyms unless the glossary is updated.
- **Visual stance (binding):** enterprise **Operate dashboard** - clean, restrained, familiar to anyone who has used modern internal tools. Do not pursue fantastical, metaphorical, or high-concept art directions (paper roster worlds, teletext, transit murals, arcade, etc.). Recruiter-safe: the first viewport should feel like a serious product, not a design stunt.
- Prefer clarity, hierarchy, and craft over novelty. Expression lives in precise spacing, type, and state - not in a gimmick.
- **Craft bar:** sit alongside **Linear** and **Notion** in finish quality (hierarchy, density, calm chrome) - not as visual clones.
- Category path: **canon** (standard dashboard ops), executed at full fidelity.
- No separate brand kit beyond the in-app wordmark.

## Evidence on Hand

- Product glossary and rules: `CONTEXT.md`, ADRs in `docs/adr/`.
- Live UI wordmark in `src/layouts/Layout.astro`; favicon at `public/favicon.svg`.
- Incumbent implementation is a dark slate sidebar dashboard - evidence of structure, not a locked aesthetic for redesign.
- No testimonials, case studies, press, or fabricated proof assets. Future work must not invent customers, benchmarks, or pricing claims.

## Product Principles

1. **Equal personas** - Manager, Member, and External flows are co-primary; do not starve one for another.
2. **Shared truth over admin CRUD** - The planning value is who is off (nominative) and what is effective vs pending, not forms for their own sake.
3. **Glossary discipline** - Speak and label with CONTEXT.md terms; avoid synonym drift.
4. **Portfolio-credible enterprise UI** - A cold visitor (recruiter or teammate) should understand and trust the product in seconds; never trade that for spectacle.
5. **Preserve product mechanics** - Acting Member identity, leave approval semantics, weekend rules, and role gates stay intact across a visual redesign.

## Accessibility & Inclusion

No formal WCAG target recorded yet. Aim for solid default web accessibility (keyboard, focus, contrast, French copy clarity) unless a stricter standard is set later.
