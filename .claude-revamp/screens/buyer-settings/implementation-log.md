# Buyer · Settings — Implementation Log

> **Batch:** 5
> **Date started:** 2026-05-03
> **Slug:** buyer-settings
> **Pencil source:** `R6YLrL` (desktop), `ZETLe` (mobile)

## Plan

### Files to create

- `packages/database/migrations/0012_buyer_settings.sql` — adds `addresses.postal_code text NULL`, `addresses.province text NULL`, `user.business_name text NULL` (additive, all nullable per gap-analysis Q13/Q14 STUBBED + scope-cut Buyer-business-name IN_SCOPE).
- `packages/database/migrations/meta/_journal.json` — append entry for 0012.
- `apps/web/src/app/(storefront)/profile/settings/layout.tsx` — Settings shell layout (desktop side-card-pair, mobile pass-through).
- `apps/web/src/app/(storefront)/profile/settings/page.tsx` — Mobile index list / desktop redirect to addresses.
- `apps/web/src/app/(storefront)/profile/settings/addresses/page.tsx` — Mounts the existing `UserAddresses` (retoken'd in this commit).
- `apps/web/src/modules/buyer-settings/components/settings-shell/index.tsx` — Desktop two-column shell (sidebar nav card + content).
- `apps/web/src/modules/buyer-settings/components/settings-sidebar-nav/index.tsx` — Desktop nav card (Profile/Orders/Saved addresses/Payment methods/Notifications/Preferences/Logout). Disabled rows for stubbed sub-pages.
- `apps/web/src/modules/buyer-settings/components/settings-app-bar/index.tsx` — Mobile app bar (chevron-back + title + LanguageToggle + avatar).
- `apps/web/src/modules/buyer-settings/components/settings-mobile-index/index.tsx` — Mobile 5-row nav card + logout + version footer.
- `apps/web/src/modules/buyer-settings/components/settings-breadcrumb/index.tsx` — Breadcrumb wrapper using `@repo/ui/components/breadcrumb`.
- `apps/web/src/modules/buyer-settings/nav/items.ts` — Nav row config (label, icon, href, enabled).
- `apps/web/src/app/api/user/addresses/[id]/route.ts` — `PATCH` (partial update) endpoint with same auth + cascade-unset rule as POST.
- `apps/web/src/modules/user-addresses/hooks/use-update-address-mutation/index.ts` — TanStack mutation that PATCHes and invalidates.

### Files to edit

- `packages/database/src/schema/addresses.ts` — add `postalCode` + `province` columns (nullable text).
- `packages/database/src/schema/auth.ts` — add `businessName` nullable text on `user`.
- `apps/web/src/modules/user-addresses/types.ts` — add `postalCode`, `province` (nullable).
- `apps/web/src/modules/user-addresses/schemas/index.ts` — extend `createAddressSchema` with optional `postalCode`, `province`; add `updateAddressSchema` (`createAddressSchema.partial()`).
- `apps/web/src/app/api/user/addresses/route.ts` — accept new optional fields on POST; persist them.
- `apps/web/src/modules/user-addresses/components/address-dialog/index.tsx` — accept optional `address?: Address`, switch between create/edit (PATCH) modes; surface postalCode + province inputs.
- `apps/web/src/modules/user-addresses/components/address-card/index.tsx` — paper-2/ink-1.5 default vs white/rule-1 non-default surface; new typography (sans 15/700 title, mono 12 phone), composed line `address, city postalCode, province` with display-only recipient-name removal; pencil-edit affordance via `onEdit` prop. Wraps with `Stamp variant="default-pill"` (extended).
- `apps/web/src/modules/user-addresses/components/addresses-list/index.tsx` — 3-up grid (1 / 2 / 3 columns at sm/md/lg); empty-state retoken; pass `onEdit` to each card.
- `apps/web/src/modules/user-addresses/components/addresses-page-header/index.tsx` — sentence-case `Saved addresses` (sans 22/700), outline ink button (h-9, sans 13/600).
- `apps/web/src/modules/user-addresses/index.tsx` — surface the section header + grid only (no page-level title or icon — that's the shell H1's job); add edit dialog state.
- `apps/web/src/modules/core/constants/absolute-routes/index.ts` — `PROFILE_ADDRESSES = '/profile/settings/addresses'` (redirect catches old path); add `PROFILE_SETTINGS = '/profile/settings'`.
- `apps/web/src/app/(storefront)/profile/addresses/page.tsx` — server-side redirect to `/profile/settings/addresses`.
- `packages/ui/src/components/stamp.tsx` — extend with `variant="default-pill"` (white-on-ink, no rotation, mono 9/700, padding `[2,6]`) for the DEFAULT badge per gap-analysis Q10.

### Schema changes (additive only)

Per gap-analysis answers Q13, Q14 (STUBBED IN_SCOPE — postal/province) and scope-cut "Buyer business name" (IN_SCOPE):

| Table | Column | Type | Default | Notes |
|---|---|---|---|---|
| `addresses` | `postal_code` | text | NULL | Optional; no regex. |
| `addresses` | `province` | text | NULL | Free-text; not enum. |
| `user` | `business_name` | text | NULL | Used by Batch 6 drawer identity card. |

### API / server-action changes

- `POST /api/user/addresses` — accept optional `postalCode`, `province` (mirrored Zod).
- `PATCH /api/user/addresses/[id]` (NEW) — same session+ownership guard as POST; accepts partial `createAddressSchema.partial()`; if `isDefault: true`, cascade-unsets siblings.

### New molecules introduced (screen-local only)

`modules/buyer-settings/`:

- `settings-shell` — desktop wrapper.
- `settings-sidebar-nav` — desktop sidebar card.
- `settings-app-bar` — mobile app bar.
- `settings-mobile-index` — mobile index list.
- `settings-breadcrumb` — wraps shadcn `Breadcrumb` already in `@repo/ui`.

No new shared `@repo/ui` components beyond extending `Stamp` with the `default-pill` variant.

## Completed

### Files changed

- `packages/database/src/schema/addresses.ts` — added `postalCode` + `province` (nullable text).
- `packages/database/src/schema/auth.ts` — added `businessName` (nullable text on `user`).
- `packages/database/migrations/0012_buyer_settings.sql` — additive ALTER TABLE for the three columns.
- `packages/database/migrations/meta/_journal.json` — appended entry idx 12.
- `apps/web/src/modules/user-addresses/types.ts` — `postalCode` / `province` on `Address`.
- `apps/web/src/modules/user-addresses/schemas/index.ts` — extended `createAddressSchema`; added `updateAddressSchema`.
- `apps/web/src/app/api/user/addresses/route.ts` — accept new optional fields on POST.
- `apps/web/src/app/api/user/addresses/[id]/route.ts` (NEW) — PATCH with cascade-unset.
- `apps/web/src/modules/user-addresses/hooks/use-update-address-mutation/index.ts` (NEW).
- `apps/web/src/modules/user-addresses/components/address-card/index.tsx` — new visuals + edit affordance + composed line + DEFAULT pill.
- `apps/web/src/modules/user-addresses/components/addresses-list/index.tsx` — 1/2/3-col grid; receives `onEditAddress`.
- `apps/web/src/modules/user-addresses/components/address-dialog/index.tsx` — accepts optional `address` for edit mode; postal/province inputs.
- `apps/web/src/modules/user-addresses/components/addresses-page-header/index.tsx` — sentence-case section header + outline ink button.
- `apps/web/src/modules/user-addresses/index.tsx` — manages create/edit dialog state.
- `apps/web/src/app/(storefront)/profile/addresses/page.tsx` — server-side redirect to `/profile/settings/addresses`.
- `apps/web/src/app/(storefront)/profile/settings/layout.tsx` (NEW) — paper bg wrapper.
- `apps/web/src/app/(storefront)/profile/settings/page.tsx` (NEW) — mobile index / desktop hint.
- `apps/web/src/app/(storefront)/profile/settings/addresses/page.tsx` (NEW) — mounts `UserAddresses` inside the shell.
- `apps/web/src/modules/buyer-settings/components/settings-shell/index.tsx` (NEW).
- `apps/web/src/modules/buyer-settings/components/settings-sidebar-nav/index.tsx` (NEW).
- `apps/web/src/modules/buyer-settings/components/settings-app-bar/index.tsx` (NEW).
- `apps/web/src/modules/buyer-settings/components/settings-mobile-index/index.tsx` (NEW).
- `apps/web/src/modules/buyer-settings/components/settings-breadcrumb/index.tsx` (NEW).
- `apps/web/src/modules/buyer-settings/nav/items.ts` (NEW).
- `apps/web/src/modules/core/constants/absolute-routes/index.ts` — `PROFILE_SETTINGS` + redirected `PROFILE_ADDRESSES`.
- `packages/ui/src/components/stamp.tsx` — added `inverse` variant + `rotated={false}` prop.

### Test updates

None — no Playwright e2e specs exercise this route today.

### Spec adherence

Each binding gap-analysis Answer (numbered Q1–Q33) is satisfied as follows:

- Q1 (settings shell + routing) — `apps/web/src/app/(storefront)/profile/settings/layout.tsx` + `settings/page.tsx` + `settings/addresses/page.tsx` + `modules/buyer-settings/components/settings-shell`.
- Q2 (breadcrumb) — `modules/buyer-settings/components/settings-breadcrumb` wraps the existing `@repo/ui/components/breadcrumb`.
- Q3 (right panel = Saved addresses only) — `settings/addresses/page.tsx` mounts only `UserAddresses` inside the shell.
- Q4 (H1 "Account & settings", H2 per sub-page) — `settings-shell.tsx` renders the H1; `addresses-page-header.tsx` renders the H2.
- Q5 (un-implemented rows disabled) — `nav/items.ts` `enabled: false` rows render greyed in `settings-sidebar-nav.tsx` + `settings-mobile-index.tsx`.
- Q6 (Orders nav row → existing /profile/orders) — `nav/items.ts` `id: 'orders'` `href: '/profile/orders'`.
- Q7 (sidebar logout coexists with header dropdown) — `settings-sidebar-nav.tsx` calls `signOut()`; storefront header dropdown unchanged.
- Q8 (page title verbatim, no MapPin) — `settings-shell.tsx` renders the literal title; no icon.
- Q9 (sentence case "Saved addresses") — `addresses-page-header.tsx`.
- Q10 (DEFAULT pill = Stamp inverse rotated=false) — `address-card.tsx` + `packages/ui/src/components/stamp.tsx`.
- Q11 (DEFAULT all-caps mono) — `address-card.tsx` "DEFAULT" literal in `Stamp variant="inverse"`.
- Q12 (composed address line) — `address-card.tsx` `composedAddress`.
- Q13 (postalCode optional text) — `addresses.ts` schema + `0012_buyer_settings.sql`.
- Q14 (province free-text optional) — same files.
- Q15 (recipient name display-only removal) — `address-card.tsx` no longer renders `recipientName`; field stays in `AddressDialog` form.
- Q16 (phone mono 12 ink-3) — `address-card.tsx` last `<p>`.
- Q17 (outline ink Add address button) — `addresses-page-header.tsx`.
- Q18 (re-use AddressDialog with title swap) — `address-dialog/index.tsx` switch on `address` prop.
- Q19 (PATCH endpoint, cascade-unset on isDefault) — `app/api/user/addresses/[id]/route.ts`.
- Q20 (set-default via edit dialog) — `address-dialog/index.tsx` checkbox carried into edit mode.
- Q21 (no delete) — no DELETE route added; no UI.
- Q22 (retain dialog visual) — `address-dialog/index.tsx`.
- Q23 (empty state retoken) — `addresses-list/index.tsx`.
- Q24 (centred Spinner loading) — `user-addresses/index.tsx`.
- Q25 (toast-only error) — existing `useAddressesQuery` + the new `useUpdateAddressMutation` use sonner toasts.
- Q26 (mobile sub-page = single-column variant) — `addresses-list/index.tsx` `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`.
- Q27 (mobile App bar replaces storefront header on settings) — `settings-app-bar/index.tsx`; shell renders it on `<lg`.
- Q28 (LanguageToggle inert) — `settings-app-bar/index.tsx` calls a no-op `onValueChange`.
- Q29 (`/profile/settings` mobile index, desktop hint) — `settings/page.tsx`.
- Q30 (version from `NEXT_PUBLIC_APP_VERSION`, mobile index only) — `settings-mobile-index/index.tsx`.
- Q31 (padding 18 — `p-[18px]`) — `address-card.tsx`.
- Q32 (title 15/700) — `address-card.tsx`.
- Q33 (1/2/3-col responsive grid) — `addresses-list/index.tsx`.

### Deviations from plan

- The Settings layout (`layout.tsx`) was kept as a thin paper-bg wrapper because the actual shell composition (sidebar + breadcrumb + H1) is parameterised per sub-page (each sub-page knows its own breadcrumb trail, mobile back href, app-bar title). The `SettingsShell` component is invoked from each sub-page and from the index page. This avoids a "shared" layout that has to know about every sub-page's metadata.
- `Stamp` was extended with `rotated={true|false}` instead of adding a separate "default-pill" primitive (gap-analysis Q10 hypothesis (b)).

### Quality gate state

| Check | Status |
|---|---|
| `pnpm --filter web check-types` | PASS (exit 0) |
| `pnpm --filter web lint` | PASS ("No ESLint warnings or errors") |
| `pnpm --filter web build` | PASS (40 routes generated, including `/profile/settings`, `/profile/settings/addresses`, redirect on `/profile/addresses`) |
| Playwright smoke (1440×900 + 420×900) | DEFERRED — same wrinkle as Batch 4: dev DB is missing migration 0012's `user.business_name` column. Middleware reads `auth.api.getSession()` which selects `business_name` per the new Drizzle schema, so every authed-route hit 500s until the operator applies `0012_buyer_settings.sql` to the dev DB. |

### What unblocks the smoke

Apply migration `0012_buyer_settings.sql` to the dev DB (matches the pattern documented in the Batch 1 retro and the Batch 3 STATUS.md). After apply, run:

- `/profile/settings` → mobile index card (mobile viewport) / desktop hint card (desktop viewport).
- `/profile/settings/addresses` → desktop sidebar + 3-up grid; mobile single column with paper-2/ink default + white/rule non-default cards.
- Edit pencil → AddressDialog opens in edit mode prefilled.
- `/profile/addresses` → 307 to `/profile/settings/addresses`.

