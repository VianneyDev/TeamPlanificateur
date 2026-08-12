---
name: Team Planning Engine
description: Elevated ops chrome - light-by-default enterprise Operate dashboard
colors:
  background-dark: "#1e2433"
  surface-dark: "#283044"
  foreground-dark: "#f1f5f9"
  muted-dark: "#343e56"
  muted-foreground-dark: "#b6c2d6"
  border-dark: "#3d4a66"
  background-light: "#f4f6fb"
  surface-light: "#ffffff"
  foreground-light: "#0f172a"
  muted-light: "#eef2f9"
  muted-foreground-light: "#475569"
  border-light: "#d5deef"
  primary: "#2563eb"
  primary-dark: "#3b82f6"
  primary-foreground: "#ffffff"
  accent-dark: "#2a3f6d"
  accent-foreground-dark: "#dbe7ff"
  accent-light: "#dbe7ff"
  accent-foreground-light: "#1e3a8a"
  destructive-dark: "#f87171"
  destructive-light: "#dc2626"
  danger: "#b91c1c"
  calendar-secondary-light: "#b45309"
  calendar-secondary-fg-light: "#ffffff"
  calendar-secondary-soft-light: "#ffedd5"
  calendar-secondary-dark: "#fbbf24"
  calendar-secondary-fg-dark: "#1c1917"
  calendar-edit-target: "#0369a1"
  calendar-edit-target-hover: "#0284c7"
typography:
  body:
    fontFamily: "IBM Plex Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  title:
    fontFamily: "IBM Plex Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  brand:
    fontFamily: "IBM Plex Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  section:
    fontFamily: "IBM Plex Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "normal"
  label:
    fontFamily: "IBM Plex Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "normal"
  caption:
    fontFamily: "IBM Plex Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "normal"
  micro:
    fontFamily: "IBM Plex Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.65rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.04em"
rounded:
  sm: "0.25rem"
  md: "0.375rem"
  lg: "0.5rem"
  xl: "0.75rem"
  full: "9999px"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "0.75rem"
  lg: "1rem"
  xl: "1.5rem"
  panel: "1.25rem"
  rail-gap: "0.5rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    padding: "0.5rem 0.75rem"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.muted-foreground-dark}"
    rounded: "{rounded.md}"
    padding: "0.5rem 0.75rem"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.foreground-dark}"
    rounded: "{rounded.md}"
    padding: "0.5rem 0.75rem"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    padding: "0.5rem 0.75rem"
  panel:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.foreground-dark}"
    rounded: "{rounded.xl}"
    padding: "{spacing.panel}"
  nav-item:
    backgroundColor: "transparent"
    textColor: "{colors.muted-foreground-dark}"
    rounded: "{rounded.md}"
    padding: "0.5rem 0.625rem"
  nav-item-active:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "0.5rem 0.625rem"
  acting-member-chip:
    backgroundColor: "transparent"
    textColor: "{colors.foreground-dark}"
    rounded: "{rounded.md}"
    padding: "0.25rem 0.375rem"
  field:
    backgroundColor: "{colors.background-dark}"
    textColor: "{colors.foreground-dark}"
    rounded: "{rounded.md}"
    padding: "0.5rem 0.75rem"
  leave-rail-row:
    backgroundColor: "{colors.muted-dark}"
    textColor: "{colors.foreground-dark}"
    rounded: "{rounded.lg}"
    padding: "0.75rem"
---

# Design System: Team Planning Engine

## Overview

**Creative North Star: "Elevated Ops Chrome"**

Team Planning Engine (TPE) is a dark-by-default Operate dashboard: familiar enterprise chrome where the month and leave queue read at a glance, without spectacle. Surfaces sit on lifted slate (`#22252c` / `#2c3039`), one blue accent (`#2563eb`), French UI, and a craft bar aimed at Linear + Notion finish quality - hierarchy, density, calm chrome - not clones. Light mode is an explicit twin, equally sober.

Expression lives in spacing, type, and state. The first viewport is a sticky top bar (TPE wordmark, route nav, theme toggle, Acting Member chip) over a calendar-primary split with a dense leave rail. Portfolio credibility beats novelty.

**Key Characteristics:**
- Dark default ops chrome with light toggle
- Single brand accent blue; amber/sky reserved for calendar semantics
- IBM Plex Sans for all UI roles
- Topnav-split shell: sticky header, ~65/35 calendar / leave rail
- Underline-active nav and dense leave-rail list density

## Colors

One accent, tonal neutrals, and calendar-only semantic hues. Do not invent extra brand colors.

### Primary
- **Operate Blue** (`#2563eb`): CTAs, active nav underline + label, primary day-offs, focus rings, count badges on leave rails.

### Neutral
- **Ops Background** (`#22252c` / light `#f7f7f5`): page canvas.
- **Ops Surface** (`#2c3039` / light `#ffffff`): sticky header, panels, cards.
- **Muted Fill** (`#383d48` / light `#efefec`): hover washes, leave-rail row fills, disabled primary.
- **Foreground / Muted text** (`#f4f4f5` / `#b8bcc6`; light `#111111` / `#5c5c57`): primary copy and secondary labels.
- **Border** (`#454b58` / light `#e4e4e0`): hairlines on panels, fields, footer, header.

### Accent wash
- **Accent Panel** (`#2f3d5c` / light `#e8eefc`) with accent foreground (`#d2e0ff` / `#1e3a8a`): draft/pending day cells, Acting Member avatar disc, soft emphasis banners - not brand chrome fill for active nav.

### Calendar semantics
- **Teammate Amber** (`#d97706`, soft wash, dark fg `#1c1917`): teammate initials on shared days.
- **Edit Target Sky** (`#0369a1`, hover `#0284c7`): manager edit-target cells with white text (≥4.5:1).

### Destructive
- **Destructive** (`#f87171` dark / `#dc2626` light): error copy and soft alert borders.
- **Danger fill** (`#b91c1c`): irreversible delete only; archive stays outline/ghost.

**The One Accent Rule.** Primary blue is the only brand accent. Amber and sky exist for calendar semantics only - never as decorative palette.

**The No Extra Hue Rule.** Chart tokens may exist for data; they are not UI brand colors.

## Typography

**Display Font:** none (no display serif)
**Body Font:** IBM Plex Sans (ui-sans-serif, system-ui fallbacks)
**Label/Mono Font:** IBM Plex Sans (same family)

**Character:** One industrial sans for the whole product - clear, slightly technical, recruiter-safe. Loaded at 400/500/600/700 from Google Fonts.

### Hierarchy
- **Brand** (600, `1.5rem` / `text-2xl`, tight tracking, primary color): wordmark **TPE** in the top bar; product name beside it at `text-sm font-medium`.
- **Title** (600, `1.5rem`, tight tracking): page H1 (Calendrier, Gestion, Jours travaillés).
- **Section** (600, `1rem` / `text-base`): calendar month heading and leave-rail section titles.
- **Body** (400, `0.875rem`, 1.5): blurbs, list meta, helper copy (`max-w-2xl` on page intros).
- **Label** (500, `0.875rem`): controls, nav items, form labels.
- **Caption** (500, `0.75rem`): chips, badges, legend.
- **Micro** (500, `0.65rem`, wide tracking, often uppercase): weekday headers and cell initials.

**The Single Face Rule.** IBM Plex Sans is the only UI face. Do not swap to Inter, Roboto, or system as the primary face without updating this file.

## Layout

Sticky top bar (`h-14`) inside `max-w-[1400px]` with horizontal padding `1rem` / `1.5rem` from `sm`. Main content uses the same max width with `py-6` / `sm:py-8`. Footer mirrors the width with a top border and quiet link row.

**Dashboard split:** from `lg`, calendar panel ~1.65fr beside leave rail `minmax(280px, 1fr)` (~65/35), `gap-6`, both `panel`. Below `lg`, stack calendar then rail. Leave rail uses dense list rhythm: section `space-y-4`, rows `space-y-2`, row padding `0.75rem`, dashed empty state.

**Gestion:** section underline tabs (Équipes / Membres / Externes) then one panel. Prefer one job per section; no marketing hero chrome.

**The Topnav-Split Rule.** Shell is top bar + content + footer - not a persistent sidebar. Calendar stays primary; leave file is the secondary rail.

## Elevation & Depth

Mostly tonal layering: muted fills inside panels, light `shadow-sm` on panels and selected day cells, sticky header `backdrop-blur` on `bg-card/90`. Soft blue-tinted ambient shadows appear only on nav/chip hover - not multi-layer glow stacks.

### Shadow Vocabulary
- **Panel** (`0 1px 2px rgb(0 0 0 / 0.08)` via `shadow-sm`): panels and selected day cells.
- **Nav hover** (`0 6px 16px -12px rgb(37 99 235 / 0.45)`): top-bar nav item hover only.
- **Acting Member hover** (`0 8px 20px -14px rgb(37 99 235 / 0.35)`): chip hover only.
- **Leave row hover** (`shadow-md`): dense rail cards on hover.

**The Flat-By-Default Rule.** Surfaces are flat at rest. Lift is tonal first; shadows answer to state (selected day, hover), never as decoration.

## Shapes

Base radius `--radius: 0.5rem`. Controls and day cells use `rounded-md` (`0.375rem`); panels `rounded-xl` (`0.75rem`); leave rows and dashed empties `rounded-lg`; Acting Member avatar and initials discs `rounded-full`. Icon-only controls use `.touch-target` (44×44). Calendar day cells `min-h-11 min-w-11` with `aspect-square`.

**The Modest Radius Rule.** Stay in the `md`–`xl` band. No pill clusters for chrome; full rounding is for avatars only.

## Components

### Buttons
- **Shape:** gently rounded (`0.375rem`), `text-sm font-medium`, padding `0.5rem 0.75rem`.
- **Primary:** Operate Blue fill, white text; hover `brightness(1.1)`; disabled uses muted fill + muted text (not opacity-only).
- **Outline / Ghost:** transparent; outline keeps border; ghost uses muted text → muted wash on hover.
- **Danger:** red-700 fill for irreversible delete only.

### Acting Member chip
- **Style:** compact chip (`.acting-member-chip`) with accent avatar disc (`size-8`, initials), name (`sm+`), "Acting Member" caption, chevron.
- **State:** transparent at rest; muted wash + soft blue ambient shadow on hover; ring focus-visible.

### Panels / Containers
- **Corner Style:** `rounded-xl`
- **Background:** card surface on ops background
- **Shadow Strategy:** light `shadow-sm` + border
- **Internal Padding:** `1rem`–`1.25rem` (`p-4 sm:p-5`); member gate panel may use `p-8`

### Inputs / Fields
- **Style:** bordered, background canvas, `rounded-md`, `text-sm`
- **Focus:** `ring-2 ring-ring` (primary blue)
- **Disabled:** muted border/fill/text; pointer-events none

### Navigation
- **Top bar:** underline active - transparent background, `border-b-2`; inactive muted; active primary border + primary text (`.nav-item` / `.nav-item-active`). Hover brightens text and adds soft blue ambient shadow - not an accent fill pill.
- **Gestion sections:** `.tab` / `.tab-active` underline pattern with `aria-current="page"`; plain links, not ARIA tabs without panels.
- **Footer:** muted text links that brighten on hover; no accent underline required.

### Leave rail
- Dense queue inside the secondary panel: section title + primary count badge, blurb, then compact bordered rows (`bg-muted/40`, `px-3 py-3`) with status chips and inline actions. Empty state uses dashed border + muted wash.

### Calendar (signature)
- Primary fill for own day-offs; draft ring/check; pending dashed accent wash; teammate amber chips; edit-target sky fill. Legend uses micro swatches. Weekday headers are uppercase micro captions.

### Chips / Badges
- Filter chips: muted → primary fill when active.
- Role/archived badges: muted; external badge uses accent wash + primary-tint border.
- Leave status chips: semantic amber (pending), emerald (approved), destructive (rejected), muted (withdrawn) - status only, not brand.

## Do's and Don'ts

### Do:
- **Do** keep dark default + light toggle consistent across Calendrier, Gestion, and Jours travaillés.
- **Do** use underline-active top nav and the Acting Member chip pattern in the sticky header.
- **Do** preserve the ~65/35 calendar / leave-rail split from `lg` upward with dense rail rows.
- **Do** meet ~44px touch targets on icon controls and calendar cells.
- **Do** prefer CSS calendar tokens over ad-hoc sky/amber utilities for day-cell semantics.
- **Do** keep CONTEXT.md French domain vocabulary in labels.

### Don't:
- **Don't** pursue high-concept art directions (paper worlds, teletext, arcade).
- **Don't** nest dark pits inside dark chrome for the main calendar.
- **Don't** fill active top-nav items with accent wash - underline + primary text is the system.
- **Don't** use `role="tab"` without matching tabpanels.
- **Don't** rely on opacity alone for disabled primary actions.
- **Don't** replace IBM Plex Sans with Inter/Roboto/system as the primary face without updating this file.
