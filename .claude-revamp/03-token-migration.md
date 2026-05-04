# Phase 2 — Token Migration Plan

> **Phase:** Planning (read-only — no source files modified yet)
> **Date produced:** 2026-05-02
> **Inputs:** `01-codebase-map.md` (existing design system) · `02-design-inventory.md` (Pencil inventory) · `pencil:get_variables` from `Pencil-Design\Shalmi`
> **Source of truth:** Pencil tokens (per CLAUDE.md and user's answer to Q6 in 02-design-inventory)

This artifact is a planning document for Phase 3 (token implementation).
Per user directive (02 §7 Q6, Q4, Q5, Q7), **the Pencil design system is
authoritative** — the existing `globals.css` token model will be torn down
and rebuilt around the 27 Pencil variables, with the dark theme block
removed and component states re-derived from Pencil tokens.

All Pencil values below are exactly as `pencil:get_variables` returned.
No values are invented. Where a row says "n/a" it means the dimension is
genuinely undefined in Pencil and is flagged as an Open Question.

---

## 1. Token mapping table

### 1.1 Color — primitives

Pencil uses semantic-named tokens (`ink`, `paper`, `green-2`, `red`, …)
rather than a 10-step numeric scale. Existing primitives are 10-step
(`primary-10..100`, `neutral-white..black/10..110`, etc.). The table
below maps **every existing primitive** to its Pencil equivalent (or
"REMOVED" if there's no equivalent — see §3).

| existing_token_name | existing_value (RGB) | new_pencil_name | new_value | notes |
|---|---|---|---|---|
| `--primary-10`  | `236 253 245` (#ECFDF5) | `green-bg`   | `#F0FDF4` | Closest Pencil tint. Hex differs by 1 R/B unit; treat as "Green 50" surface. |
| `--primary-20`  | `209 250 229` (#D1FAE5) | `green-200`  | `#DCFCE7` | Closest Pencil tint. |
| `--primary-30`  | `167 243 208` (#A7F3D0) | **REMOVED**  | — | No Pencil equivalent. See §3. |
| `--primary-40`  | `110 231 183` (#6EE7B7) | **REMOVED**  | — | No Pencil equivalent. See §3. |
| `--primary-50`  | `52 211 153`  (#34D399) | `green-500`  | `#22C55E` | Closest by usage ("hover, badges"); hex differs significantly. |
| `--primary-60`  | `16 185 129`  (#10B981) | `green-2` / `green-600` | `#16A34A` | **Primary CTA**. Pencil declares both names with the same hex (Q1 below). |
| `--primary-70`  | `5 150 105`   (#059669) | `green-700` / `green` | `#15803D` | **Status: delivered/success**. Pencil declares both names with the same hex (Q1 below). |
| `--primary-80`  | `4 120 87`    (#047857) | **REMOVED**  | — | No Pencil equivalent. See §3. |
| `--primary-90`  | `6 95 70`     (#065F46) | `green-900`  | `#14532D` | "Footer, hero" surface. Hex differs slightly. |
| `--primary-100` | `6 78 59`     (#064E3B) | **REMOVED**  | — | No Pencil equivalent. See §3. |
| `--neutral-white` | `255 255 255` (#FFFFFF) | `white`    | `#FFFFFF` | Exact match. |
| `--neutral-10`  | `247 247 247` (#F7F7F7) | `paper`      | `#FBFAF5` | Pencil page bg is warm paper, not cool grey. Replaces "page background" semantic. |
| `--neutral-20`  | `237 237 237` (#EDEDED) | `paper-2`    | `#F5F2E8` | "Receipt cream" — used for receipts/summaries/cards. |
| `--neutral-30`  | `224 224 224` (#E0E0E0) | `paper-3`    | `#ECE7D6` | Used for chart bars / dashboard fills. |
| `--neutral-40`  | `209 209 209` (#D1D1D1) | `ink-4`      | `#A0A4A1` | Closest "soft icon / placeholder" tone; hex shifts cooler→warmer. |
| `--neutral-50`  | `189 189 189` (#BDBDBD) | `ink-4`      | `#A0A4A1` | **One→many collision** — see Q3. |
| `--neutral-60`  | `87 87 87`    (#575757) | `ink-3`      | `#6B716D` | Captions, meta. |
| `--neutral-70`  | `61 61 61`    (#3D3D3D) | `ink-2`      | `#2A2F2C` | Body, headings. |
| `--neutral-80`  | `46 46 46`    (#2E2E2E) | `ink-2`      | `#2A2F2C` | **One→many collision** — see Q3. |
| `--neutral-90`  | `33 33 33`    (#212121) | `ink-2`      | `#2A2F2C` | **One→many collision** — see Q3. |
| `--neutral-100` | `23 23 23`    (#171717) | `ink`        | `#0F1411` | Wordmark / chrome. |
| `--neutral-110` | `15 15 15`    (#0F0F0F) | `ink`        | `#0F1411` | **One→many collision** — see Q3. Currently the canonical "primary content" color. |
| `--neutral-black` | `0 0 0`     (#000000) | **REMOVED**  | — | No Pencil pure-black. Used only for `--bg-overlay`. See §3. |
| `--error-10`  | `255 241 241` (#FFF1F1) | `red-bg`     | `#FEF2F2` | Critical surface. |
| `--error-20`  | `255 215 217` (#FFD7D9) | **REMOVED**  | — | Not in Pencil. See §3. |
| `--error-30`  | `255 179 184` (#FFB3B8) | **REMOVED**  | — | Not in Pencil. |
| `--error-40`  | `255 131 137` (#FF8389) | **REMOVED**  | — | Not in Pencil. |
| `--error-50`  | `250 77 86`   (#FA4D56) | `red`        | `#B91C1C` | Pencil "Stamp red" — Cancel/error/discount. Hex differs significantly (deeper). |
| `--error-60`  | `218 30 40`   (#DA1E28) | `red`        | `#B91C1C` | Mapped to single Pencil red. |
| `--error-70`–`100` | (deeper reds) | **REMOVED** | — | Not in Pencil. |
| `--success-10` | `222 251 230` (#DEFBE6) | `green-bg`  | `#F0FDF4` | Success surface (reused). |
| `--success-50` | `36 161 72`   (#24A148) | `green-2`   | `#16A34A` | Mapped to primary green. |
| `--success-60`–`100` | (deeper greens) | **REMOVED** | — | Not in Pencil except `green-700`/`green-900`. |
| `--warning-10` | `252 244 214` (#FCF4D6) | `amber-bg`  | `#FEF7E0` | Warning/in-progress surface. |
| `--warning-50` | `178 134 0`   (#B28600) | `amber`     | `#A16207` | "In progress, low stock". |
| `--warning-60`–`100` | (deeper ambers) | **REMOVED** | — | Not in Pencil. |
| _(no existing equivalent)_ | — | `blue` | `#1E40AF` | **NEW** — "AT MNP HUB" stamp / info. See §2. |
| _(no existing equivalent)_ | — | `blue-bg` | `#EFF4FF` | **NEW** — info surface. See §2. |
| _(no existing equivalent)_ | — | `rule` | `#0F141119` (ink @ 10%) | **NEW** — default 1px hairline. See §2. |
| _(no existing equivalent)_ | — | `rule-2` | `#0F141133` (ink @ 20%) | **NEW** — heavier hairline (paper-2 cards/inputs). See §2. |
| `--shadow` | `176 175 175` (#B0AFAF) | **REMOVED** | — | Pencil uses one ad-hoc shadow color (`#0F141140`). See §1.5. |

### 1.2 Color — semantic (Pencil-aligned target)

Pencil does **not** declare semantic tokens (only primitives). The
existing `--bg-*`, `--content-*`, `--border-*` semantic layer needs to
be re-derived in terms of Pencil primitives. Proposed rebinding (Phase 3):

| existing_token_name | existing_value (resolves to) | new_pencil_name (binding) | notes |
|---|---|---|---|
| `--bg-primary` | `--neutral-white` | `paper` | Page background. Per design "Every screen renders against `paper` (#FBFAF5)". |
| `--bg-surface` | `--neutral-10` | `white` | Cards on paper bg. |
| `--bg-surface-variant` | `--neutral-white` | `white` | Same as surface. |
| `--bg-surface-secondary` | `--neutral-20` | `paper-2` | Receipt cream cards. |
| `--bg-surface-secondary-variant` | `--neutral-10` | `paper-2` | Collapsed. |
| `--bg-surface-tertiary` | `--neutral-30` | `paper-3` | Bars / chart fills. |
| `--bg-surface-inverse` | `--neutral-110` | `ink` | Topbar, footer. |
| `--bg-surface-elevated` | `--neutral-white` | `white` | Same as surface. |
| `--bg-surface-brand` | `--primary-10` | `green-bg` | Brand-tinted surface. |
| `--bg-surface-success` | `--success-10` | `green-bg` | Same as brand surface (Pencil reuses `green-bg`). |
| `--bg-surface-warning` | `--warning-10` | `amber-bg` | |
| `--bg-surface-critical` | `--error-10` | `red-bg` | |
| `--bg-fill-brand` | `--primary-60` | `green-2` (`green-600`) | Primary CTA fill. |
| `--bg-fill-brand-hover` | `--primary-70` | `green-700` (`green`) | Hover (re-derived per Q7 answer). |
| `--bg-fill-brand-active` | `--primary-80` | `green-900` | Pressed (closest Pencil; see Q4). |
| `--bg-fill-success` | `--success-50` | `green-2` | |
| `--bg-fill-warning` | `--warning-50` | `amber` | |
| `--bg-fill-critical` | `--error-50` | `red` | |
| `--bg-fill-inverse` | `--neutral-110` | `ink` | |
| `--bg-overlay` | `--neutral-black / 0.2` | _ad-hoc_ `#0F141180` (ink @ 50%) | Pencil drawer dim is "50%-opacity dim of underlying page" (02 §3.10). |
| `--content-primary` | `--neutral-110` | `ink` | Body content. **Note:** Pencil rule says body uses `ink-2` (#2A2F2C) not `ink` — see Q5. |
| `--content-secondary` | `--neutral-60` | `ink-3` | Captions, meta. |
| `--content-tertiary` | `--neutral-110 / 0.5` | `ink-4` | Placeholders, soft icons. |
| `--content-inverse` | `--neutral-white` | `white` | |
| `--content-brand` | `--primary-70` | `green-700` (`green`) | |
| `--content-success` | `--success-50` | `green-700` | Pencil success label color. |
| `--content-warning` | `--warning-50` | `amber` | |
| `--content-critical` | `--error-50` | `red` | |
| `--border-primary` | `--neutral-20` | `rule` | Default 1px hairline. |
| `--border-secondary` | `--neutral-30` | `rule-2` | Heavier hairline. |
| `--border-tertiary` | `--neutral-40` | `rule-2` | Collapsed. |
| `--border-inverse` | `--neutral-110` | `ink` | |
| `--border-brand` | `--primary-60` | `green-2` | |
| `--border-success` | `--success-50` | `green-700` | |
| `--border-warning` | `--warning-50` | `amber` | |
| `--border-critical` | `--error-50` | `red` | |
| `--border-elevated` | `--neutral-20` | `rule` | |

(Hover/active/disabled variants of every semantic above will be
re-derived per Q7 answer — proposal in §5.4.)

### 1.3 Color — shadcn aliases

These are not Pencil tokens; they're internal shims. Phase 3 rebind:

| existing alias | currently → | new binding | notes |
|---|---|---|---|
| `--background` | `bg-primary` | `paper` | Already covered above. |
| `--foreground` | `content-primary` | `ink` | (Or `ink-2` per Q5.) |
| `--card` | `bg-surface-elevated` | `white` | |
| `--card-foreground` | `content-primary` | `ink` | |
| `--popover` | `bg-surface-elevated` | `white` | |
| `--popover-foreground` | `content-primary` | `ink` | |
| `--primary` | `primary-60` | `green-2` | |
| `--primary-foreground` | `neutral-white` | `white` | |
| `--secondary` | `bg-fill-secondary` | `paper-2` | |
| `--secondary-foreground` | `content-primary` | `ink` | |
| `--muted` | `bg-fill` | `paper-2` | |
| `--muted-foreground` | `content-secondary` | `ink-3` | |
| `--accent` | `bg-fill-brand-secondary` | `green-bg` | |
| `--accent-foreground` | `content-brand` | `green-700` | |
| `--destructive` | `error-50` | `red` | |
| `--destructive-foreground` | `neutral-white` | `white` | |
| `--input` | `border-primary` | `rule-2` | Pencil inputs use 1.5px `rule-2`. |
| `--ring` | `primary-60` | `green-2` | Focus ring (per Q7 — see §5.4). |
| `--border` | `border-primary` | `rule` | |
| `--sidebar` | `bg-surface-brand` | `white` | Pencil sidebars are white, not green-tinted. |
| `--sidebar-foreground` | `content-primary` | `ink` | |
| `--sidebar-primary` | `primary-70` | `green-700` | |
| `--sidebar-primary-foreground` | `neutral-white` | `white` | |
| `--sidebar-accent` | `primary-20` | `paper-2` | Active nav row uses paper-2 fill. |
| `--sidebar-accent-foreground` | `content-brand` | `ink` | |
| `--sidebar-border` | `border-primary` | `rule` | |
| `--sidebar-ring` | `primary-60` | `green-2` | |

### 1.4 Typography

Existing scale (`text-display-*`, `text-heading-*`, `text-body-*`,
`text-label-*`) is fine-grained (4 families × 5–6 steps = ~25 sizes
with paired line-heights). Pencil declares **only 3 font-family
variables** (`font-sans`, `font-mono`, `font-ar`); the size scale is
shown as **named specimens** in the design system showcase but not as
declared variables (02 §1.3).

| existing_token_name | existing_value | new_pencil_name | new_value | notes |
|---|---|---|---|---|
| _(none — no font-family token)_ | — | `--font-sans` | `"Plus Jakarta Sans"` | **NEW**. Wire via `next/font/google` (see §5). |
| _(none)_ | — | `--font-mono` | `"JetBrains Mono"` | **NEW**. Numerics, prices, eyebrows, stamps. |
| _(none)_ | — | `--font-ar` | `"Noto Nastaliq Urdu"` | **NEW** — load lazily; per Q16 EN-only ships first but the variable must exist for the future toggle. |
| `--text-display-md` | 72/84 | _(no Pencil row)_ | — | See Q6. |
| `--text-display-sm` | 60/72 | _(closest)_ Pencil "Hero" 56/800 | 56px | Pencil's largest specimen is 56px. |
| `--text-display-xs` | 48/56 | — | — | No Pencil row. |
| `--text-heading-2xl` | 40/48 | — | — | No direct Pencil row (between H1=36 and Hero=56). |
| `--text-heading-xl` | 36/44 | Pencil **H1** 36/800 | 36 / 800 / -0.02 ls | |
| `--text-heading-lg` | 32/40 | — | — | No Pencil row. |
| `--text-heading-md` | 28/36 | Pencil **H2** 26/700 | 26 / 700 | Hex match-by-purpose (largest section title). |
| `--text-heading-sm` | 24/32 | _(closest)_ Pencil **H3** 20/700 | 20 / 700 | |
| `--text-heading-xs` | 20/24 | Pencil **H3** 20/700 | 20 / 700 | |
| `--text-body-xl` | 20/28 | — | — | No Pencil row. |
| `--text-body-lg` | 18/28 | _(no Pencil row)_ | 18 | Pencil uses 18 only for `font-ar` rows. |
| `--text-body-md` | 16/24 | Pencil **BODY** 16/400 | 16 / 400 | |
| `--text-body-sm` | 14/20 | Pencil **SMALL** 14/400 | 14 / 400 | |
| `--text-body-xs` | 12/16 | Pencil **CAPTION** 12/400 | 12 / 400 | |
| `--text-label-2xl` | 20/24 | Pencil H3 size | 20 / 700 | |
| `--text-label-xl` | 18/24 | — | — | No Pencil row. |
| `--text-label-lg` | 16/20 | Pencil BODY size, weight 600 | 16 / 600 | Buttons. |
| `--text-label-md` | 14/20 | Pencil SMALL size, weight 600 | 14 / 600 | Default button label. |
| `--text-label-sm` | 12/16 | Pencil CAPTION size, weight 600 | 12 / 600 | |
| `--text-label-xs` | 11/16 | Pencil **MONO LABEL** 11/600 | 11 / 600 / 0.08 ls | Eyebrows — should be `font-mono`. |
| _(none)_ | — | Pencil **MONO NUMERIC** 17/700 | 17 / 700 (mono) | **NEW** — used for prices/totals. Propose `--text-numeric-md`. |

See Q7 for whether to compress the existing scale or keep extra steps.

### 1.5 Spacing

Pencil declares **no spacing variables** — only a "4 pt grid" eyebrow
and a `SpacingBars` row showing values 4, 8, 12, 16, 24, 32, 48, 64, 96
(02 §1.4). Existing codebase has **no spacing tokens** either; it uses
Tailwind's default spacing scale. The Pencil 4-pt grid aligns exactly
with Tailwind's default `4 8 12 16 24 32 48 64 96` (= `p-1 p-2 p-3 p-4
p-6 p-8 p-12 p-16 p-24`).

| existing_token_name | existing_value | new_pencil_name | new_value | notes |
|---|---|---|---|---|
| _(none — Tailwind default)_ | `0.25rem` step | _(none — Tailwind default)_ | 4-pt grid | **No change.** Tailwind's default scale already matches Pencil's `s-1..s-9`. |

### 1.6 Radius

Existing: `--radius: 0.625rem` (10px); `--radius-sm/md/lg/xl` =
`calc(var(--radius) - 4px / -2px / +0 / +4px)` = 6 / 8 / 10 / 14.
Pencil: 0, 4, 6, 8, 12, 999 (02 §1.5). **Tokens not declared as
variables in Pencil — captured from showcase row.**

| existing_token_name | existing_value | new_pencil_name | new_value | notes |
|---|---|---|---|---|
| `--radius` (root)  | `0.625rem` (10px) | `--radius-md` | `8px` (Pencil r4) | Cards, surfaces. |
| `--radius-sm`      | `calc(var(--radius) - 4px)` = 6px | `--radius-sm` | `6px` (Pencil r3) | Buttons, inputs, sidebar nav rows. **Value unchanged.** |
| `--radius-md`      | `calc(var(--radius) - 2px)` = 8px | `--radius-md` | `8px` (Pencil r4) | **Value unchanged** at 8px. |
| `--radius-lg`      | `var(--radius)` = 10px | `--radius-lg` | `12px` (Pencil r5) | KPI cards, dashboard widgets. **Value changes 10 → 12.** |
| `--radius-xl`      | `calc(var(--radius) + 4px)` = 14px | `--radius-xl` | `16px` (Pencil largest non-pill) | Hero/banner blocks, payout callout. **Value changes 14 → 16.** |
| _(none)_ | — | `--radius-none` | `0` (Pencil r1) | **NEW** — sharp corners. |
| _(none)_ | — | `--radius-xs` | `4px` (Pencil r2) | **NEW** — icon swatches, language-toggle interior. |
| _(none — Tailwind `rounded-full`)_ | `9999px` | `--radius-full` | `9999px` (Pencil r6) | **No change.** |
| _(none)_ | — | `--radius-stamp` | `3px` | **NEW** — observed in §3.3 of design inventory; falls between Pencil r1 and r2. Used only for status stamps. May fold into `--radius-xs` with documented exception. See Q8. |

### 1.7 Shadow / elevation

Existing: 4-step shadow scale (`xs/sm/md/lg`) + 4-step drop-shadow,
both keyed off `--shadow: 176 175 175`. Used in 22 places across 16
files.

Pencil: **only one shadow drawn** — desktop Account drawer:
`outer, color #0F141140 (ink @ 25%), offset (-12, 0), blur 48`
(02 §1.6). The system explicitly favors hairline strokes over
elevation.

| existing_token_name | existing_value | new_pencil_name | new_value | notes |
|---|---|---|---|---|
| `--shadow-xs` | `0 2 4 0 / shadow 16%` | **REMOVED** | — | Not in Pencil. See §3 + Q9. |
| `--shadow-sm` | `0 4 8 0 / shadow 20%` | **REMOVED** | — | Not in Pencil. |
| `--shadow-md` | `0 8 16 0 / shadow 22%` | **REMOVED** | — | Not in Pencil. |
| `--shadow-lg` | `0 12 24 0 / shadow 25%` | **REMOVED** | — | Not in Pencil. |
| `--drop-shadow-xs..lg` | (mirror of above) | **REMOVED** | — | Same. |
| _(none)_ | — | `--shadow-drawer` | `-12px 0 48px 0 #0F141140` | **NEW** — desktop right-side overlay drawer. The only shadow declared by Pencil. |

### 1.8 Motion

Pencil declares **no motion tokens** (02 §1.9). The codebase has none
either (relies on `tw-animate-css` defaults and Framer Motion ad-hoc).

| existing_token_name | existing_value | new_pencil_name | new_value | notes |
|---|---|---|---|---|
| _(none)_ | — | _(none)_ | — | **No motion tokens.** Re-derive component motion from Pencil only when explicit guidance is added (see Q11). |

---

## 2. New tokens (Pencil tokens with no existing equivalent)

These need to be **added** in Phase 3.

| New token | Value | Where it's used in Pencil |
|---|---|---|
| `blue` | `#1E40AF` | Stamp "AT MNP HUB", info color. |
| `blue-bg` | `#EFF4FF` | Info surface (paired with `blue`). |
| `green-200` | `#DCFCE7` | Banner eyebrow surface. |
| `green-500` | `#22C55E` | Hover, badges. |
| `green-700` | `#15803D` | Delivered/success label. (Aliased to `green` in Pencil — see Q1.) |
| `green-900` | `#14532D` | Footer / hero / KPI accents. |
| `green-bg` | `#F0FDF4` | "Green 50" surface (also reused as success surface). |
| `paper` | `#FBFAF5` | Page background — primary surface. |
| `paper-2` | `#F5F2E8` | Receipt cream cards, summaries, sidebar active. |
| `paper-3` | `#ECE7D6` | Chart bars, dashboard placeholder fills. |
| `ink-3` | `#6B716D` | Captions, meta. |
| `ink-4` | `#A0A4A1` | Placeholder text, soft icons. |
| `amber` | `#A16207` | "In progress, low stock". |
| `amber-bg` | `#FEF7E0` | Amber surface. |
| `red-bg` | `#FEF2F2` | Red surface. |
| `rule` | `#0F141119` (ink @ 10%) | Default 1px hairline. |
| `rule-2` | `#0F141133` (ink @ 20%) | 1.5px hairline on paper-2 cards / inputs. |
| `--font-sans`  | `"Plus Jakarta Sans"` | All UI/headings/body. |
| `--font-mono`  | `"JetBrains Mono"` | Prices, totals, eyebrows, stamps. |
| `--font-ar`    | `"Noto Nastaliq Urdu"` | Urdu strings (declared now per Q16, used after EN-first rollout). |
| `--shadow-drawer` | `-12 0 48 0 #0F141140` | Desktop account drawer overlay. |
| `--radius-none` | `0` | Sharp corners. |
| `--radius-xs` | `4px` | Pencil r2 — icon swatches, language-toggle interior. |
| `--radius-stamp` | `3px` | Status pills only — see Q8. |
| `--text-numeric-md` | `17 / 700` (`font-mono`) | Pencil MONO NUMERIC for prices/totals — **NEW** typography token. |
| `--letter-spacing-mono-label` | `0.08em` | Mono labels / eyebrows / stamps. |

---

## 3. Removed tokens (existing tokens with no Pencil equivalent)

Per CLAUDE.md hard rule 3: **do not delete without confirming nothing
in the codebase depends on them.** Each row below shows grep results.
**Nothing is proposed for outright deletion** — the dependent-call-site
list is provided so you can decide per-token. All "in use" cases are
escalated to §7.

### 3.1 Primitive scales — green steps not in Pencil

| Existing token | Used in code? (Tailwind class form) | Call sites |
|---|---|---|
| `--primary-30` (`text-primary-30`/`bg-primary-30`/...) | **No usages found** in `apps/` or `packages/` (.ts/.tsx) | Safe to remove from primitives. |
| `--primary-40` | **No usages found** | Safe. |
| `--primary-80` | **No usages found** | Safe. |
| `--primary-100` | **No usages found** | Safe. |

> Note: many semantic tokens *internally* reference `--primary-30/40/80/100`
> (e.g. `--bg-fill-brand-secondary-disabled: var(--primary-30) / 0.15`).
> Removing the primitives requires rebinding those semantic tokens too — see §1.2.

### 3.2 Primitive scales — neutral steps not in Pencil

| Existing token | Used as Tailwind utility? | Call sites |
|---|---|---|
| `--neutral-30` | `bg-neutral-30` etc. | None in app/package code (verified via grep). |
| `--neutral-40` | — | None. |
| `--neutral-50` | — | None. |
| `--neutral-80` | — | None. |
| `--neutral-90` | — | None. |
| `--neutral-100` | — | None. |
| `--neutral-110` | `text-neutral-110`, `bg-neutral-110`, `border-neutral-110` | **9 files** (storefront/footer, retailer order surfaces, vendor order card). All map to `ink`. Safe to migrate via class rename. |
| `--neutral-black` | `bg-neutral-black` | None directly; only in `--bg-overlay`. Safe to drop primitive once overlay rebinds to `#0F141180`. |

### 3.3 Status scales — error/success/warning steps not in Pencil

| Existing token | Used in code? | Call sites |
|---|---|---|
| `--error-20`/`--error-30`/`--error-40` | None found. | Safe. |
| `--error-70`/`--error-80`/`--error-90`/`--error-100` | None found. | Safe. |
| `--success-20`–`--success-100` | None found as utilities. | Safe. (Internal refs in semantic layer get rebound.) |
| `--warning-20`–`--warning-100` | None found as utilities. | Safe. |

### 3.4 Shadow scale

| Existing token | Used in code? | Call sites |
|---|---|---|
| `shadow-xs` / `shadow-sm` / `shadow-md` / `shadow-lg` / `drop-shadow-*` | **22 occurrences in 16 files** | **DO NOT DELETE — IN USE.** Files include `packages/ui/src/components/{button, card, dialog, sheet, dropdown-menu, hover-card, select, checkbox, input}.tsx`, plus retailer/vendor order card components, storefront product/category sections. **See Q9 for the open question.** |

### 3.5 Dark theme (entire `.dark` block)

Per user answer to 02 §7 Q5 ("yes, delete the dark token block").

| Existing | Status | Call sites |
|---|---|---|
| `.dark { ... }` block (full token override + shadcn override) | **DELETE** in Phase 3 | No `<ThemeProvider>` is mounted today (01 §7 Q12) and there is no `dark:` class usage in `apps/web` / `packages/ui` that I could find via grep. **Action item:** before Phase 3 deletion, run `rg "\bdark:" apps packages` to confirm no `dark:` Tailwind variants exist. |
| `next-themes` dependency | Keep installed but unused | Will be re-wired when dark theme is added later (per Q5 answer). |

### 3.6 Tokens that survive but get rebound

The full `--bg-*`, `--content-*`, `--border-*` semantic layer survives
(it's heavily used in shadcn primitives and app components — see §1.3).
Their internal references get rebound per §1.2 / §1.3, but the **token
names themselves stay**, so component class strings (`bg-bg-surface`,
`text-content-primary`, etc.) keep working.

---

## 4. Naming convention reconciliation

**Existing convention:** kebab-case, numeric scale (`primary-60`,
`neutral-110`, `error-50`, `bg-fill-brand-hover`).

**Pencil convention:** kebab-case, semantic + Tailwind-numeric mix
(`ink`, `ink-2`, `green-2`, `green-600`, `green-700`, `green-bg`,
`paper`, `paper-2`, `rule`, `rule-2`).

Both use kebab-case → no syntactic conflict. The semantic difference is:

- Existing names are **role-based** (`primary`, `neutral`, `error`).
- Pencil names are **identity-based** (`ink`, `paper`, `green`) plus
  Tailwind-style numeric steps where they exist.

**Decision: adopt Pencil names verbatim for primitives.**
Per user direction in 02 §7 Q6 ("go according to the Pencil design
system, ignore the current implementation"), and because the new
primitives (`ink`, `paper`, `rule`) carry semantic intent the existing
scale lacks (paper is warm, ink is bluish-black, rule is alpha-encoded
ink) — renaming would lose information.

**Keep existing semantic-token namespace** (`--bg-*`, `--content-*`,
`--border-*`) so consumers in shadcn and app components don't need
mass renames. Their internal *bindings* change (to Pencil primitives),
but the *names* stay. This minimizes Phase 3 component churn.

**Keep existing typography namespace** (`--text-display-*`,
`--text-heading-*`, `--text-body-*`, `--text-label-*`) for the same
reason. Add `--text-numeric-*` as a new family for mono prices.

**Special-case duplicates per Q1 of this doc / Q4 of 02:** Pencil
declares both `green-2` and `green-600` with the same hex; both `green`
and `green-700` with the same hex. Per user answer ("do it according to
the Pencil design system"), **preserve both names as aliases** in CSS.
Codebase consumers should pick the name that matches the *role*
(`green-2` for "Primary CTA, Add"; `green-600` for "Banner highlights";
`green-700` for "Delivered/success"; `green` for the unscored brand
green). The name itself, not the hex, encodes intent.

---

## 5. Implementation strategy

Phase 3 changes will be concentrated in a small number of files. No
component code is rewritten in Phase 3 — only token bindings and font
wiring.

### 5.1 Files that will change in Phase 3

| File | Change |
|---|---|
| `packages/ui/src/styles/globals.css` | **Major rewrite.** Replace primitives block with the 27 Pencil variables (hex literals, not RGB-channel split). Rebind semantic tokens (`--bg-*` / `--content-*` / `--border-*`) per §1.2. Rebind shadcn aliases per §1.3. Replace radius values per §1.6. Replace shadow scale per §1.7. Replace typography size scale per §1.4. **Delete the entire `.dark` block.** |
| `apps/web/src/app/layout.tsx` | Wire fonts via `next/font/google`: `Plus_Jakarta_Sans`, `JetBrains_Mono`, `Noto_Nastaliq_Urdu` (subset/preload `nastaliq` set to `false` per Q12). Apply `--font-sans` / `--font-mono` / `--font-ar` to `<body>`. |
| `packages/ui/components.json` | Update `baseColor` from `neutral` to a Pencil-aligned value or leave (shadcn re-init not needed; cosmetic). May not need change in Phase 3 — verify. |
| `packages/ui/postcss.config.mjs` / `apps/web/postcss.config.mjs` | **No change** — they only load `@tailwindcss/postcss`. |
| `apps/web/next.config.ts` | **No change** — `transpilePackages` already covers `@repo/ui`. |
| `package.json` (root or `apps/web`) | **Possibly add** `@next/font` is built-in; no install needed. **Remove** `next-themes` if you want to truly excise dark, OR leave installed for the future (Q5 answer = "we will add dark theme later", so leave installed). |

**Component files are NOT touched in Phase 3.** Per CLAUDE.md hard rule
2 (no silent behavior changes) and the phased plan, components migrate
in Phase 4. The 9 files using `text-neutral-110` etc. as Tailwind
utilities will visually change at Phase 3 (because the underlying
primitive is removed) — see Risk R3 in §6.

### 5.2 Token-definition mechanism (which strategy)

**Match existing approach: CSS custom properties exposed via Tailwind
v4 `@theme inline`.** No deviation from current pattern. Specifically:

- Continue using `:root, .light` for default values. (`.light` is
  currently the "active" theme — leave it as the only theme.)
- **Switch from RGB-channel split (`16 185 129`) to hex literals
  (`#16A34A`).** Rationale: Pencil already encodes alpha into `rule`
  (`#0F141119`) and `rule-2` (`#0F141133`) as 8-digit hex; mixing
  RGB-channel and hex is messy. The codebase only used the channel
  split to enable `rgb(var(--x) / 0.5)` mid-stream alpha — Pencil's
  design uses hairlines, not on-the-fly alpha blends, so this
  flexibility is no longer required. (Caveat: Tailwind v4 utilities
  like `bg-foo/50` will not work on hex CSS-vars; if any component
  relies on this pattern, we must keep RGB-channel for that one
  primitive — see Q10.)
- Keep the `@theme inline` block as the single Tailwind-utility
  surface. Add new utilities (`text-numeric-md`, `radius-xs`,
  `shadow-drawer`).

**No `tailwind.config.ts`** — would conflict with Tailwind v4 + `@theme`
flow. **No TS object** — would duplicate the source of truth.

### 5.3 Order of operations (Phase 3 sequence)

1. Add the 27 Pencil primitives to `globals.css` (additively, alongside
   existing primitives). Verify build.
2. Add font wiring in `layout.tsx`. Verify font loads in browser.
3. Rebind semantic tokens (`--bg-*` etc.) to Pencil primitives. This is
   the visual breakage moment for unrevamped screens — see §6.
4. Rebind shadcn aliases.
5. Update radius scale, replace shadow scale.
6. Delete `.dark` block.
7. Delete unused legacy primitives (after grep-confirming each one).
8. Phase-3-end visual smoke test of every existing screen — log
   regressions in Phase 3 artifact for Phase 4 to fix.

### 5.4 Re-derived component states (per Q7 answer)

Pencil shows only default states for buttons/inputs/stamps/tabs.
Per user direction, derive from tokens:

| State | Background | Border | Content |
|---|---|---|---|
| **Button — primary green / default** | `green-2` | — | `white` |
| **Button — primary green / hover** | `green-700` | — | `white` |
| **Button — primary green / pressed** | `green-900` | — | `white` |
| **Button — primary green / disabled** | `green-2 @ 40%` | — | `white @ 70%` |
| **Button — primary green / focus ring** | `green-2` outer ring (2px, offset 2px) | — | — |
| **Button — outline ink / default** | `white` | `ink` 1px | `ink` |
| **Button — outline ink / hover** | `paper-2` | `ink` 1px | `ink` |
| **Button — destructive outline / default** | `white` | `red` 1px | `red` |
| **Button — destructive outline / hover** | `red-bg` | `red` 1px | `red` |
| **Input / default** | `white` | `rule-2` 1.5px | `ink` (text), `ink-4` (placeholder) |
| **Input / hover** | `white` | `ink` 1.5px | — |
| **Input / focus** | `white` | `ink` 1.5px + `ink @ 25%` ring 3px | — |
| **Input / error** | `white` | `red` 1.5px | `ink`; helper text `red` |
| **Input / disabled** | `paper-2` | `rule` 1px | `ink-4` |
| **Tab / inactive** | — | — | `ink-3` 14/500 |
| **Tab / active** | — | bottom 2px `ink` | `ink` 14/600 |
| **Tab / hover (inactive)** | — | — | `ink-2` 14/500 |
| **Stamp** | (per stamp variant) | (per stamp variant) | (per stamp variant) — no states; stamps are static labels. |

These are **proposals for Phase 3 review**, not committed values.
See Q7 for confirmation request.

---

## 6. Risk register

| ID | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| **R1** | Removing `--shadow-*` scale before screen revamp lands will visually flatten all current cards/dialogs/dropdowns (16 files use `shadow-*` utilities). | High | Medium (cosmetic regression on every page) | **Keep `shadow-xs/sm/md/lg` aliases pointing at the new `--shadow-drawer` value (or at `none`) until each consuming component is revamped.** Decide per Q9. |
| **R2** | Radius changes (`--radius-lg` 10→12, `--radius-xl` 14→16) silently grow rounded corners on every card/dialog/popover that uses `rounded-lg`/`rounded-xl`. | Medium | Low (visual) | Acceptable drift — Pencil is stricter (12 / 16). If tighter control needed, gate by component migration. |
| **R3** | Removing legacy primitives (`--neutral-110`, etc.) breaks the 9 files that still reference `text-neutral-110` etc. | Certain (build-time error if class doesn't resolve, OR silent visual fallback) | High (build break) | **Don't delete until Phase 4 component migration replaces classes.** Keep the primitive name but rebind its hex to the new Pencil equivalent (`#0F1411`). |
| **R4** | Page background changes from `#FFFFFF` (cool) to `#FBFAF5` (warm paper) globally. Every page that assumed white background may show subtle color shift on white-on-page elements (e.g., images, screenshots, white cards on white bg become hairline-bordered cards on paper bg). | High | Medium | Expected per design intent. Document in Phase 3 changelog; accept breakage during revamp. |
| **R5** | Font swap to Plus Jakarta Sans changes line-height/letter-width on every text node, breaking layouts measured for the previous default font. | High | Medium | Test each screen post-font-swap. Most layouts use Tailwind utilities; impact is per-component cosmetic, not catastrophic. |
| **R6** | Shadcn primitives (`Button`, `Input`, etc.) currently style states (hover/focus/disabled) using `--primary-60`, `--neutral-20`, `--ring`. After rebinding, hover/focus colors shift to Pencil greens — for some primitives this may *look* better; for others (`destructive` button) the new red is much darker (`#B91C1C` vs `#FA4D56`). | Certain | Low–Medium | Acceptable per Q7 answer (re-derive states from Pencil tokens). |
| **R7** | `.dark` removal + `next-themes` left installed creates a dependency that does nothing. A future contributor might re-mount the provider and find tokens missing. | Low | Low | Add a comment in `globals.css` and/or `package.json` noting "dark intentionally deferred (see 03-token-migration.md §3.5)". |
| **R8** | `--bg-fill-brand-secondary` and similar "tinted brand" semantic tokens currently use `var(--primary-50) / 0.15` (alpha mix). Switching primitives to plain hex breaks this pattern. | Medium | Low (specific brand-tinted UI affected) | Either keep RGB-channel for the handful of primitives that need alpha (`green-2`, `ink`), or rebind these semantics to Pencil's `green-bg` / `green-200` (which already encode the tint). |
| **R9** | Single `--shadow-drawer` cannot cover the 4-tier visual elevation that the existing UI assumes. Dialogs/popovers/dropdowns currently use `shadow-md`/`shadow-lg`. | Certain | Medium | Decide per Q9 — either accept "Pencil has no elevation" verbatim (replace all with hairline-only style at component-migration time), or define a small derived scale (e.g. `shadow-popover`, `shadow-overlay`) using the Pencil drawer formula scaled down. |
| **R10** | Buyer-Home page background today renders against `--bg-primary` = white. Pencil's "every screen renders against `paper`" rule applies the warm paper everywhere, including admin/vendor surfaces — but those are visually `ink`-topbar + white-sidebar, not paper. | Medium | Low | Confirm: should admin/vendor main content area be `paper` or `white`? Phase 3 default is `paper`; Phase 4 can override per layout. |

---

## 7. Open questions

Numbered for reference.

1. **Two `green-2`/`green-600` and two `green`/`green-700` aliases.**
   Pencil declares both names, both with identical hex
   (`green-2 = green-600 = #16A34A`; `green = green-700 = #15803D`).
   Plan: preserve all four names as separate CSS custom properties.
   Confirm? (User's answer in 02 Q4 said "do it according to the Pencil
   design system" — interpreting as **keep both names as aliases**.)

   Answer: Yes, keep both names as aliases.

2. **No spacing/radius/shadow Pencil variables.** The plan reads the
   raw values from the design-system showcase rectangles (4-pt grid;
   r-scale 0/4/6/8/12/999; one shadow). Confirm I should not ask Pencil
   to declare these as variables before Phase 3.

   Answer: Yes, confirm you should not ask Pencil to declare these as variables before Phase 3.

3. **One→many mapping in neutrals.** Existing `--neutral-50`,
   `--neutral-40` both map to Pencil `ink-4`. `--neutral-70`,
   `--neutral-80`, `--neutral-90` all collapse to `ink-2`.
   `--neutral-100`, `--neutral-110` both collapse to `ink`.
   Per CLAUDE.md hard rule, I should not collapse silently. Today no
   component uses the inner steps as Tailwind utilities (only `-110`
   is used directly), so the collapse is safe in practice — but
   confirm Phase 3 may collapse, or instruct me to keep the existing
   numeric steps as aliases pointing at the Pencil token.

   Answer: Yes, confirm Phase 3 may collapse.

4. **`--bg-fill-brand-active` / pressed.** Pencil draws no pressed
   state. I propose `green-900` (the only deeper green Pencil declares
   beyond `green-700`). Acceptable, or want me to derive a darker tone?

   Answer: Yes, acceptable.

5. **`--content-primary` = `ink` vs `ink-2`.** Pencil's "Ink-2 — Body,
   headings" usage label suggests **body text uses `ink-2` (#2A2F2C)**,
   not the deeper `ink` (#0F1411) which is reserved for the wordmark
   and chrome (topbars, footers). The codebase currently uses
   `--neutral-110` (deepest) for `--content-primary`. Should
   `--content-primary` map to `ink-2` (per Pencil's usage label) or
   `ink` (matching current behavior)?

   Answer: Yes, map to ink-2.

6. **Typography sizes that have no Pencil row** (`display-md` 72,
   `display-xs` 48, `heading-2xl` 40, `heading-lg` 32, `body-xl` 20,
   `body-lg` 18, `label-xl` 18). Three options: (a) drop them from the
   scale; (b) keep them with current values; (c) interpolate from
   adjacent Pencil sizes. Recommend (a) — Pencil's scale is
   intentionally tight. Confirm?

   answer: drop them from the scale. 

7. **Component-state derivation table (§5.4).** Are the proposed
   hover/focus/pressed/disabled bindings acceptable, or would you
   like to review and adjust before they ship in Phase 3?

   answer: lets proceed with the proposed bindings.

8. **`--radius-stamp` = 3px.** Pencil's stamp pills use radius 3,
   which is between the declared scale steps r1 (0) and r2 (4). Two
   options: declare a one-off `--radius-stamp: 3px`, or fold stamps
   into `--radius-xs` (4px) at a 1px visual delta. Which?

   answer: go wtih 4px radius 

9. **Shadow scale fate (R1 + R9).** Two options:
   - **Aggressive:** delete `shadow-xs/sm/md/lg` immediately; let cards
     go flat until Phase 4 adds hairline borders per Pencil. Visual
     regression is wide but intentional.
   - **Bridge:** keep `shadow-xs/sm/md/lg` as deprecated aliases
     pointing at one downscaled drawer-style shadow until Phase 4.
     Less visual breakage, more legacy code.
   Which?

   answer: go with bridge approach

10. **Alpha utilities.** Tailwind's `/N` opacity utilities
    (`bg-foo/50`) require RGB-channel CSS variables. If any code (or
    we, in Phase 4 component states) needs `bg-green-2/40` for a
    "disabled" button look, the Pencil hex literal will not work as-is.
    Either (a) keep RGB-channel for select primitives (`ink`, `green-2`,
    `red`) and hex for others; or (b) ban `/N` opacity utilities and
    use the explicit Pencil tokens for tints (`green-bg`, `green-200`).
    Preference?

    answer: Keep RGB-channel for select primitives (`ink`, `green-2`,
    `red`) and hex for others.

11. **Motion tokens.** Pencil declares none. Phase 3 plan: do not add
    motion tokens. Phase 4 components keep current ad-hoc Framer Motion
    timings. Confirm — or do you want me to propose a small motion
    scale (e.g., `--motion-fast: 150ms`, `--motion-base: 250ms`) now?

    answer: let's proceed with the proposed motion scale.

12. **`Noto Nastaliq Urdu` font load strategy.** Per Q16 in 02, EN
    ships first but the variable must exist. Option (a): declare the
    `--font-ar` CSS variable but **don't** load the font yet (zero
    runtime cost). Option (b): load it lazily on a `lang="ur"`
    selector. Recommend (a) for Phase 3. Confirm?

    answer: declare the `--font-ar` CSS variable but **don't** load
    the font yet (zero runtime cost).

13. **`--bg-overlay` value.** I propose `#0F141180` (ink @ 50%)
    matching the 02 §3.10 "50%-opacity dim" copy. Existing value is
    `neutral-black @ 20%`. Pencil shows the dim as ink, not pure black.
    Confirm 50% (per spec text) vs 40% (per `#0F141140` shadow-color
    of the drawer itself) — these are two different opacity figures
    referenced in the design.

    answer: lets go with what you proposed.
    

---

**Plan file written to:** `D:\Moeed 8th Sem\Fyp\Code\shalmi-web\.claude-revamp\03-token-migration.md`

(End of Phase 2 token migration plan. Stopping here per instructions —
not starting Phase 3.)
