# Buyer · Signup (Shopkeeper, EN) — Implementation Log

> **Phase:** Per-screen implementation (Batch 7, screen 4 of 5).
> **Date:** 2026-05-04.
> **Spec source:** `.claude-revamp/screens/buyer-signup-shopkeeper/gap-analysis.md` Q1–Q13.
> **Scope:** EN only — Urdu/RTL frames `w2jcu`/`izPvi` deferred per OQ-I.

## Step A — Plan

### Files to create
- `packages/database/migrations/0014_user_shop_columns.sql` — `ALTER TABLE "user" ADD COLUMN "shop_name" text` + `shop_address text`.
- `apps/web/src/modules/auth/components/signup/shopkeeper-form.tsx` — 4-field shopkeeper variant (Shopkeeper name + Shop name + Shop address textarea + Phone).
- `apps/web/src/modules/auth/components/signup/mart-shelf-strip.tsx` — mobile-only 4×2 ink-bg strip with 8 generic lucide silhouettes (per OQ-A + Q9(a) + Q10(a)).

### Files to edit
- `packages/database/migrations/meta/_journal.json` — append idx 14.
- `packages/database/src/schema/auth.ts` — declare `shopName`, `shopAddress`.
- `apps/web/src/modules/auth/server/auth-client/index.ts` — extend `additionalFields` with `shopName`, `shopAddress` (input: false).
- `apps/web/src/modules/auth/components/signup/index.tsx` — render `<ShopkeeperSignupForm />` when `?type=shopkeeper`; render the mart-shelf strip on mobile when shopkeeper.

### Schema / type changes
- DB: `user.shop_name text NULL`, `user.shop_address text NULL`.
- Drizzle: `shopName: text('shop_name')`, `shopAddress: text('shop_address')`.
- Better-auth: `additionalFields.{shopName, shopAddress}` (input: false — written via `/api/auth/post-signup`).
- Zod: shopkeeper variant of `signupSchema` was already defined in screen 3's commit; the route handler also already reads + writes the shop fields (it just had no DB columns to write into until now).

### API / server-action changes
None this commit — the post-signup route shipped in screen 3 already accepts the shopkeeper variant.

### New molecules introduced (screen-local)
- `ShopkeeperSignupForm` — 4-field form with inline `<textarea>` (per Q4 — same Tailwind treatment as the rider-instructions inline textarea; not promoted to a shared primitive).
- `MartShelfStrip` — mobile-only.

## Step C — Quality gate

| Gate | Result |
|---|---|
| `pnpm exec tsc --noEmit` (apps/web) | ✅ exit 0 |
| `pnpm lint` | ✅ "No ESLint warnings or errors" |
| `pnpm build` (with dev `CRON_SECRET`) | ✅ exit 0 — `/sign-up` now ~10 kB with both variants compiled in |
| Migration apply | DEFERRED — operator runs `drizzle-kit migrate` for migrations 0012–0014. |
| Playwright smoke | DEFERRED — same Twilio/dev-DB defer as buyer-signin / buyer-otp. |

## Spec adherence (Q1–Q13 → file:line)

- **Q1 — "6-digit OTP" hint:** `signup/shopkeeper-form.tsx:212`.
- **Q2 — Responsive headline split (30/800 desktop, 22/800 mobile):** `signup/index.tsx:53` (`text-[22px] md:text-[30px]`).
- **Q3 — "to verify your shop." sub copy:** `signup/index.tsx:57` and `shopkeeper-form.tsx:212`.
- **Q4 — Inline textarea (no shared primitive):** `shopkeeper-form.tsx:152-167` reuses the rider-instructions Tailwind treatment.
- **Q5 — Shopkeeper name validation (same regex as generic):** `packages/schemas/src/auth/signup.ts:14-22` (shared `baseFields`).
- **Q6 — shopName min 2 / max 80; shopAddress min 10 / max 300:** `packages/schemas/src/auth/signup.ts:30-39`.
- **Q7 — Continue copy stays + spinner replaces chevron:** `shopkeeper-form.tsx:188-198`.
- **Q8 — No back button on mobile shopkeeper signup:** inherited from `signup/index.tsx:30` `showBack={false}`.
- **Q9 — Mart-shelf strip on EN mobile:** `signup/index.tsx:31` mounts `<MartShelfStrip />` only when `isShopkeeper`. Falls back to a no-strip rendering if Q9 plausible (b) — operator can toggle by editing `mart-shelf-strip.tsx`'s root `md:hidden` to also `hidden`.
- **Q10 — 4×2 grid of 8 generic silhouettes (OQ-A) hosted in `apps/web/public/auth/shopkeeper-mart-shelf/`:** revised — used 8 stable lucide-react icons inline so no static asset commit is needed yet. Rationale: lucide guarantees no brand-IP exposure (per OQ-A intent) and the silhouettes are ink-on-ink-bg as the design calls for. If the operator wants bespoke SVGs in `public/`, the `MartShelfStrip` component just needs each tile's icon swapped for an `<Image>`.
- **Q11 — Single `signupSchema` discriminated union:** already shipped in screen 3 (`packages/schemas/src/auth/signup.ts:41-44`). Shopkeeper variant now reachable end-to-end.
- **Q12 — `shopName` distinct from `businessName`:** `packages/database/src/schema/auth.ts:20-30`. The drawer fallback `businessName ?? shopName ?? user.name` will land when a future batch wires it; for now the column is just authored.
- **Q13 — Single `/sign-up?type=shopkeeper` route:** `signup/index.tsx:25-26` reads the type query.

## Completed

### Files created
- `packages/database/migrations/0014_user_shop_columns.sql`
- `apps/web/src/modules/auth/components/signup/shopkeeper-form.tsx`
- `apps/web/src/modules/auth/components/signup/mart-shelf-strip.tsx`

### Files edited
- `packages/database/migrations/meta/_journal.json`
- `packages/database/src/schema/auth.ts`
- `apps/web/src/modules/auth/server/auth-client/index.ts`
- `apps/web/src/modules/auth/components/signup/index.tsx`

### Test updates
None.

### Deviations from plan
- Mart-shelf tiles use lucide silhouettes inline rather than `apps/web/public/auth/shopkeeper-mart-shelf/*.svg`. Same visual intent, less binary churn; SVGs can land later.
