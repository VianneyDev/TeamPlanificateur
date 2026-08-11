---
target: external
total_score: 24
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 2
timestamp: 2026-08-11T19-27-29Z
slug: src-pages-external-astro
---
# Critique — /external (Jours travaillés)

Target: src/pages/external.astro + MonthlyWorkedDaysPanel
Mode: Operate

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Toast OK; post-save form muddy; load error inert |
| 2 | Match System / Real World | 3 | Solid FR/domain; thin externe self-service framing |
| 3 | User Control and Freedom | 2 | Annuler only in correction; silent overwrite |
| 4 | Consistency and Standards | 3 | Shell aligns; Modifier text-link vs buttons |
| 5 | Error Prevention | 3 | Bounds OK; no overwrite confirm |
| 6 | Recognition Rather Than Recall | 2 | History helps; existing month not on form |
| 7 | Flexibility and Efficiency | 1 | No search/filter; 24-month + ≤200 select |
| 8 | Aesthetic and Minimalist Design | 3 | Clean dual panel; generic ops chrome |
| 9 | Error Recovery | 3 | Inline daysError; list error no retry |
| 10 | Help and Documentation | 2 | Short subtitles; no Day Off independence |
| **Total** | | **24/40** | **Fair Operate baseline** |

## Design Specificity Verdict

Product-labeled generic CRUD. Role branching and correction mode are product-true; composition could be any monthly metric admin. Craft bar Linear+Notion claimed but surface reads default shadcn-ops.

## Cognitive Load

4 failures: Single focus, Visual hierarchy, Minimal choices, Working memory. Manager path heavier (member select ≤200, org table).

## Emotional Journey

Calm arrive → low-friction fill → toast peak → **weak end** (form not reset). Correction ring is strongest beat; silent upsert is a valley.

## Strengths

1. Role-aware: External locks to self; manager gets member picker
2. Correction affordances: ring, Annuler, active row, scrollIntoView
3. Number guardrails: max label, clamp, normalize/zero-replace

## Priority Issues

1. **[P0]** Modifier `text-primary` on card ~2.56:1 dark (AA fail) — A+B agree
2. **[P0]** Upsert overwrite without acknowledgment
3. **[P1]** Ambiguous post-save end state (form not reset)
4. **[P1]** Manager member select does not scale (no search)
5. **[P2]** External co-primary still reads as admin split (history wider than form)

## Persona Red Flags

- External: manager-toned page blurb; history competes; dirty form after save; no Day Off guidance
- Manager: ≤200 native select; no missing-declaration queue; silent overwrite
- Recruiter: /external 302 without Acting Member; nav hidden until eligible member

## Minor Observations

Empty state no CTA; list error no retry; success toast generic; Gestion ghost nav noise; system fonts.

## Detector (Assessment B)

CLI detect.mjs exit 0, 0 findings. Manual contrast confirms dark primary-on-card ~2.56:1; light OK ~5.17:1. Browser overlay skipped (no automation; /external 302 without session).

## Provocative Questions

1. Why is history the largest surface if declare is the job?
2. Should External be single-column form-first with history secondary?
3. Should Manager overwrite feel like a correction with receipt?
