---
target: gestion
total_score: 20
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 2
timestamp: 2026-08-11T19-47-54Z
slug: src-pages-gestion-astro
---
# Critique — /gestion

Target: src/pages/gestion.astro + TeamsPanel + MembersPanel (+ modals / row actions)
Mode: Operate

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Skeletons/overlay/toasts; confirms close before pending |
| 2 | Match System / Real World | 2 | FR chrome vs English role badges; Externes unexplained |
| 3 | User Control and Freedom | 3 | Cancel/clear OK; no modal Annuler; no undo beyond Restaurer |
| 4 | Consistency and Standards | 2 | Panels tokenized; modals raw; create ≠ btn-primary; archive≡delete red |
| 5 | Error Prevention | 2 | Confirms exist; archive styled as hard-destructive |
| 6 | Recognition Rather Than Recall | 2 | Icon-only create/kebab; External/Archived meaning |
| 7 | Flexibility and Efficiency | 1 | No bulk/sort/shortcuts |
| 8 | Aesthetic and Minimalist Design | 2 | Clean panel; redundant titles; unfinished modal chrome |
| 9 | Error Recovery | 2 | Domain toasts good; list error no retry |
| 10 | Help and Documentation | 1 | No glossary help; mute empty states |
| **Total** | | **20/40** | **Acceptable** |

## Design Specificity Verdict

Partially authored shell, interchangeable admin body. Product chrome OK; Gestion body is generic CRUD that could be any SaaS roster.

## Cognitive Load

6/8 failures: Single focus, Visual hierarchy, One thing at a time, Minimal choices, Working memory, Progressive disclosure. High load for an admin hub.

## Emotional Journey

Competent admin frame → valley on empty/icon-create/Externes clone → toast peak undermined by early confirm dismiss → anxiety on red Archiver ≡ Supprimer → weak empty/pager end.

## Strengths

1. URL-native IA (?tab= + filters SSR-hydrated)
2. Loading craft (skeleton, delayed overlay, motion-reduce)
3. Domain-aware danger copy + gestionErrorMessage

## Priority Issues

1. **[P0]** Create CTA invisible (muted Plus, no label) vs unused btn-primary
2. **[P0]** Modals break design system + unlabeled fields; Close in EN
3. **[P1]** Soft archive dressed as hard delete (bg-red-600 + text-foreground; light contrast weak ~3.9:1)
4. **[P1]** Empty/error unfinished (no create CTA / no retry)
5. **[P2]** Glossary leakage (English roles; Externes twin of Membres)

## Persona Red Flags

- Manager: create hard to see; archive red-scare; confirm race
- Recruiter: Externes unexplained; English badges; mute empty
- External: middleware redirect OK; deep-link unexplained

## Minor Observations

Redundant H1/tabs/panel titles; « Membre créée » agreement; kebab no aria-label; no total count on pager; system fonts.

## Detector (Assessment B)

CLI detect.mjs exit 0, 0 findings. Contrast: modal text-foreground on primary light ~3.7:1; archive badge ~4.1:1; red-600 CTAs light ~3.9:1. Browser skipped (no MCP; /gestion 302).

## Provocative Questions

1. Why is create a muted icon if Manager CRUD is co-primary?
2. Externes as twin tab vs filter — or a layout that teaches Monthly Worked Days?
3. Archive/restore as inline chip + undo, delete alone in modal?
