# Radix primitives for Dialog, Select, and DropdownMenu

`@vianneytraina/ui` wraps `@radix-ui/react-dialog`, `@radix-ui/react-select`, and `@radix-ui/react-dropdown-menu` for Dialog, Select, and DropdownMenu. Those packages are declared in `packages/ui` `dependencies`. Button, TextField, Label, and Badge stay handwritten native elements.

This ADR records what is delegated, why, and what that costs. A11’s monorepo README cites this file. It does not restate it.

## Decision

Dialog, Select, and DropdownMenu are presentational wrappers around Radix. They add class names, tokens (ADR-0015), and a French close label on Dialog. They do not reimplement overlay behaviour.

Button, TextField, Label, and Badge do not wrap Radix. Their accessible behaviour is a native `button` / `input` / `label` / `span` plus a handful of attributes (`type`, `disabled`, `htmlFor`). That does not justify a runtime dependency.

### 1. What is delegated

**Dialog** (`@radix-ui/react-dialog`, via `@radix-ui/react-focus-scope`, `@radix-ui/react-dismissable-layer`, `@radix-ui/react-focus-guards`, `@radix-ui/react-portal`, `react-remove-scroll`, `aria-hidden`):

- Portal: Content and Overlay render under `document.body` (or a `container`), outside the React island’s DOM parent.
- `role="dialog"` on Content. `aria-modal="true"` when `modal` is true (the default). Title and Description wire `aria-labelledby` and `aria-describedby`.
- Modal layer: siblings outside the dialog are marked `aria-hidden` / inert while open, so assistive tech does not walk the page behind the overlay.
- Focus trap: Tab and Shift+Tab cycle inside Content. Opening moves focus into Content (`tabIndex={-1}` on the container). Nested dialogs keep only the topmost scope active.
- Focus restore: closing returns focus to the element that had it before open (normally the trigger). That still works when Content lived in a portal.
- Escape closes (DismissableLayer). Pointer-down outside / overlay click closes unless the caller cancels `onPointerDownOutside` / `onInteractOutside`.
- Body scroll lock while open: `react-remove-scroll` stops background scroll, keeps the scroll position, and covers iOS Safari rubber-banding and scroll chaining that a `overflow: hidden` on `body` misses.
- Presence: `data-state="open" | "closed"` for enter/exit without unmounting on the first frame.

**Select** (`@radix-ui/react-select`, plus the dialog stack above and `@radix-ui/react-popper`, `@radix-ui/react-collection`, `@radix-ui/react-visually-hidden`):

- Trigger `role="combobox"` with `aria-expanded`, `aria-controls`, `aria-autocomplete="none"`. Content `role="listbox"` in a portal. Items `role="option"` with `aria-selected`.
- Open from the keyboard: Space, Enter, ArrowDown, ArrowUp on the trigger.
- List navigation: ArrowDown / ArrowUp move the highlight and skip disabled items. Home / End jump to first / last.
- Typeahead: printable characters move the highlight to the next item whose text starts with the typed prefix.
- Enter / Space select the highlighted item and close. Escape closes without changing the value. Pointer hover highlights; click selects.
- Focus restore to the trigger on close.
- Positioning: `position="item-aligned"` (our default) mimics a native `<select>` by lining the selected item up with the trigger. `position="popper"` uses Radix Popper (Floating UI): side, align, offset, collision detection, flip, `collisionPadding`, hide when detached.
- Overflow: Viewport plus ScrollUpButton / ScrollDownButton when the list is taller than the available height.
- Form field: a visually hidden native `<select>` (via `@radix-ui/react-visually-hidden`) submits `name` / `value` with the surrounding form.

**DropdownMenu** (`@radix-ui/react-dropdown-menu`, plus the menu/popper stack):

- Trigger is a button with `aria-haspopup="menu"` and `aria-expanded`. Content `role="menu"` in a portal. Items `role="menuitem"` (checkbox and radio items use `menuitemcheckbox` / `menuitemradio`).
- Open from the keyboard: Space, Enter, ArrowDown, ArrowUp on the trigger.
- Item navigation: ArrowDown / ArrowUp move the highlight and skip disabled items. Home / End jump to first / last. Typeahead matches item text.
- Enter / Space activate the highlighted item and close (unless the caller cancels `onSelect`). Escape closes without activating. Pointer click activates.
- Focus restore to the trigger on close.
- Positioning: Radix Popper (side, align, offset, collision). Content is portaled so it is not clipped by the island.

`packages/ui` does not re-code any of the above. Tests (A5 seam 3) assert the observable result (roles, Escape, Tab loop, list keys, menu keys). They do not assert Radix internals.

### 2. Why not a homemade implementation

This chantier ships a versioned npm package (A4, A7, A9). It does not exist to reimplement accessibility primitives.

Radix is the audited implementation of those primitives. A hand-rolled focus trap systematically misses cases that show up in real overlays:

- Screen readers: hiding the rest of the page (`aria-hidden` on siblings) without breaking VoiceOver’s rotor or restoring it on close; `aria-modal` plus labelled Content rather than a `div` with `tabIndex`.
- iOS: background scroll lock that survives rubber-banding, touch chaining, and the virtual keyboard; focus that still lands in a portaled dialog.
- Tab order across a portal: the next Tab target is not the next node in the island tree. A homemade trap that walks `querySelectorAll` inside Content fails when the close button, the form, and the trigger live in different document subtrees.
- Nested dialogs, restore-focus after unmount, and dismiss-on-outside that must ignore the trigger click that opened the overlay.

Rebuilding that for overlay components would spend the timebox on a worse Dialog. Wrapping Radix spends it on tokens, the barrel, and the publish proofs.

### 3. What it costs

Three runtime dependencies on the published package (`@radix-ui/react-dialog`, `@radix-ui/react-select`, `@radix-ui/react-dropdown-menu`). They are listed in `package.json` inside the tarball. tsup does not inline them in `dist/index.js` (ADR-0011 excludes `dependencies`). Installing `@vianneytraina/ui` therefore pulls those packages **and** their graph: focus-scope, dismissable-layer, focus-guards, portal, popper, presence, `react-remove-scroll`, `aria-hidden`, visually-hidden, collection, and the shared Radix primitives. That is extra bytes, extra version resolution, and a second copy if `apps/web` still depends on the same Radix packages until A9.

The public barrel grows to Radix’s compound surface, not just `Dialog`, `Select`, and `DropdownMenu`. Named exports today include `DialogPortal`, `DialogOverlay`, `DialogClose`, `SelectGroup`, `SelectLabel`, `SelectSeparator`, `SelectScrollUpButton`, `SelectScrollDownButton`, `DropdownMenuPortal`, `DropdownMenuGroup`, `DropdownMenuCheckboxItem`, and `DropdownMenuSub` (ADR-0009). Each name is a semver commitment. Removing `DialogPortal` later is a breaking change even if no Team Planning Engine screen imports it yet. A10’s CHANGELOG has to treat those names as public API.

Consumers inherit a React constraint from both layers. ADR-0014 requires `react` / `react-dom` `>=18.0.0`. Radix 1.1 / 2.2 peer-depend on `react` / `react-dom` `^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc`. A consumer must satisfy **both**. pnpm will warn (or fail under `strict-peer-dependencies`) if the app’s React is outside Radix’s range, even when it meets our peer. We do not bundle React (ADR-0014); we do couple the consumer to a React that Radix accepts.

## Alternatives not taken

- **Handwritten Dialog, Select, and DropdownMenu.** Rejected: the timebox is packaging, not a new focus-trap. The failure modes above are the product.
- **Headless UI, React Aria, or Ariakit.** Viable primitives. Rejected for this extract: Team Planning Engine already uses Radix Dialog, Select, and Dropdown Menu. A5 lots copy that behaviour, not a second overlay stack.
- **Radix for Button, TextField, Label, and Badge.** Rejected: native elements already expose the role, name, disabled, and keyboard behaviour those components need. `@radix-ui/react-label` would add a dependency for `htmlFor`.
- **Bundling Radix into `dist/index.js`.** Would hide the install graph and duplicate Radix if the app still imports it. Dependencies stay declared; tsup leaves them external (ADR-0011).
- **Peer-depending on Radix instead of depending on it.** Would force every consumer to install matching Radix versions by hand. A design-system package that wraps Radix should bring those wrappers’ runtime with it. The cost in section 3 is accepted.
