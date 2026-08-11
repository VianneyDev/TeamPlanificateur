---
target: dashboard
total_score: 25
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
timestamp: 2026-08-11T19-09-48Z
slug: src-pages-index-astro
---
# Critique — Dashboard TPE

Target: src/pages/index.astro (+ Layout, TeamCalendar, leave rails)
Mode: Operate

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Load/draft states OK; mutations lack durable success feedback |
| 2 | Match System / Real World | 3 | Strong FR copy; nav "Dashboard" EN; weekday headers duplicate M |
| 3 | User Control and Freedom | 3 | Draft cancel/withdraw good; approve/reject/toggle lack undo/confirm |
| 4 | Consistency and Standards | 2 | Nested bg-background in bg-card; light amber cells on dark; Approuver text-foreground on primary |
| 5 | Error Prevention | 2 | Weekends blocked; high-stakes approve/reject unguarded |
| 6 | Recognition Rather Than Recall | 3 | Legend + aria-labels; initials force name recall |
| 7 | Flexibility and Efficiency | 2 | Range-drag strong; no jump-to-today / keyboard cell select |
| 8 | Aesthetic and Minimalist Design | 2 | Structure calm; black calendar pit + dense legend flatten hierarchy |
| 9 | Error Recovery | 3 | Fetch errors + retry clear; mutation failures not surfaced here |
| 10 | Help and Documentation | 2 | Inline how-to; disabled Gestion opacity-only |
| **Total** | | **25/40** | **Acceptable** |

## Design Specificity Verdict

Category-interchangeable ops chrome with thin product authorship. Composition matches brief (top nav + split) but calendar digs a near-black hole (`#0f1115` inside `#171a21`), fighting Linear/Notion craft bar and portfolio cold-open.

## Confirmed structural defect

`.panel` → `bg-card` (#171a21) wraps calendar `article` → `bg-background` (#0f1115). Empty day cells have no fill, so the grid reads as a black pit. User report confirmed in source.

## Cognitive Load

Fails single focus (manager), legend >4 encodings, visual hierarchy under dark pit, working memory on initials.

## Emotional Journey

Calm gate → sober chrome → **valley on black calendar** → high-stakes approve under-guarded → muted empty rails. Peak-end fails: hardest visual is the primary job.

## Strengths

1. IA matches Operate brief (nav + calendar/leave split, role rails)
2. Interaction model product-true (weekends, draft-then-confirm, manager edit)
3. Status language mostly human (FR labels, loading/error/retry)

## Priority Issues

1. **[P1]** Nested `bg-background` calendar pit - unreadable work surface
2. **[P1]** Dark theme overall too heavy for content density
3. **[P1]** State encoding fights theme (amber-100 teammate cells on dark)
4. **[P2]** High-stakes actions under-guarded; Approuver contrast risk
5. **[P2]** Legend + instruction stack compete with the month

## Persona Red Flags

- Manager: flat edit select + unguarded writes
- Member: black grid makes own/pending/today hard to parse
- External: Dashboard may overshadow Jours travaillés
- Recruiter: near-black calendar looks unfinished vs craft bar

## Minor Observations

- Card-in-card request rows; title echo H1/H2; icon-only theme toggle; duplicate weekday M; system fonts

## Detector (Assessment B)

CLI `detect.mjs` exit 0, 0 findings (Astro/TSX limited static rules). Manual contrast: card↔bg ~1.09:1; weekend muted on bg ~1.23:1; primary white-on-blue ~3.68:1 (AA fail for normal text). Browser skipped in Assessment B.

## Provocative Questions

1. Why is the calendar the darkest rectangle if the work surface should lead?
2. Would a recruiter trust leave accuracy when empty days look like void?
3. Should absence colors be dark-tuned, or is amber-100 admitting the grid was never designed as a dark data surface?
