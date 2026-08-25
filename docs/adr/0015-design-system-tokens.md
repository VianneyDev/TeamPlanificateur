# Design system tokens: three levels, native CSS

`@vianneytraina/ui` ships design tokens as native CSS custom properties in a single file, `packages/ui/src/styles.css`. Token **content** lives here. The bundler that copies that file to `dist/index.css` is ADR-0011. Consumers load `'@vianneytraina/ui/styles.css'` themselves (ADR-0009). This ADR is the extracted list later A5 lots cite.

A cadrage title such as "0003" is not this ADR and is not ADR-0003 (Monthly Worked Days).

## Decision

Three documented levels, always in this order:

| Level | Role | Naming examples | Value shape |
| --- | --- | --- | --- |
| Primitive | Raw palette, type, radius | `--color-blue-500`, `--font-ibm-plex-sans`, `--radius-md` | Literal (`#3b82f6`, `0.375rem`). No `var()`. |
| Semantic | Meaning in the product | `--color-action-primary`, `--color-surface-canvas`, `--radius-control` | `var(--<primitive-or-semantic>)` |
| Component | Slot on a public component | `--button-bg-default`, `--text-field-border` | `var(--<semantic>)` (or a CSS keyword such as `transparent`) |

**Rule: components may use semantic or component-level tokens only, never primitives.** A5 lots (Button, TextField, Label, Dialog, Select, DropdownMenu, Badge) must follow that rule. A primitive used in a component is a leak: changing `--color-blue-600` would restyle that component even when `--color-action-primary` was meant to be the brand switch.

The alternative theme is the existing document-root class toggle (`:root` / `:root.light` vs `:root.dark`). Dark reassigns **semantic** tokens only. Component tokens stay on `:root, :root.light` so they follow the semantic layer. Two reassignments are enough to prove the layer (`--color-text-primary` and `--color-surface-canvas`); the extracted dark theme reassigns the rest of the TPE light/dark sheet. `--color-action-primary` is not reassigned: both themes keep `--color-blue-600` so white action text meets 4.5:1.

No Style Dictionary. No JS theme module. One CSS file, no JS dependency.

Until A4 lands, this source file is the A3 artefact. After A4, `dist/index.css` must contain all three levels and the dark semantic reassignment (ADR-0011 A3/A4 mutual check). Do not copy this list into ADR-0011.

### Primitive (extracted)

Values come from `apps/web/src/styles/global.css` and `DESIGN.md` (Operate Blue, ops/paper neutrals, calendar amber/sky, danger fill). Tailwind-aligned names are used where the hex matches a named step; TPE-only hues keep a `paper` / `ops` family name.

| Token | Value |
| --- | --- |
| `--color-white` | `#ffffff` |
| `--color-blue-400` | `#60a5fa` |
| `--color-blue-500` | `#3b82f6` |
| `--color-blue-600` | `#2563eb` |
| `--color-blue-900` | `#1e3a8a` |
| `--color-slate-100` | `#f1f5f9` |
| `--color-slate-600` | `#475569` |
| `--color-slate-900` | `#0f172a` |
| `--color-red-400` | `#f87171` |
| `--color-red-600` | `#dc2626` |
| `--color-red-700` | `#b91c1c` |
| `--color-amber-100` | `#ffedd5` |
| `--color-amber-400` | `#fbbf24` |
| `--color-amber-400-alpha-22` | `rgb(251 191 36 / 0.22)` |
| `--color-amber-700` | `#b45309` |
| `--color-sky-400` | `#38bdf8` |
| `--color-sky-500` | `#0ea5e9` |
| `--color-sky-600` | `#0284c7` |
| `--color-sky-700` | `#0369a1` |
| `--color-stone-900` | `#1c1917` |
| `--color-teal-400` | `#2dd4bf` |
| `--color-teal-700` | `#0f766e` |
| `--color-orange-700` | `#c2410c` |
| `--color-violet-400` | `#a78bfa` |
| `--color-violet-600` | `#7c3aed` |
| `--color-rose-400` | `#fb7185` |
| `--color-rose-700` | `#be123c` |
| `--color-paper` | `#f4f6fb` |
| `--color-paper-muted` | `#eef2f9` |
| `--color-paper-secondary` | `#e8eefc` |
| `--color-paper-accent` | `#dbe7ff` |
| `--color-paper-line` | `#d5deef` |
| `--color-ops-canvas` | `#1e2433` |
| `--color-ops-raised` | `#283044` |
| `--color-ops-muted` | `#343e56` |
| `--color-ops-muted-fg` | `#b6c2d6` |
| `--color-ops-line` | `#3d4a66` |
| `--color-ops-accent` | `#2a3f6d` |
| `--font-ibm-plex-sans` | `"IBM Plex Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` |
| `--radius-sm` | `0.25rem` |
| `--radius-md` | `0.375rem` |
| `--radius-lg` | `0.5rem` |
| `--radius-xl` | `0.75rem` |

Operate Blue for actions is `--color-blue-600` in both themes so `--color-action-primary-foreground` meets 4.5:1. `--color-blue-400` is the dark focus ring (3:1 on muted, secondary, and accent). `--color-blue-500` remains for dark chart-1.

### Semantic (light default)

Declared on `:root, :root.light`. Aliases (sidebar) may point at other semantic tokens.

| Token | Light value |
| --- | --- |
| `--color-action-primary` | `var(--color-blue-600)` |
| `--color-action-primary-foreground` | `var(--color-white)` |
| `--color-surface-canvas` | `var(--color-paper)` |
| `--color-surface-raised` | `var(--color-white)` |
| `--color-surface-muted` | `var(--color-paper-muted)` |
| `--color-surface-secondary` | `var(--color-paper-secondary)` |
| `--color-surface-accent` | `var(--color-paper-accent)` |
| `--color-text-primary` | `var(--color-slate-900)` |
| `--color-text-muted` | `var(--color-slate-600)` |
| `--color-text-secondary` | `var(--color-blue-900)` |
| `--color-text-accent` | `var(--color-blue-900)` |
| `--color-border-default` | `var(--color-paper-line)` |
| `--color-border-input` | `var(--color-paper-line)` |
| `--color-focus-ring` | `var(--color-blue-600)` |
| `--color-danger` | `var(--color-red-600)` |
| `--color-danger-fill` | `var(--color-red-700)` |
| `--color-calendar-teammate` | `var(--color-amber-700)` |
| `--color-calendar-teammate-fg` | `var(--color-white)` |
| `--color-calendar-teammate-soft` | `var(--color-amber-100)` |
| `--color-calendar-edit-target` | `var(--color-sky-700)` |
| `--color-calendar-edit-target-hover` | `var(--color-sky-600)` |
| `--color-chart-1` | `var(--color-blue-600)` |
| `--color-chart-2` | `var(--color-teal-700)` |
| `--color-chart-3` | `var(--color-orange-700)` |
| `--color-chart-4` | `var(--color-violet-600)` |
| `--color-chart-5` | `var(--color-rose-700)` |
| `--color-surface-sidebar` | `var(--color-surface-raised)` |
| `--color-text-sidebar` | `var(--color-text-primary)` |
| `--color-action-sidebar` | `var(--color-action-primary)` |
| `--color-action-sidebar-foreground` | `var(--color-action-primary-foreground)` |
| `--color-surface-sidebar-accent` | `var(--color-surface-muted)` |
| `--color-text-sidebar-accent` | `var(--color-text-primary)` |
| `--color-border-sidebar` | `var(--color-border-default)` |
| `--color-focus-sidebar` | `var(--color-focus-ring)` |
| `--font-sans` | `var(--font-ibm-plex-sans)` |
| `--radius` | `var(--radius-lg)` |
| `--radius-control` | `var(--radius-md)` |
| `--radius-panel` | `var(--radius-xl)` |

### Semantic (dark reassignment)

`:root.dark` reassigns the following. Tokens omitted here keep the light semantic value (`--color-action-primary` stays `--color-blue-600` so white action text meets 4.5:1; `--color-action-primary-foreground` stays white; `--color-danger-fill` stays `--color-red-700`; radius and font stay put). Sidebar aliases are not repeated: they already follow the semantic tokens they reference.

| Token | Dark value |
| --- | --- |
| `--color-surface-canvas` | `var(--color-ops-canvas)` |
| `--color-surface-raised` | `var(--color-ops-raised)` |
| `--color-surface-muted` | `var(--color-ops-muted)` |
| `--color-surface-secondary` | `var(--color-ops-muted)` |
| `--color-surface-accent` | `var(--color-ops-accent)` |
| `--color-text-primary` | `var(--color-slate-100)` |
| `--color-text-muted` | `var(--color-ops-muted-fg)` |
| `--color-text-secondary` | `var(--color-slate-100)` |
| `--color-text-accent` | `var(--color-paper-accent)` |
| `--color-border-default` | `var(--color-ops-line)` |
| `--color-border-input` | `var(--color-ops-line)` |
| `--color-focus-ring` | `var(--color-blue-400)` |
| `--color-danger` | `var(--color-red-400)` |
| `--color-calendar-teammate` | `var(--color-amber-400)` |
| `--color-calendar-teammate-fg` | `var(--color-stone-900)` |
| `--color-calendar-teammate-soft` | `var(--color-amber-400-alpha-22)` |
| `--color-calendar-edit-target` | `var(--color-sky-500)` |
| `--color-calendar-edit-target-hover` | `var(--color-sky-400)` |
| `--color-chart-1` | `var(--color-blue-500)` |
| `--color-chart-2` | `var(--color-teal-400)` |
| `--color-chart-3` | `var(--color-amber-400)` |
| `--color-chart-4` | `var(--color-violet-400)` |
| `--color-chart-5` | `var(--color-rose-400)` |

### Contrast pairs (WCAG AA)

Foreground/background relationships that must hold after resolving semantic tokens to primitives, in both `:root` / `:root.light` and `:root.dark`. This table is the source of truth for the automated contrast test. Normal text uses 4.5:1. Large text and non-text UI such as focus rings use 3:1.

Any custom property whose name ends in `-foreground` or `-fg` and whose value is a `var()` must appear as Foreground in this table by that exact name. Aliasing another token (for example `--color-action-sidebar-foreground`) does not count as a declared target.

Left out of this table on purpose:

- Hairline `--color-border-*` tokens sit below 3:1. They are decorative and do not carry information.
- The text-on-surface matrix is incomplete beyond the pairs listed here.

| Foreground | Background | Minimum ratio |
| --- | --- | --- |
| `--color-action-primary-foreground` | `--color-action-primary` | 4.5:1 |
| `--color-action-primary-foreground` | `--color-danger-fill` | 4.5:1 |
| `--color-action-sidebar-foreground` | `--color-action-sidebar` | 4.5:1 |
| `--color-text-primary` | `--color-surface-canvas` | 4.5:1 |
| `--color-text-primary` | `--color-surface-raised` | 4.5:1 |
| `--color-text-primary` | `--color-surface-muted` | 4.5:1 |
| `--color-text-primary` | `--color-surface-secondary` | 4.5:1 |
| `--color-text-primary` | `--color-surface-accent` | 4.5:1 |
| `--color-text-muted` | `--color-surface-canvas` | 4.5:1 |
| `--color-text-muted` | `--color-surface-raised` | 4.5:1 |
| `--color-text-muted` | `--color-surface-muted` | 4.5:1 |
| `--color-text-secondary` | `--color-surface-canvas` | 4.5:1 |
| `--color-text-accent` | `--color-surface-accent` | 4.5:1 |
| `--color-calendar-teammate-fg` | `--color-calendar-teammate` | 4.5:1 |
| `--color-focus-ring` | `--color-surface-canvas` | 3:1 |
| `--color-focus-ring` | `--color-surface-raised` | 3:1 |
| `--color-focus-ring` | `--color-surface-muted` | 3:1 |
| `--color-focus-ring` | `--color-surface-secondary` | 3:1 |
| `--color-focus-ring` | `--color-surface-accent` | 3:1 |
| `--text-field-fg` | `--text-field-bg` | 4.5:1 |
| `--label-fg` | `--color-surface-canvas` | 4.5:1 |
| `--dialog-fg` | `--dialog-bg` | 4.5:1 |
| `--select-fg` | `--select-bg` | 4.5:1 |
| `--dropdown-menu-fg` | `--dropdown-menu-bg` | 4.5:1 |
| `--color-danger` | `--dropdown-menu-bg` | 4.5:1 |
| `--badge-fg-default` | `--badge-bg-default` | 4.5:1 |
| `--badge-fg-accent` | `--badge-bg-accent` | 4.5:1 |

### Component (A5 lots)

Declared once on `:root, :root.light`. Never reassigned in `:root.dark`.

**Button**

`--button-bg-default`, `--button-fg-default`, `--button-bg-ghost`, `--button-fg-ghost`, `--button-bg-outline`, `--button-fg-outline`, `--button-border-outline`, `--button-bg-danger`, `--button-fg-danger`, `--button-bg-disabled`, `--button-fg-disabled`, `--button-radius`

**TextField**

`--text-field-bg`, `--text-field-fg`, `--text-field-border`, `--text-field-placeholder`, `--text-field-ring`, `--text-field-radius`

**Label**

`--label-fg`

**Dialog**

`--dialog-bg`, `--dialog-fg`, `--dialog-border`, `--dialog-radius`

**Select**

`--select-bg`, `--select-fg`, `--select-border`, `--select-radius`

**DropdownMenu**

`--dropdown-menu-bg`, `--dropdown-menu-fg`, `--dropdown-menu-border`, `--dropdown-menu-radius`

**Badge**

`--badge-bg-default`, `--badge-fg-default`, `--badge-border-default`, `--badge-bg-accent`, `--badge-fg-accent`, `--badge-border-accent`, `--badge-radius`

`--button-bg-default` is `var(--color-action-primary)`. `--button-radius` is `var(--radius-control)`, not `var(--radius-md)`.

## Rationale

TPE already had a mixed token sheet (`--primary` as both a hex and a Tailwind `@theme` alias). Extracting into three levels is what makes a palette change a semantic reassignment instead of a hunt through component CSS. The document-root dark class already exists in the app; using it as the alternative theme avoids a second theming mechanism.

Native custom properties work on unhydrated Astro islands. A JS token object would fail the "no JS dependency" rule and would FOUC the same way runtime CSS injection does (ADR-0009, ADR-0010).

## Alternatives not taken

- **Style Dictionary** (or any token build). Rejected by the cadrage. The list is small enough to author by hand.
- **Keep TPE names (`--primary`, `--background`) as the public DS tokens.** Rejected: those names collapse primitive and semantic into one layer; the ticket examples (`--color-blue-500`, `--color-action-primary`, `--button-bg-default`) are the public contract.
- **Reassign component tokens in `:root.dark`.** Rejected: that would prove nothing about the semantic layer.
- **Put this list in ADR-0011.** Rejected: ADR-0011 is the tsup pipeline. Token names would rot there when A5 adds a slot.
- **A JS `tokens.ts` alongside the CSS.** Rejected: a second source of truth, and a JS dependency the CSS file must not have.
