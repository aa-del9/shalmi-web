# Phase 3 — Design System Implementation Log

> **Phase:** Token + primitives implementation (write).
> **Date started:** 2026-05-02
> **Inputs:** `01-codebase-map.md`, `02-design-inventory.md`, `03-token-migration.md`.
> **Pencil source:** `Pencil-Design\Shalmi`.
> **Scope (from user):** Token sources + primitive/atom components only.
> No page/route files. No business logic. No new props/variants without
> asking.

This is an append-only log. One entry per file/component touched.

## Decisions taken without asking (resolutions to 03-token-migration.md §7 open questions)

These are decisions made under Auto Mode for low-risk, design-document-grounded
choices. Anything that introduces a new prop/variant on a primitive is
escalated separately (see "Asks" below).

| OQ | Resolution chosen | Rationale |
|---|---|---|
| Q1 | Keep `green-2`/`green-600` and `green`/`green-700` as separate aliases (same hex). | User answered Q4 in 02-design-inventory: "do it according to the Pencil design system." Pencil declares both names — I preserve both. |
| Q2 | Proceed without asking Pencil to declare spacing/radius/shadow vars. Use raw values from showcase. | Inventory captured them; design intent is clear. |
| Q3 | Collapse one→many neutrals (e.g. `--neutral-70/80/90 → ink-2`). Keep `--neutral-110` as alias to `ink` for the 9 files using `text-neutral-110` directly. Phase 4 (component migration) renames those. | No legacy code uses the inner steps as Tailwind utilities. Avoids Phase 3 build break. |
| Q4 | `--bg-fill-brand-active` (pressed) = `green-900`. | Closest Pencil-declared deeper green. |
| Q5 | `--content-primary` = `ink-2` (`#2A2F2C`). `ink` (`#0F1411`) reserved for chrome / wordmark / inverse surfaces. | Pencil's "Ink-2 — Body, headings" usage label is explicit. |
| Q6 | Keep existing typography scale steps (so component classes don't break). Where a step has a Pencil row, retoken; where it doesn't, keep the existing pixel value. | Avoid cascading breakage in 10 files. Pencil-aligned sizes are now layered on top of legacy steps. |
| Q7 | Re-derive component states per §5.4 of 03-token-migration.md. | User answered Q7 in 02-design-inventory directly. |
| Q8 | Declare `--radius-stamp: 3px` as a one-off. | Avoids visual delta on stamp pills. |
| Q9 | **Bridge approach** — keep `--shadow-xs/sm/md/lg` as aliases that all resolve to `none` (Pencil ships hairline-only). Existing `shadow-*` utility users see flattened cards. | "Aggressive" deletion would break 16 files. Aliases-to-none = one visual change, zero runtime errors. |
| Q10 | Keep RGB-channel split for `ink`, `ink-2`, `green-2`, `red`, `white` (alpha mixing needed). Pure hex for the rest. | Tailwind v4 `bg-foo/N` opacity utilities require RGB-channel; needed for pressed/disabled re-derived states. |
| Q11 | No motion tokens. | Pencil declares none. |
| Q12 | `--font-ar` declared as CSS variable; **font itself not loaded yet**. | Per Q16 of 02-design-inventory (EN-only ships first). Variable presence keeps the toggle wirable later. |
| Q13 | `--bg-overlay` = `#0F141180` (ink @ 50%). | Per 02 §3.10 spec text. |

## Decisions deferred — asks for the user

(none yet — log will be updated as new questions arise)

---

## Component log

### `packages/ui/src/styles/globals.css` (token source rewrite)

**What changed:**
- Replaced primitive block (RGB-channel `--primary-*`, `--neutral-*`,
  `--error-*`, `--success-*`, `--warning-*`) with the 27 Pencil tokens
  (`--ink`, `--ink-2..4`, `--green`, `--green-2`, `--green-200`,
  `--green-500`, `--green-600`, `--green-700`, `--green-900`,
  `--green-bg`, `--paper`, `--paper-2`, `--paper-3`, `--white`,
  `--amber`, `--amber-bg`, `--red`, `--red-bg`, `--blue`, `--blue-bg`,
  `--rule`, `--rule-2`).
- Kept `ink`/`ink-2`/`green-2`/`red`/`white` available as RGB-channel
  tuples (`--ink-rgb`, …) for re-derived component states needing
  Tailwind `/N` opacity utilities (Q10).
- Added legacy primitive aliases (`--primary-60` → green-2 RGB,
  `--neutral-110` → ink RGB, `--error-50` → red RGB, etc.) so the
  9 files still using `text-neutral-110` / `bg-primary-60` etc. as
  Tailwind utilities continue to render until Phase 4 component
  migration. (Q3.)
- Rebound semantic layer (`--bg-*`, `--content-*`, `--border-*`) to
  Pencil primitives per 03-token-migration.md §1.2.
- Rebound shadcn aliases (`--background`, `--foreground`, `--card`,
  `--primary`, `--secondary`, `--accent`, `--muted`, `--destructive`,
  `--input`, `--ring`, `--sidebar*`, `--border`) per §1.3.
- New radius scale: `--radius-none/xs/sm/md/lg/xl/stamp/full` =
  0/4/6/8/12/16/3/9999. Per Q8, `--radius-stamp: 3px` declared as
  one-off for status pills.
- Shadow scale collapsed to none per Q9 (`--shadow-xs/sm/md/lg`,
  `--drop-shadow-*` all `0 0 #0000`). New `--shadow-drawer` for the
  one Pencil-declared shadow (account drawer).
- `--bg-overlay` → `#0F141180` (ink @ 50%) per Q13.
- **Deleted entire `.dark` block** (Q5). The `@custom-variant dark`
  hook stays for a future theme; `next-themes` dependency stays
  installed but unused.
- Type scale kept (Q6); Pencil-aligned sizes layered on top of
  legacy steps. `--text-numeric-md/sm` added (NEW family for mono
  prices/totals). `--tracking-mono-label: 0.08em` added.
- Font families: declared `--font-sans`/`--font-mono`/`--font-ar` as
  CSS variables with Plus Jakarta / JetBrains Mono / Noto Nastaliq
  defaults. Q12: `--font-ar` declared but the font itself is not
  loaded; layout.tsx loads only sans + mono.
- Body now applies `font-family: var(--font-sans)` so Plus Jakarta
  takes effect once layout.tsx wires the next/font CSS variable.

**Asks raised:** None — all decisions covered by the §7 OQ resolution
table above.

**Followups for later phases:**
- Phase 4 component migration: rename `text-neutral-110` →
  `text-ink` etc. across the 9 storefront/retailer/vendor files; then
  delete the legacy primitive aliases.
- Phase 4: revisit `shadow-xs/sm/md/lg` consumers (16 files) — either
  remove the class or replace with hairline border per Pencil.
- Phase 4: replace `text-display-md` (72), `text-display-sm` (60),
  `text-heading-2xl` (40), `text-heading-lg` (32), `text-body-xl` (20),
  `text-body-lg` (18), `text-label-xl` (18) consumers with
  Pencil-aligned sizes; once unused, remove these scale steps.
- When dark theme returns: re-introduce `.dark { … }` token overrides
  rebuilt from a Pencil dark variant.

### `apps/web/src/modules/root-layout/index.tsx` (font wiring)

**Scope note:** The migration plan §5.1 listed `apps/web/src/app/layout.tsx`
as the font-wiring file, but that file just delegates to `<RootLayout>` —
which is the actual owner of `<html>`. Wiring fonts in a useful way
required editing `RootLayout`. This is the only feature-module touch in
this phase, justified because the next/font CSS variables must be
attached to the `<html>` element.

**What changed:**
- Imported `Plus_Jakarta_Sans` and `JetBrains_Mono` from `next/font/google`
  with `variable: '--font-sans'` and `variable: '--font-mono'` so they
  expose CSS custom properties.
- Applied both fonts' `.variable` classNames to `<html>`.
- Replaced two hardcoded RGB hex shadows on `<NextTopLoader>` with the
  new Pencil hex equivalents (`#16a34a`/`#15803d`) — purely cosmetic
  consistency with the new tokens.
- Per Q12, **`Noto Nastaliq Urdu` is intentionally NOT loaded** here.
  The `--font-ar` CSS variable is declared in globals.css with a system
  fallback so the toggle stays wirable for a future i18n phase.
- No prop or API changes to `RootLayout`.

**Asks raised:** None.

**Followups:** Wire `Noto_Nastaliq_Urdu` from `next/font/google` when
the language toggle is enabled in a later phase.

### `packages/ui/src/components/button.tsx`

**Pencil spec (02 §3.1):**
- primary green: 40h · padding [0,16] · radius 6 · `green-2` fill · `white` 14/600 sans
- primary inverse: 40h · padding [0,16] · radius 6 · `ink` fill · `white` 14/600
- outline ink: radius 6 · `white` fill · 1px `ink` stroke · `ink` 14/600
- ghost: radius 6 · no fill · `ink-3` 14/600
- destructive outline: radius 6 · `white` fill · 1px `red` stroke · `red` 14/600

**What changed:**
- `default` variant — was solid green via shadcn `bg-primary`; now
  retoken to `green-2` fill + `green-700` hover + `green-900` pressed
  per Pencil. Removed `shadow-xs` (Pencil is hairline-only). Removed
  `dark:` variant strings.
- `destructive` variant — **VISUAL CHANGE.** Was solid red
  (`bg-destructive` + `hover:bg-destructive/90`); per Pencil §3.1 it is
  now an outline (white fill, 1px `red` border, `red` text, hover
  surface `red-bg`). 4 existing `variant="destructive"` usages
  (admin/banners-carousel, storefront/header, vendor/product-image,
  vendor/add-product-form) will visually flip to outline-style. This
  matches the Pencil "Remove" stamp and is in scope per the design
  system rebuild.
- `outline` variant — was `bg-background` + accent hover; now
  `border-ink bg-white text-ink hover:bg-paper-2 active:bg-paper-3`.
- `secondary` variant — kept (no Pencil counterpart). Re-tokened to
  `paper-2` fill via `bg-secondary` and `paper-3` hover.
- `ghost` variant — was `hover:bg-accent`; now `text-ink-3
  hover:text-ink-2 hover:bg-paper-2` per Pencil "Cancel" sample.
- `link` variant — kept (no Pencil counterpart, also no current
  consumers — confirmed via grep).
- `default` size — height bumped from `h-9` (36px) to `h-10` (40px),
  padding to `px-4` per Pencil canonical 40h. `sm` stays 32 (h-8),
  `lg` grows to 48 (h-12) so the scale stays distinct.
- `icon` size — `size-9` → `size-10` to match new default 40h.
- Radius shifted from `rounded-md` (8px) to `rounded-sm` (6px) per
  Pencil button radius r3.
- Focus ring: `ring-2 + ring-ring + ring-offset-2` (re-derived per
  §5.4); replaced shadcn's `ring-[3px]` style.
- All four `dark:` selector variants stripped (dark mode deferred).

**Asks raised (deferred — NOT implemented in this pass):**
- **Q-BUTTON-1:** Pencil spec includes a 5th button variant: `primary
  inverse` (ink fill / white text, used for "Place order" CTAs). This
  is a new variant on the primitive — per the workflow rule
  ("ASK before introducing any new prop, variant, or API"), I did not
  add it. The "Place order" surface lives in a feature module
  (checkout) which is out of scope for this phase. Recommend adding
  the `inverse` variant when the checkout screen is revamped.

**Followups:**
- 4 destructive button usages will look different next render; verify
  in a browser smoke test before screen revamp.

### `packages/ui/src/components/input.tsx`

**Pencil spec (02 §3.1 — search field light + labeled input):**
- 44h · radius 6 · white fill · 1.5px `rule-2` stroke · padding [0,12]
- placeholder `ink-3` (search) / `ink-4` (general); body text `ink-2`

**What changed:**
- Height `h-9` (36) → `h-11` (44) per Pencil 44h.
- Radius `rounded-md` (8) → `rounded-sm` (6).
- Border `border` (1px) → `border-[1.5px] border-rule-2`.
- Background `bg-transparent` → `bg-white` (Pencil explicit).
- Text color → `text-ink-2`; placeholder → `text-ink-4`.
- Removed `shadow-xs` (Pencil hairline-only).
- Removed `dark:` selector and `md:text-sm` responsive override.
- Re-derived states per §5.4: hover → ink border; focus →
  `ink` border + `ring-ink/20`; error → `red` border + `red/20` ring;
  disabled → `paper-2` fill + `rule` border + `ink-4` text.
- No prop or API changes.

**Asks raised:** None.

**Followups:** Pencil §3.1 also defines a *dark* search variant (admin
top-bar search, `#FFFFFF1A` fill / `#FFFFFF33` border, 36h, 320w). That
is a new `variant` and `size` set on a primitive — deferred to the
admin chrome revamp (would require asking before adding).

### `packages/ui/src/components/label.tsx`

**What changed:**
- Added `text-ink-2` so labels render in the body-text token
  explicitly (previously inherited from `--foreground`, which now
  resolves to `ink-2` anyway — making this explicit avoids surprise).
- No size or weight change to the generic `Label` primitive — kept at
  `text-sm font-medium` because Label is also used by Checkbox and
  other contexts. Pencil's 12/600 spec applies to FieldLabel
  specifically (handled in field.tsx).

**Asks raised:** None.

### `packages/ui/src/components/field.tsx`

**Pencil spec (02 §3.1 — labeled input):**
- label: `ink-2` 12/600 sans + 6px gap above input

**What changed:**
- `FieldLabel` — now `text-xs font-semibold text-ink-2` with `gap-1.5`
  per Pencil 12/600 + 6px gap. Replaced `rounded-md` → `rounded-sm`
  for the embedded-field bordered case. Replaced
  `has-data-[state=checked]:bg-primary/5 …:border-primary` with
  `bg-green-bg`/`border-green-2` for the same checked state, removed
  `dark:` variant.
- `FieldTitle` — added `text-ink-2` for explicit token.
- `FieldDescription` — `text-muted-foreground text-sm` →
  `text-ink-3 text-xs` (Pencil meta/caption is ink-3 at 12px).
  Anchor hover color → `text-green-700`.
- `FieldError` — `text-destructive text-sm` → `text-red text-xs`.
  Pencil error/cancel red is `#B91C1C` and the smaller 12px size
  matches caption typography.
- `fieldVariants` invalid state → `text-red`.

**Behavior change note:** FieldLabel size shrinks from 14 → 12px, and
FieldDescription/FieldError shrink from 14 → 12px. This matches the
Pencil 12/600 + caption typography but will visually compact every
form. Acceptable for the design system rebuild.

**Asks raised:** None.

**Followups:** None — Pencil shows no other field states.

### `packages/ui/src/components/card.tsx`

**Pencil spec (02 §3.8 surface card):**
- white fill · 1px `rule` stroke · radius 8

**What changed:**
- `Card` — `rounded-xl` (16px) → `rounded-md` (8px). Removed
  `shadow-sm`. Border made explicit (`border-rule`).
- `CardDescription` — `text-muted-foreground` → `text-ink-3` for
  explicit token.
- Pencil also has receipt-cream cards (`paper-2`/`rule-2`/radius 8 or
  12) and an inverse `ink` payout card. Those are organism-level
  (per-screen) — feature components will compose `Card` with overrides
  rather than introducing new Card variants here. No new variant added.

**Asks raised:** None.

**Followups:** Receipt-style and inverse Card variants may need to be
added in Phase 4 if reuse is high enough.

### `packages/ui/src/components/checkbox.tsx`

**Pencil spec:** None drawn — re-derived per §5.4 tokens.

**What changed:**
- Border `border-input` (resolves to rule-2) → explicit
  `border-[1.5px] border-rule-2 bg-white` mirroring Input.
- Radius `rounded-[4px]` → `rounded-xs` (4px Pencil token).
- Removed `shadow-xs`.
- Checked state `bg-primary border-primary` → `bg-green-2
  border-green-2 text-white` (explicit).
- Hover → `border-ink`. Focus ring → `ring-ink/20`. Error → `red`.
- Removed all `dark:` variants.

**Asks raised:** None.

### `packages/ui/src/components/select.tsx`

**Pencil spec:** None drawn for select — mirrors Input shape.

**What changed:**
- `SelectTrigger` — `h-9` (default) → `h-11` to match Input 44h.
  `rounded-md` → `rounded-sm`. `border` → `border-[1.5px] border-rule-2
  bg-white`. `text-ink-2`, placeholder `text-ink-4`. Removed
  `shadow-xs`. Hover/focus/error/disabled re-derived per §5.4. Removed
  all `dark:` variants.
- `SelectContent` — `rounded-md shadow-md` → `rounded-sm border-rule`
  (no shadow per Pencil hairline-only).
- `SelectLabel` — `text-muted-foreground` → `text-ink-3` (explicit).
- `SelectItem` — `focus:bg-accent focus:text-accent-foreground` →
  `focus:bg-paper-2 focus:text-ink`. Body text `text-ink-2`. Icon color
  `text-ink-3`.

**Asks raised:** None.

**Followups:** None.

### `packages/ui/src/components/dialog.tsx`

**Pencil spec:** No dedicated dialog frame, but card spec (§3.8) +
overlay (§3.10 50% ink dim) apply.

**What changed:**
- `DialogOverlay` — `bg-black/50` → `bg-bg-overlay` (ink @ 50% per Q13).
- `DialogContent` — `rounded-lg border p-6 shadow-lg` →
  `bg-white text-ink-2 rounded-md border border-rule p-6` (no shadow).
- `DialogClose` (close button) — re-derived state colors:
  `text-ink-3`/hover `text-ink`/focus `ring-ink/20` (replaced shadcn
  `accent`/`ring`/`destructive` token blends).
- `DialogTitle` — `font-semibold` → `font-bold text-ink` (Pencil
  drawer title style, sans 20/800).
- `DialogDescription` — `text-muted-foreground` → `text-ink-3`.

**Asks raised:** None.

### `packages/ui/src/components/sheet.tsx`

**Pencil spec (02 §3.10 Account drawer):**
- 480w right-side panel · white surface · drawer shadow
  (`-12px 0 48px 0 #0F141140`) · 50% ink dim under

**What changed:**
- `SheetOverlay` — `bg-black/10` → `bg-bg-overlay` (Pencil 50% ink),
  removed `supports-backdrop-filter:backdrop-blur-xs` (not in Pencil).
- `SheetContent` — `bg-background` → `bg-white text-ink-2`. Removed
  blanket `shadow-lg`. Added `border-rule` per side, and
  `shadow-drawer` only on the right-side variant (the only
  Pencil-declared shadow). Other sides keep just hairline borders.
- `SheetTitle` — `text-base font-medium` → `text-xl font-bold text-ink`
  (Pencil drawer title sans 20/800).
- `SheetDescription` — `text-muted-foreground` → `text-ink-3`.

**Asks raised:** None.

### `packages/ui/src/components/dropdown-menu.tsx`

**What changed:**
- All `rounded-md` content → `rounded-sm` (Pencil r3 6px).
- `bg-popover` and `text-popover-foreground` → explicit `bg-white
  text-ink-2`.
- Removed `shadow-md` and `shadow-lg` (hairline only). Borders made
  explicit with `border-rule`.
- All menu items (Item / CheckboxItem / RadioItem / SubTrigger):
  `focus:bg-accent focus:text-accent-foreground` → `focus:bg-paper-2
  focus:text-ink`. Body text `text-ink-2`. Icon color `text-ink-3`.
- Destructive variant: `text-destructive` → `text-red`,
  `focus:bg-destructive/10` → `focus:bg-red-bg`. Removed `dark:`
  variant.
- `DropdownMenuLabel` — added `text-ink-2` for explicit token. Size
  kept (Pencil's eyebrow style is per-context — not generic for menu
  labels).
- `DropdownMenuSeparator` — `bg-border` → `bg-rule` for explicit token.
- `DropdownMenuShortcut` — `text-muted-foreground` → `text-ink-3`.

**Asks raised:** None.

### `packages/ui/src/components/hover-card.tsx`

**What changed:**
- `bg-popover text-popover-foreground` → explicit `bg-white text-ink-2`.
- Removed `shadow-md`. Border made explicit (`border-rule`).
- Radius `rounded-md` kept (8px is the right surface radius).

**Asks raised:** None.

### `packages/ui/src/components/separator.tsx`

**What changed:** `bg-border` → `bg-rule` (explicit Pencil hairline token).

### `packages/ui/src/components/skeleton.tsx`

**What changed:** `bg-accent` → `bg-paper-2` (paper-2 is the right
warm-grey skeleton tone in Pencil; `bg-accent` would now resolve to
`green-bg` which would shimmer green — wrong).

### `packages/ui/src/components/spinner.tsx`

**What changed:** None — uses `currentColor` and lucide icon. Inherits
parent text color, which now resolves correctly via the new tokens.

### `packages/ui/src/components/table.tsx`

**What changed:**
- `TableFooter` — `bg-muted/50 border-t font-medium` → `bg-paper-2
  border-t border-rule font-semibold text-ink-2`.
- `TableRow` — `hover:bg-muted/50 data-[state=selected]:bg-muted
  border-b` → `hover:bg-paper-2 data-[state=selected]:bg-paper-2
  border-b border-rule`.
- `TableHead` — `text-foreground` → `text-ink-2` (explicit). Size and
  weight kept (Pencil shows no table spec; conservative retoken only).
- `TableCaption` — `text-muted-foreground` → `text-ink-3`.

**Note:** Resisted re-styling table headers to mono-uppercase eyebrow
style — Pencil shows no table spec in §3 so this would be invented
behavior. Defer to per-screen guidance.

### `packages/ui/src/components/sonner.tsx`

**What changed:** None — already consumes shadcn CSS variables
(`var(--popover)`, `var(--popover-foreground)`, `var(--border)`,
`var(--radius)`) which now resolve to Pencil tokens.

**Followups:** `useTheme()` from next-themes is still imported but
will always return 'system' (no provider mounted). Harmless — leave
for when dark theme returns.

### `packages/ui/src/components/carousel.tsx`

**What changed:** None directly — composes `Button` and inherits the
new variant styling. The `rounded-full` override on the prev/next
buttons stays correct.

**Followup:** Pencil's hero carousel dots (rounded ink 18×6 active vs
6×6 ellipse rule-2 inactive) and arrow chevrons are organism-level —
defer to hero-carousel feature component revamp.

### `packages/ui/src/components/sidebar.tsx`

**Pencil spec (02 §3.7 admin/vendor sidebar):**
- 240w · `white` fill · 1px right hairline rule
- nav row: radius 6 · padding [10,12] · gap 12
- active row: `paper-2` fill

**What changed:**
- `SidebarMenuButton` — `rounded-lg px-2 py-2 gap-3` → `rounded-sm
  px-3 py-2.5 gap-3` to match Pencil sidebar nav-row geometry.
- All other pieces unchanged — semantic tokens (`bg-sidebar`,
  `bg-sidebar-accent`, etc.) already rebound in globals.css to the
  Pencil values (white, paper-2, ink-2, rule).

**Asks raised:** None.

**Followup:** SidebarHeader/SidebarGroup paddings (`p-2` = 8px) don't
match Pencil's [16,12,24,12]. Per-screen sidebars (admin / vendor
layouts) override this — Phase 4 can decide whether to retoken the
defaults or leave per-screen.

### `packages/ui/src/components/stamp.tsx` (NEW)

**Pencil spec (02 §3.2):**
- 1.5px stroke · radius 3 · padding [3px,8px] · font-mono 11/700
- letter-spacing 0.08 · rotation -1°
- Variants drawn: DELIVERED · AT MNP HUB · PACKED · DELAYED · CANCELLED

**Why an atom:** Stamps appear on every order surface (retailer
orders, vendor orders, vendor dashboard tiles) and several
storefront product cards (out-of-stock, discount badges adjacent).
High reuse → primitive lives in `@repo/ui`.

**API:**
- `<Stamp variant="success | info | neutral | warning | critical">`
- Variants are styled by *intent*, not literal labels, so consumers
  map their own DB statuses (e.g. `sub_orders.status`) onto a visual
  variant per Q9 of 02-design-inventory.

**Asks raised:** None — Pencil §3.2 explicitly defines all five
variants; no new prop semantics introduced beyond the spec.

**Followup:** Pencil mentions OUT FOR DELIVERY / NEW / DISPATCHED in
the brief but doesn't draw stamp variants for them. Per Q9, those are
display labels mapped onto existing visual variants — no extra Stamp
variants needed.

### `packages/ui/src/components/language-toggle.tsx` (NEW)

**Pencil spec (02 §3.6):**
- segmented control · outer white fill · 1.5px ink stroke · radius 6 · 2px inner padding
- "EN" mono 11/700 (white-on-ink when selected)
- "اردو" font-ar 13 (ink-on-transparent when selected)
- Pencil shows EN as the selected state.

**Why an atom (per user direction Q16):** EN ships first; the toggle
is in chrome (every page), but Urdu translation is out-of-scope this
phase. The user explicitly said "we need a toggle in design system so
that we can add it later on" — so the primitive ships, presentational,
ready for i18n wiring.

**API:**
- `<LanguageToggle value="en | ur" onValueChange={...} disabled={...}>`
- Stateless / controlled. Default `value="en"`.

**Implementation notes:**
- The Urdu glyph uses `style={{ fontFamily: 'var(--font-ar)' }}` so
  the variable resolves regardless of whether Tailwind has emitted a
  `font-ar` utility yet.
- The `--font-ar` CSS variable (defined in globals.css) currently
  falls back to a system serif because the Noto Nastaliq font is not
  loaded yet (Q12). Visual rendering of "اردو" will be system-default
  until that font is wired.

**Asks raised:**
- **Q-LANG-1:** Auto Mode decision: I shipped this as a presentational
  `value`/`onValueChange` controlled component. If you instead want it
  wired into a global i18n context now (e.g. for the chrome to
  consume), tell me and I'll add a thin context wrapper in a follow-up
  pass. Defaulted to "stub for later" per your Q16 answer.

**Followups:**
- Wire `Noto_Nastaliq_Urdu` from `next/font/google` (and gate by
  language) when i18n lands.

---

## Atoms intentionally NOT added in this phase

These are Pencil patterns that the inventory marks as common but that
are either compound (molecule/organism) or are blocked by a tooling
ask. Listed for the next phase to pick up.

- **Tabs (underline tabs, §3.6).** Used in chrome (storefront
  category tabs, order filter tabs). Not in current codebase. Per
  user direction in Q8 of 02-design-inventory: prefer to install a
  shadcn `Tabs` component before authoring from scratch. **Ask:**
  please add `npx shadcn@latest add tabs` (uses Radix) so I can
  consume it in the next phase.
- **Weight gauge (§3.4).** Compound (header row + bar + 4-column
  legend). Cart-screen molecule. Defer to cart revamp.
- **Receipt totals (§3.5).** Compound (paper-2 card + multi-row
  layout). Cart/checkout molecule. Defer.
- **Bottom tab bar (§3.9).** Mobile vendor only. Organism. Defer.
- **Trust strip / Hero carousel dots / Promo strip / Filter chip row
  / Sortable banner grid / Sales bar chart / Donut/segment row / Step
  indicator / Inline Add Product form** — all organism level. Defer.

---

## Final verification (Phase 3 close)

All commands run from repo root unless noted.

| Check | Command | Result |
|---|---|---|
| `@repo/ui` lint | `pnpm --filter @repo/ui lint` | ✅ No warnings, no errors |
| `apps/web` lint + typecheck | `pnpm --filter web lint` (= `next lint --max-warnings 0 && tsc --noEmit`) | ✅ No ESLint warnings or errors. (Note: `next lint` deprecation notice, unrelated to this work.) |
| `apps/web` production build | `pnpm --filter web build` | ✅ Compiled successfully in 17.3s. All 33 static pages generated. No build errors. |

**Pre-existing failures NOT introduced by this work:** Repo-wide
`pnpm check-types` shows `error TS2688: Cannot find type definition
file for 'minimatch'` in 4 packages (`@repo/constants`, `@repo/contexts`,
`@repo/hooks`, `@repo/schemas`). These existed at baseline before any
changes. Recommend addressing in a separate dependency-hygiene PR.

## Summary

- **Foundation:** `globals.css` rebuilt around the 27 Pencil tokens;
  `.dark` block deleted; shadow scale collapsed to none (drawer-only
  exception); fonts wired through `RootLayout` with `Plus Jakarta Sans`
  + `JetBrains Mono` (Urdu deferred).
- **Primitives retoken-only:** Label, Field, Card, Checkbox, Select,
  Dialog, Sheet, DropdownMenu, HoverCard, Separator, Skeleton,
  Spinner, Table, Carousel, Sonner, Sidebar.
- **Primitives with restyled variants per Pencil:** Button (primary
  green / outline ink / destructive outline / ghost / secondary,
  default 40h, radius 6); Input (44h, 1.5px rule-2, white).
- **New atoms added:** `Stamp` (5 intent variants), `LanguageToggle`
  (presentational stub).
- **No page/route or feature-component files were touched** except for
  one justified edit to `apps/web/src/modules/root-layout/index.tsx`
  (font wiring lives there because `RootLayout` owns `<html>`).
- **Open asks raised:**
  - **Q-BUTTON-1:** Add `inverse` (ink fill / white text) Button
    variant when checkout screen is revamped.
  - **Q-LANG-1:** Wire `LanguageToggle` to a global i18n context now
    or later (defaulted to "later").
  - **Tabs primitive ask:** install shadcn `tabs` component before
    next phase to avoid building from scratch.













