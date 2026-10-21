# Phase 0.7 — Scope Cut

> **Phase:** Pre-implementation scope decisions (read-only synthesis).
> **Date produced:** 2026-05-02
> **Inputs:** every `.claude-revamp/screens/*/gap-analysis.md`, plus `01-codebase-map.md` and `02-design-inventory.md`.
> **Output rule:** every NEW feature area implied by the gap analyses, with the cross-screen questions it answers, a rough cost, a fallback if deferred, and an honest IN_SCOPE / STUBBED / DEFERRED / DROPPED recommendation.
> **Sort:** cost-descending (biggest scope decisions first). User overrides expected.

Notes on cost units:

- **SMALL** = a few new fields, hours.
- **MEDIUM** = new endpoint + UI block, 1–2 days.
- **LARGE** = new schema concept + multi-screen impact, multiple days.
- **VERY_LARGE** = a new subsystem (event tracking, attribution, etc.).

Every "question summary" entry is `(screen, question_number, one-line summary)` — the screen file is `.claude-revamp/screens/<name>/gap-analysis.md`.

---

## VERY_LARGE features

### Feature: Banner performance analytics & revenue attribution

- **Description:** Capture banner impressions and clicks (event stream or per-row counters), attribute resulting orders back to a banner click (last-click within session, or join table), and aggregate the result into per-banner stats and admin-level KPIs (CTR, revenue attributed, deltas vs prior period). Touches: a new events table or per-row counters on `promotional_banners`, a click-tracking endpoint, an `orders.attributedBannerId` (or `order_attributions` join), an admin analytics endpoint, and the storefront banner click-through wiring. Surfaces in the admin banners KPI row, the per-banner card stats, the SCHEDULED-row "—" placeholder rule, and the dashboard's "REVENUE ATTRIBUTED" tile.
- **Questions it answers across gap analyses:**
  - (admin-banners, Q2.2 row, KPI cards Impressions / Clicks / Avg CTR / Revenue Attributed)
  - (admin-banners, Q7, "How is revenue attributed?")
  - (admin-banners, Q17, "Header subtitle 1.84 M figure — same source as KPI?")
  - (admin-banners, Q18, "Card stats render as '—' for SCHEDULED — when do counters start?")
  - (admin-banners, Q20, "1.84 M / Rs. 4.2 L abbreviation rules")
  - (admin-banners, Q16, "Performance report header CTA — full screen analytics page?")
  - (admin-dashboard, KPI row source, indirectly — banners-driven revenue feeds dashboard sales KPIs)
- **Cost to implement (rough):** VERY_LARGE.
- **If DEFERRED, what placeholder is needed?** KPI cards render "—" with subtitle "Coming soon". `promotional_banners` keeps simple `impressions`/`clicks` `bigint default 0` columns (no events table, no attribution). Per-card stats render "—". Header subtitle drops the impressions count. "Performance report" CTA hidden. No `orders.attributedBannerId`.
- **Recommendation:** **DEFERRED**. Attribution is a real subsystem (event ingestion path + session→order link) and the design already shows "—" / "Coming soon"-friendly states. Keep scalar counters as a cheap upgrade path; ship the real surface in a follow-up.

---

### Feature: Admin analytics dashboard (KPIs + sales-by-vendor + order status + recent orders + top sellers + audit feed)

- **Description:** Replace the existing placeholder admin dashboard with the Pencil's six-block layout: 4 KPI cards (Total Sales / Items Listed / Total Orders / Active Vendors with deltas), Sales-by-vendor bar list (top-5 + rollup with % share), Order Status tile triple (PENDING / DELIVERED / CANCELLED with avg fulfillment + SLA), Recent Orders table (cross-vendor; new endpoint), Top Sellers (5 vendors, weekly amount + WoW trend), and a live Audit Log feed. Requires new analytics endpoints (per widget or a single `GET /api/admin/analytics/`*), an `/api/admin/orders` endpoint, vendor-deactivation event source, weekly aggregations, and a chart primitive.
- **Questions it answers across gap analyses:**
  - (admin-dashboard, Q-KPI-1 / Q-KPI-2 / Q-KPI-3, KPI definitions, formats, comparison periods)
  - (admin-dashboard, Q-SBV-1 / Q-SBV-2, vendor revenue source + "See all vendors" target)
  - (admin-dashboard, Q-OS-1 / Q-OS-2 / Q-OS-3 / Q-OS-4, order-status bucketing, stamp mapping, fulfillment/SLA source)
  - (admin-dashboard, Q-RT-1 / Q-RT-2 / Q-RT-3 / Q-RT-4 / Q-RT-5, recent-orders columns, displayId format, multi-suborder rollup, row click)
  - (admin-dashboard, Q-TS-1 / Q-TS-2, top-seller click target + trend period)
  - (admin-dashboard, Q-RNG-1, range presets)
  - (admin-dashboard, Q-EXP-1, export CSV scope)
  - (admin-dashboard, Q-RPT-1, "+ New report" destination)
  - (admin-dashboard, Q-MOB-1, mobile KPI count)
  - (admin-dashboard, Q-STATES-1, empty/loading/error states)
  - (admin-dashboard, Q-FMT-1, lakh/crore notation)
- **Cost to implement (rough):** VERY_LARGE.
- **If DEFERRED, what placeholder is needed?** The four KPI cards show `Rs. 0` / `0` with subtitle "Connecting…" or "Coming soon". Sales-by-vendor and Top sellers render an empty-state card "Live charts available soon". Order Status tile renders against existing sub-order status counts only (PENDING = pending+packed+handed_to_courier; DELIVERED = delivered; CANCELLED = cancelled). Recent Orders table renders against existing `orders` (no admin orders endpoint needed if read directly via Drizzle in a server component). Audit Log card renders empty until writers are wired (see "Admin audit log writers" below).
- **Recommendation:** **STUBBED**. Ship the visual shell + Order Status (cheap; existing data) + Recent Orders (cheap server-side fetch) + a static SLA constant. Defer KPI deltas, Sales-by-vendor aggregations, Top sellers WoW trend, and "+ New report" CTA. The page reads "real" without committing to a dashboard subsystem.

---

### Feature: Pack-based pricing schema migration (replaces tier-band model)

- **Description:** Migrate from `product_price_tiers (minQty, maxQty, priceCents)` quantity-band model to a discrete pack model: `products` gets `packSize`, `packMrpCents`, `packWholesalePriceCents`, `unitWeightGrams`, optional `pricePerUnitCents`; new `product_pack_tiers (productId, packQty, pricePerPackCents, badge?, isDefault?)`. Cascading impact on add-product form, vendor product list, PDP price block + bundle selector + qty stepper unit, cart line item fields, cart-store persist key shape, checkout `order_items` snapshot, and `formatPrice` callers. Already user-confirmed in `02 §7 Q12`.
- **Questions it answers across gap analyses:**
  - (buyer-product, Q5 / Q6 / Q7 / Q10 / Q11 / Q12 / Q13 / Q29, MRP, save pill, per-unit caption, bundle cards, removal of tier-band schema, default-selected bundle, qty stepper unit, weightGrams ambiguity)
  - (buyer-cart, Q1 / Q4 / Q23, "Pack of N" eyebrow, `1.008 KG` weight semantics, per-pack price column)
  - (vendor-products, Q5 / Q11 / Q15-style fields — pack size, pricing card semantics, MRP/wholesale fields)
  - (buyer-home, Q11, prod1 price model — list vs sale)
  - (buyer-reorder, Q13 / Q14 / Q15, "Pack of N" suffix, weight eyebrow, per-unit copy phrasing)
- **Cost to implement (rough):** VERY_LARGE (schema migration + every product-touching surface + cart-store migration).
- **If DEFERRED, what placeholder is needed?** N/A — already user-confirmed; not a candidate for deferral.
- **Recommendation:** **IN_SCOPE**. Confirmed in `02 §7 Q12`. Implementation order should land schema first, then PDP/cart/vendor-form together.

---

### Feature: Vendor weekly payouts (`payout_runs` + 7-day return window + ledger surface)

- **Description:** New `payout_runs` table snapshotting per-cycle payout (weekStart/weekEnd, paidOn, txnId, completedOrdersCount, gross/returns/MNP/net amounts, status enum `pending|paid|held|failed`). 7-day return-window business rule means delivered sub-orders aren't eligible for a payout cycle until their return window closes (needs `deliveredAt` or `eligibleForPayoutAt`). Cycle-roll job creates the next pending run on Friday close. Surfaces: Vendor Ledger screen (entire screen is new), Vendor Dashboard payout-pending KPI tile, Dashboard "Next payout" callout, Friday countdown. Already user-confirmed via `features/vendor-payouts/surface-map.md`.
- **Questions it answers across gap analyses:**
  - (vendor-ledger, Q1–Q24 essentially the entire screen)
  - (vendor-dashboard, KPI k4 + payout callout block)
  - (vendor-orders, indirectly — return-window business logic affects vendor expectations)
- **Cost to implement (rough):** VERY_LARGE (new entity + cycle-job + ledger UI + dashboard touchpoints).
- **If DEFERRED, what placeholder is needed?** Vendor dashboard payout tile shows `Rs. 0` + "Releases Friday — coming soon". Vendor Ledger screen renders an empty state "Payout history will appear here every Friday". Bank info card still shows the vendor's `bankName`/`iban` (mask).
- **Recommendation:** **IN_SCOPE**. Already user-confirmed. The 7-day return window business rule is the riskiest sub-decision — ship with `eligibleForPayoutAt` derived from `handedAt + 7d` initially; schema migration can be additive later.

---

### Feature: Wishlist / Saved Items

- **Description:** New `saved_items (userId, productId, createdAt)` table + `GET/POST/DELETE /api/user/saved-items` endpoints. Drives: heart icon on `prod1` cards (home, hot products, YMAL on PDP), heart on PDP qty row, "Saved" header button on storefront home, "Saved items · 12 products bookmarked" nav row in account drawer, and a future `/profile/saved` page. Auth-gated (signed-in only) with optional guest local-storage merge on sign-in.
- **Questions it answers across gap analyses:**
  - (buyer-home, Q12, wishlist scope — full feature vs stub vs drop)
  - (buyer-product, Q14 / Q26, heart on PDP and on prod1 cards)
  - (buyer-account-drawer, Q15, Saved items count + nav row)
- **Cost to implement (rough):** LARGE.
- **If DEFERRED, what placeholder is needed?** Heart icons render but are no-ops (or removed). Account drawer "Saved items" row hidden or shows "0 products bookmarked" linking to a "Coming soon" page. Header "Saved" button hidden.
- **Recommendation:** **DEFERRED**. The heart icon is everywhere but the feature carries non-trivial schema + auth-gate + guest-merge UX. Drop the affordance from `prod1` and the account drawer nav row for now; revisit once the storefront chrome lands.

---

## LARGE features

### Feature: Order tracking surface (buyer-side)

- **Description:** Buyer-facing tracking screen / view that surfaces `sub_orders.courierTrackingId`, status timeline, and ETA. Required because the existing `/profile/orders/[id]` route is being repurposed as the Reorder screen (per `02 Q1`), removing the parcel-level tracking UI. Also referenced by the storefront util-strip "Track order" link, the account drawer "Track order" row with "#SH-24735 · out for delivery" subtitle, the Buyer Orders per-card "Track order" CTA (for in-transit rows), and indirectly by Reorder's "MNP delivery to Gujranwala · Estimated 2–3 days" pill.
- **Questions it answers across gap analyses:**
  - (buyer-orders, Q-RT-4 equivalent — Track order CTA target)
  - (buyer-orders, "Track order" primary button on in-transit cards)
  - (buyer-account-drawer, Q10, Track order row + active-order copy mapping)
  - (buyer-reorder, parcel-tracking removal — where does in-flight status live?)
  - (buyer-reorder, "same MNP partner" claim source)
- **Cost to implement (rough):** LARGE.
- **If DEFERRED, what placeholder is needed?** "Track order" CTAs route to `/profile/orders/[id]` which renders the existing detail (parcel boxes still work) — keep the existing detail UI as a fallback. Account drawer Track-order row hides when no active order. Util-strip "Track order" link goes to `/profile/orders`.
- **Recommendation:** **DEFERRED**. Keep the existing `RetailerOrderDetail` parcel-boxes UI alive at `/profile/orders/[id]` as the temporary tracking surface; introduce the new branded tracking screen post-launch. The Reorder screen Q1 answer ("View details opens Reorder") needs revisiting since this changes the route semantics — flag for the user.

---

### Feature: Vendor add-product approval workflow + autosave (draft → pending_review → active)

- **Description:** Add `products.status enum('draft','pending_review','active','archived')` plus an admin moderation queue. Vendor add-product form auto-saves field changes to a draft row, "Save as draft" persists, "Submit for approval" transitions to `pending_review`, admin approves to `active`. Implies a new admin product-moderation surface (no design drawn). Stats segments and list pills depend on this enum. Currently new products go live immediately on POST.
- **Questions it answers across gap analyses:**
  - (vendor-products, Q9, status taxonomy + approval workflow)
  - (vendor-products, Q10, autosave + Save as draft + Cancel + Submit semantics)
  - (vendor-products, Q24, "NEW PRODUCT · DRAFT" eyebrow semantics)
  - (vendor-products, Q23, Cancel button discard rules)
  - (vendor-products, Q2, "changes go live immediately" subtitle vs approval gate)
  - (admin-dashboard, Q-SB-3, /admin/products destination — admin moderation surface)
- **Cost to implement (rough):** LARGE.
- **If DEFERRED, what placeholder is needed?** Submit button reads "Save product" and POSTs straight to `active` (current behavior). "Save as draft" persists with `status='draft'` (visible only to the vendor in the draft chip filter). No `pending_review` state, no admin moderation. "Saved automatically as draft" footer copy hidden. Eyebrow reads "NEW PRODUCT" without "DRAFT" suffix.
- **Recommendation:** **STUBBED**. Add `status` enum (draft|active) and the Save-as-draft path now (cheap, useful). Defer `pending_review` + admin moderation queue + autosave — current vendors don't need a gate.

---

### Feature: Categories rich model (icon, description, parent, sort order, isActive, audit, slug-edit, aggregates)

- **Description:** Extend `categories` with `iconKey` (Lucide name), `description`, `parentId` (self-FK), `sortOrder`, `isActive`, `createdBy`/`updatedBy`. Replace image upload with Lucide icon picker. Add `productCount`/`vendorCount` aggregates to admin list endpoint. Add `DELETE /api/admin/categories/[id]`, reorder endpoint, export CSV, KPI aggregations (total / products listed / inactive / needs-review). Status taxonomy ACTIVE / NEEDS REVIEW / INACTIVE. Slug becomes user-editable with redirect concerns. Adds a settings/visibility toggle that hides categories from the storefront.
- **Questions it answers across gap analyses:**
  - (admin-categories, Q1–Q26 — entire screen is built around this expansion)
  - (buyer-home, Q9, category icons inside swatches; mobile lucide map)
  - (buyer-home, Q10, Popular section SKU count + curation)
  - (admin-banners, Q2 indirectly — Catalog parent grouping for breadcrumb)
- **Cost to implement (rough):** LARGE.
- **If DEFERRED, what placeholder is needed?** Categories table stays as today; admin screen ships visual retoken only; KPI cards show "—"; status filter pills hidden; bulk-select decoration only; Reorder/Export buttons hidden; per-row trash + ellipsis hidden. Storefront category tiles continue to use `imageUrl` (no icon swap).
- **Recommendation:** **STUBBED for visual retoken now; full feature DEFERRED**. Add `iconKey` + `isActive` only (cheap; needed for storefront filtering and mobile category icons). Defer description, parent, sortOrder, audit, aggregates, reorder, export, slug-edit redirects.

---

### Feature: Admin Banners scheduling + status state machine

- **Description:** New columns `startsAt`, `endsAt`, manual `status enum('live','paused')`. Derived 4-state filter (Live / Scheduled / Expired / Paused) computed from `(status, startsAt, endsAt, now)`. Storefront banner feed must filter by current schedule window. Banner positions enum (HERO / PROMO TOP / STRIP / SIDEBAR), eyebrow, ctaLabel, internalName. New `PATCH /api/admin/banners/[id]` (per-banner edit replaces bulk-PUT model). Inline edit panel replaces modal. User pre-confirmed in `02 §7 Q13`.
- **Questions it answers across gap analyses:**
  - (admin-banners, Q3 / Q4 / Q5 / Q6 / Q9 / Q10 / Q11 / Q12 / Q14 / Q19, copy fields, position taxonomy, reorder, status state machine, save-vs-publish, link URL, file metadata, preview/duplicate, route rename)
  - (buyer-home, Q3, hero data source — extends banners table or new home_hero_slides)
- **Cost to implement (rough):** LARGE.
- **If DEFERRED, what placeholder is needed?** Existing `isActive` boolean + dnd-kit reorder retained; filter pills hidden; per-card stats hidden; KPI row stubbed (see Banner Performance feature); audience block hidden. Storefront feed unchanged.
- **Recommendation:** **IN_SCOPE** for scheduling + status (user already said yes). **DEFERRED** for the position taxonomy beyond HERO (storefront can't render PROMO TOP / STRIP / SIDEBAR without separate slot work) and audience targeting (see below).

---

### Feature: Banner audience targeting

- **Description:** New banner fields `targetCities`, `targetSegment`, `targetPlatforms`. Storefront feed filters banners by current user's city/segment/platform. Requires a buyer "segment" concept (none exists), city resolution from session/default-address, and a platform discriminator.
- **Questions it answers across gap analyses:**
  - (admin-banners, Q13, audience targeting fields — editable or display-only)
- **Cost to implement (rough):** LARGE.
- **If DEFERRED, what placeholder is needed?** Audience block in edit panel hides entirely. No new fields persisted.
- **Recommendation:** **DEFERRED**. Drawn as read-only summary text with no editable affordances — strong signal it was sketched without serious thought. Hide the block.

---

### Feature: Reorder screen (interactive draft → add to cart)

- **Description:** New `/profile/orders/[id]` behavior (per `02 Q1`): edit quantities + selection + remove on a snapshot of past order; live recompute weight gauge, tier, GST, totals, comparison vs original; "Add N items to cart" pushes selected rows into `cart-store`; "Save as new list" implies a saved-lists feature (separate area). Replaces the existing read-only order-detail role.
- **Questions it answers across gap analyses:**
  - (buyer-reorder, Q1–Q42 essentially the whole screen)
  - (buyer-orders, Q9, "View details" target = Reorder)
- **Cost to implement (rough):** LARGE.
- **If DEFERRED, what placeholder is needed?** Keep existing `RetailerOrderDetail` (parcel-boxes + ReceiptCard + ReviewDrawer) at `/profile/orders/[id]`. Buyer Orders per-card "Reorder" button hidden; only "View details" remains, routing to existing detail.
- **Recommendation:** **IN_SCOPE**. The screen is a primary buyer flow per the brief and the route is already gated by middleware. But explicitly cut "Save as new list" (separate feature below) and the comparison panel can be a v1 polish item.

---

### Feature: Saved shopping lists (Reorder secondary CTA)

- **Description:** New `saved_lists (id, userId, name, createdAt)` + `saved_list_items` tables, CRUD endpoints, listing screen. Driven only by the Reorder "Save as new list" outline button on desktop. Mobile sticky bar omits the CTA.
- **Questions it answers across gap analyses:**
  - (buyer-reorder, Q32, "Save as new list" feature scope)
- **Cost to implement (rough):** LARGE (full feature with no listing-screen design).
- **If DEFERRED, what placeholder is needed?** Hide the secondary CTA on Reorder. No further surfaces affected.
- **Recommendation:** **DROPPED for this revamp**. There is no listing-screen design, no consumer surface that uses lists, and it duplicates cart-state semantics. Drop the button.

---

### Feature: Admin audit log (writers + viewer feed)

- **Description:** Wire writers into every admin mutation (vendor create/update/deactivate, banner create/edit/bulk-update, category create/update/delete, etc.) populating the existing `admin_audit_log` table with a controlled action vocabulary. Add a target resolver (vendor → shopName, banner → title, product → name, category → name, order → displayId). Surface via `GET /api/admin/audit-log` and the dashboard's Audit Log card. Display per-row meta in admin Categories/Vendors edit panels. "Reviewed dispute" entries imply a future disputes entity — drop that sample.
- **Questions it answers across gap analyses:**
  - (admin-dashboard, Q-AUD-1 / Q-AUD-2 / Q-AUD-3 / Q-AUD-4, audit log feed)
  - (admin-categories, Q1 / Q10 / Q25, "last edit" subtitle source + audit panel)
  - (admin-vendors, Q25, audit "onboarded by" / "last edited by")
- **Cost to implement (rough):** LARGE (every mutation touched + resolver layer + UI).
- **If DEFERRED, what placeholder is needed?** Audit Log card on admin dashboard renders empty-state "Recent admin actions will appear here". Per-screen edit panels hide audit block. Header subtitle drops "last edit N days ago".
- **Recommendation:** **STUBBED**. Wire writers into the most consequential mutations (vendor activate/deactivate, banner publish, category delete) only — that gives the dashboard feed real entries. Defer the full taxonomy + per-screen audit panels.

---

### Feature: Vendor sales analytics (7D/30D/90D chart + recent orders + low stock + top sellers)

- **Description:** Vendor dashboard widgets: 7-day revenue chart with TUE→MON bars (today/best-day highlights), segmented control 7D/30D/90D, recent orders panel (top 5/3 of today), low-stock card (3 rows with sales velocity), top sellers card (5 ranks by units). Each requires a new vendor-scoped analytics endpoint. Sales velocity ("sells ~14/day") implies an aggregation over `order_items` per product over a rolling window.
- **Questions it answers across gap analyses:**
  - (vendor-dashboard, Q5 / Q6 / Q11 / Q12 / Q13 / Q15 / Q16 / Q17, all the dashboard widgets)
- **Cost to implement (rough):** LARGE.
- **If DEFERRED, what placeholder is needed?** Sales chart shows "No sales yet — chart will appear after your first orders" or static zero-bars. Recent orders renders against existing `/api/vendor/orders` filtered to today. Low-stock card derived from `products.stock <= 10` constant. Top sellers hidden or stubbed.
- **Recommendation:** **STUBBED**. Ship Recent Orders (cheap; existing data) + Low-stock-from-constant-threshold. Defer the chart, top sellers, and KPI deltas.

---

### Feature: Vendor product enrichment fields (SKU, brand, tagline, low-stock threshold, restock lead time, packaging unit, MRP)

- **Description:** Add to `products`: `sku` (vendor-unique), `brand`, `tagline`, `lowStockThreshold`, `restockLeadTimeDays`, `packagingUnit` (CARTON/TIN/BAG/BOX). Net weight unit reconciliation (decimal kg vs integer grams). Drives vendor list table (SKU column, status pill, low-stock derivation), add-product form fields, PDP eyebrow ("CARTON × 12"), Reorder per-row weight eyebrow + per-unit copy phrasing.
- **Questions it answers across gap analyses:**
  - (vendor-products, Q5 / Q6 / Q8 / Q14, pack size, net weight unit, SKU autogen, SKU uniqueness)
  - (buyer-home, prod1 brand eyebrow + pack metadata)
  - (buyer-cart, Q1 / Q2, vendor name / brand on cart line + pack count)
  - (buyer-reorder, Q14 / Q15, weight eyebrow + per-unit phrasing)
  - (vendor-dashboard, Q16, SKU field for low-stock rows)
- **Cost to implement (rough):** LARGE.
- **If DEFERRED, what placeholder is needed?** Vendor list shows no SKU column (replace with slug) and a `LOW STOCK` pill driven by a constant threshold. PDP/cart eyebrows drop brand and pack-unit segments. Add-product form omits the new fields.
- **Recommendation:** **IN_SCOPE for SKU + brand + low-stock threshold** (most-touched fields). **DEFERRED for tagline + restock lead time + packaging unit enum** — the cart/PDP can render "PACK" generically until packagingUnit ships.

---

### Feature: Vendor third status (PENDING REVIEW)

- **Description:** Convert `vendors.isActive` boolean into `status enum('active','inactive','pending')`, or add `verifiedAt` timestamp (NULL = pending). Drives the admin vendors KPI tile (Pending Review · 12), filter pill, status stamp, and the "12 pending review" header subtitle count.
- **Questions it answers across gap analyses:**
  - (admin-vendors, Q7 / Q8 / Q9, third vendor status — schema model + setting mechanism + edit panel toggle gap)
- **Cost to implement (rough):** MEDIUM-LARGE (schema migration on a much-referenced column).
- **If DEFERRED, what placeholder is needed?** KPI tile and filter pill hidden. Stamp variants stay 2-state (Active/Inactive). Header subtitle drops "12 pending review".
- **Recommendation:** **DEFERRED**. There is no design for the vendor onboarding/verification flow that would set this status — without that, "pending" is a UI-only concept. Wait for the onboarding design.

---

### Feature: Vendor enrichment (logo, display ID, full name, email, address, monthly limit, categories)

- **Description:** Add to `vendors`: `logoUrl`, `displayId` (`#VND-NNNN` sequential), `fullName` (separate from `shopName`), `monthlyLimitCents`, `address` (free-form, possibly replacing `city`). Add `vendor_categories` join table. Persist `email` through `user.email`. Drives admin vendors edit panel + table (avatar with initials, primary/secondary name, monthly-limit usage helper, categories chip editor).
- **Questions it answers across gap analyses:**
  - (admin-vendors, Q10 / Q11 / Q12 / Q14 / Q15 / Q20 / Q21 / Q22 / Q23 / Q24 / Q26 / Q33, GST conflict, bank-details placement, remove vendor, hubs source, sort, avatar algorithm, city vs address, displayId format, categories, monthly-limit semantics, lifetime sales window, email source)
  - (buyer-cart, Q2, vendor-name source on cart line)
- **Cost to implement (rough):** LARGE.
- **If DEFERRED, what placeholder is needed?** Edit panel renders Categories block + Monthly Limit + Vendor ID + Logo card + Audit meta as hidden. Avatar derives from `shopName` initials. Table loses Products and Monthly Sales columns (no aggregates).
- **Recommendation:** **STUBBED**. Add `displayId` + `fullName` + `address` + `email` (all small migrations). Defer monthly limit (no enforcement design), per-vendor categories (no consumer surface), and logo upload (initials are fine).

---

### Feature: Search route `/search`

- **Description:** New `/search` route + `GET /api/search` endpoint. Backs the storefront header search form (already POSTs to `/search`), the admin global search ("Search vendors, products, orders…" placeholder), and the vendor product search.
- **Questions it answers across gap analyses:**
  - (buyer-home, Q13, /search route implementation)
  - (admin-dashboard, Q-SEARCH-1, admin global search behavior)
- **Cost to implement (rough):** LARGE (cross-entity full-text or trigram search; new endpoint family).
- **If DEFERRED, what placeholder is needed?** Storefront search form remains broken (`<form action="/search">` 404s). Admin top-bar search renders inert. Vendor list search filter hidden.
- **Recommendation:** **DEFERRED**. Big enough to be its own milestone. For now, implement client-side filtering on the vendor product list (cheap; existing data) and disable the storefront/admin search inputs.

---

### Feature: Account drawer (full feature)

- **Description:** Sheet-based right-side overlay (480w desktop, full-screen mobile) replacing the existing storefront header DropdownMenu. Surfaces user identity (avatar, phone, shop name, VERIFIED stamp, member-since), 3-stat grid (Orders/Spent/Saved), 9 nav rows (Orders/Quick reorder/Saved addresses/Payment methods/Saved items/Settings/Track order/Help center/Terms & privacy), language toggle, logout, version string. Trigger from header `Account` button + `/profile` route deep-link. Dependencies: profile-stats endpoint, saved-items, payment-methods, settings shell, version env var, scrim/shadow tokens.
- **Questions it answers across gap analyses:**
  - (buyer-account-drawer, Q1–Q18, entire screen)
  - (buyer-home, Q7, Account button → drawer trigger)
- **Cost to implement (rough):** LARGE.
- **If DEFERRED, what placeholder is needed?** Keep existing DropdownMenu with retoken. Header `Account` button opens dropdown.
- **Recommendation:** **IN_SCOPE for the chrome shell + identity card + logout + nav rows that have real targets (Orders, Saved addresses, Settings)**. **STUBBED for stat grid (show "—"), Saved items row (hide), Payment methods row (hide), Track order row (conditional render only when active order detected)**. The drawer is the new chrome and worth shipping; defer its data-heavy parts.

---

### Feature: Buyer profile stats (`GET /api/user/profile-stats`)

- **Description:** Single endpoint returning ordersCount / inTransitCount / totalSpentCents / totalSavedCents / activeAddressesCount / defaultAddressTitle / savedItemsCount / activeOrderDisplayId / activeOrderStatusLabel. Powers the account drawer's stat grid + multiple nav-row subtitles.
- **Questions it answers across gap analyses:**
  - (buyer-account-drawer, Q2 / Q11, "Saved" formula + freshness/cache strategy)
  - (buyer-account-drawer, indirectly Q10 — active order lookup)
- **Cost to implement (rough):** MEDIUM.
- **If DEFERRED, what placeholder is needed?** Drawer stats render "—". Nav-row subtitles fall back to static copy ("View your orders" instead of "24 orders · 3 in transit").
- **Recommendation:** **STUBBED**. Implement ordersCount + activeAddressesCount + defaultAddressTitle now (cheap; existing tables). Defer totalSpent / totalSaved / inTransitCount / savedItemsCount until their underlying features land.

---

### Feature: Vendor self-service bank-info edit + admin moderation

- **Description:** New `PATCH /api/vendor/me/bank` with security gating (OTP via existing better-auth phone plugin, or admin approval queue). Pencil icon next to bank-info card on Vendor Ledger desktop and mobile. User pre-confirmed in `vendor-payouts/surface-map.md §7 Q5`.
- **Questions it answers across gap analyses:**
  - (vendor-ledger, Q14, bank-edit flow + security posture)
  - (admin-vendors, Q11, where bank details live in the new design)
- **Cost to implement (rough):** MEDIUM-LARGE (security model + UI).
- **If DEFERRED, what placeholder is needed?** Pencil icon on bank card hidden. Admin retains the only path via existing admin-vendors edit panel.
- **Recommendation:** **DEFERRED**. Bank-account changes are fund-routing-risk; the design draws a pencil icon but no flow. Keep admin-only for now and revisit with a security-design pass.

---

### Feature: Statement / CSV downloads (vendor ledger PDFs, admin exports)

- **Description:** Multiple "Download statement" / "Export CSV" / "Export all" affordances across vendor ledger, admin banners, admin categories, admin vendors, admin dashboard, buyer orders. Requires per-surface streaming endpoints + format decisions (PDF for statements, CSV for tables). User pre-confirmed "ignore for now" in `vendor-payouts/surface-map.md §7 Q6`.
- **Questions it answers across gap analyses:**
  - (vendor-ledger, Q6, statement download buttons)
  - (admin-banners, Q16, performance report export)
  - (admin-categories, Q15, export CSV scope)
  - (admin-dashboard, Q-EXP-1, dashboard export)
  - (admin-vendors, Q6, export CSV / bulk import)
  - (buyer-orders, Q8, Export CSV)
- **Cost to implement (rough):** LARGE (PDF generation infrastructure + per-surface endpoints).
- **If DEFERRED, what placeholder is needed?** All "Download…" / "Export…" buttons hidden across screens.
- **Recommendation:** **DROPPED for this revamp**. User already said ignore in the payouts surface map; apply that consistently across all admin surfaces. Hide every Download/Export button.

---

### Feature: Bulk import (CSV) for admin vendors / vendor products

- **Description:** New `POST /api/{admin/vendors,vendor/products}/import` endpoints + parsing + preview UI. Drawn as an "Import CSV" outline button on admin vendors and vendor products headers. No upload-flow design exists.
- **Questions it answers across gap analyses:**
  - (admin-vendors, Q6, Bulk import scope)
  - (vendor-products, Q4, Import CSV flow)
- **Cost to implement (rough):** LARGE.
- **If DEFERRED, what placeholder is needed?** Buttons hidden.
- **Recommendation:** **DROPPED for this revamp**. No flow drawn; defer.

---

### Feature: Admin Orders / Products / Sales Reports / Users screens

- **Description:** Four new admin routes referenced from sidebar nav: `/admin/orders` (with badge count "24"), `/admin/products`, `/admin/sales-reports`, `/admin/users` (icon-only label, likely "Users"). None designed in this Pencil pass.
- **Questions it answers across gap analyses:**
  - (admin-dashboard, Q-SB-2 / Q-SB-3 / Q-SB-4 / Q-SB-7, sidebar destinations)
- **Cost to implement (rough):** LARGE per screen.
- **If DEFERRED, what placeholder is needed?** Sidebar entries either (a) hidden, or (b) link to a "Coming soon" placeholder page. Orders count badge hidden.
- **Recommendation:** **STUBBED for Admin Orders only** (read-only list against existing `orders`; reuses Recent Orders endpoint). **DROPPED for Products, Sales Reports, Users** — no design, no scope. Hide their sidebar rows.

---

### Feature: Admin/Vendor chrome revamp (ink top bar, sectioned sidebar, mobile bottom tab bar)

- **Description:** Replace existing light admin/vendor headers with the Pencil ink top bar (brand mark + role badge + dark search + bell + avatar+name+chevron). Restructure sidebars from single "Navigation" group into 3–4 sectioned groups (OVERVIEW / CATALOG / OPERATIONS / ACCOUNT). Add vendor mobile bottom tab bar (Dashboard / Products / Orders / Ledger / More). Logout moves into avatar dropdown / account drawer.
- **Questions it answers across gap analyses:**
  - (admin-dashboard, Q-CHROME-1 / Q-AVATAR-1 / Q-SB-1 through Q-SB-8)
  - (vendor-dashboard, Q3 / Q10, sidebar Settings + bell/user-pill behavior)
  - (vendor-ledger, Q-CHROME-1, vendor app shell mismatch)
  - (vendor-orders, top-bar / sidebar context)
  - (vendor-products, top-bar / sidebar context)
  - (buyer-home, account button replaces Dropdown)
- **Cost to implement (rough):** LARGE (touches every admin + vendor page).
- **If DEFERRED, what placeholder is needed?** Existing chrome stays; per-page revamps land against current shell.
- **Recommendation:** **IN_SCOPE for visual retoken**. Land sectioned sidebar + ink top bar + sidebar Orders badge as a foundation pass before the per-screen revamps. **DEFERRED for bell/notifications and global search wiring** (per `02 §7 Q19` user said ignore bell). **DEFERRED for vendor mobile bottom tab bar** (organism-level work; keep existing collapsible sidebar on mobile until a separate pass).

---

## MEDIUM features

### Feature: Weight gauge + delivery tier table

- **Description:** Define delivery tiers (0–10 / 10–25 / 25–50 / 50+ kg → Rs. 280 / 180 / 120 / 80) as a constants module or DB table. Helper `resolveDeliveryTier(totalWeightGrams)`. Drives weight gauge component on Cart + Reorder + Checkout receipt label, plus the amber "Add 6.5 kg more — save Rs. 60" help banner.
- **Questions it answers across gap analyses:**
  - (buyer-cart, Q19 / Q20 / Q21 / Q22, tier source + active-tier rule + label format)
  - (buyer-cart, Q11, amber tip edge cases)
  - (buyer-reorder, Q6 / Q7 / Q8, tier table source + help banner template + mobile compact gauge)
  - (buyer-checkout, Q5, delivery (shipping) tier source)
- **Cost to implement (rough):** MEDIUM.
- **If DEFERRED, what placeholder is needed?** Weight gauge hidden on cart/reorder; checkout shipping line stays "Calculated at checkout" / `Rs. 0`.
- **Recommendation:** **IN_SCOPE**. Defining tiers as a constant + helper is cheap and gates a lot of UI. Use a constants file initially; promote to DB later if admin-editable becomes a need.

---

### Feature: GST 18% on orders

- **Description:** Add `taxCents` (or `gstCents`) to `orders`. Compute `0.18 × (subtotal + delivery)` server-side at checkout. Display "GST 18%" row on cart receipt, checkout summary, and reorder receipt. Constant `GST_RATE = 0.18` shared.
- **Questions it answers across gap analyses:**
  - (buyer-cart, Q18, GST rate source)
  - (buyer-checkout, Q6, GST computation base)
  - (buyer-reorder, Q25, GST 18% row)
- **Cost to implement (rough):** MEDIUM (cart/checkout/orders schema + computation + reconciliation).
- **If DEFERRED, what placeholder is needed?** GST row hidden across receipts. Total = subtotal + delivery only.
- **Recommendation:** **IN_SCOPE**. Compliance-adjacent and small in scope; pair with the delivery tier work.

---

### Feature: Postal code + province on addresses

- **Description:** Add `postalCode` and `province` (or `region`) to `addresses` schema. Mirror in `orders` shipping snapshot. Update create-address form and checkout manual form. Drives buyer-orders meta line, buyer-settings card composition, drawer "default Shop" subtitle.
- **Questions it answers across gap analyses:**
  - (buyer-settings, Q12 / Q13 / Q14, address composition + postal code + province)
  - (buyer-orders, Q13, postal code in order meta)
- **Cost to implement (rough):** MEDIUM (schema + 4 form mirrors).
- **If DEFERRED, what placeholder is needed?** Address card composition omits postal/province. Order meta line drops postal code.
- **Recommendation:** **IN_SCOPE**. Cheap, non-destructive (additive columns), gates address-display copy across multiple screens.

---

### Feature: Buyer business / shop name (`user.businessName`)

- **Description:** New nullable `businessName` text on `user` (e.g. "Tariq Kiryana Store"). Surfaces on account drawer user card, recent-orders rows on admin/vendor dashboards, buyer-orders cards.
- **Questions it answers across gap analyses:**
  - (buyer-account-drawer, "Tariq Kiryana Store" line)
  - (admin-dashboard, Q-RT-1, customer shop name)
  - (vendor-dashboard, Q15, buyer shop name on recent-orders)
- **Cost to implement (rough):** SMALL-MEDIUM.
- **If DEFERRED, what placeholder is needed?** Account drawer drops the third line. Recent-order rows show only `user.name`.
- **Recommendation:** **IN_SCOPE**. Single column on `user`; widely-used display field.

---

### Feature: Settings shell + sub-page routing

- **Description:** New `/profile/settings` route group with parent layout (sidebar nav card on desktop / stacked index on mobile) and sub-page `/profile/settings/addresses` (existing addresses page moves here, with a redirect from `/profile/addresses`). Per `02 §7 Q2` only Saved Addresses is in scope; Profile / Payment methods / Notifications / Preferences are drawn but explicitly deferred.
- **Questions it answers across gap analyses:**
  - (buyer-settings, Q1 / Q3 / Q4 / Q5 / Q26 / Q27 / Q29, shell layout + un-implemented nav rows + mobile chrome + index route)
- **Cost to implement (rough):** MEDIUM.
- **If DEFERRED, what placeholder is needed?** N/A — already user-confirmed in `02 Q2`.
- **Recommendation:** **IN_SCOPE**. Confirmed; the un-implemented nav rows render disabled with "Coming soon" labels.

---

### Feature: Payment methods feature

- **Description:** New `payment_methods` table + `/profile/settings/payment-methods` route + "Cash on delivery default" data. Drives the account drawer "Payment methods" nav row subtitle and the checkout payment selector (currently 3 cards drawn; only COD enabled).
- **Questions it answers across gap analyses:**
  - (buyer-account-drawer, Q4, payment methods schema vs static)
  - (buyer-checkout, Q4, payment method enum scope)
- **Cost to implement (rough):** MEDIUM (small-data feature; UI surface fanout).
- **If DEFERRED, what placeholder is needed?** Checkout payment selector renders 3 disabled cards with "Coming soon" labels (already drawn that way). Account drawer "Payment methods" row hidden or static "Cash on delivery". No table.
- **Recommendation:** **DEFERRED**. The design already shows "(coming soon)" on 2 of 3 cards — strong signal nothing real is needed. Keep the visual selector with COD pre-selected; no schema work.

---

### Feature: Hot products / trending metric

- **Description:** Add `products.isTrending` admin-curated boolean OR data-driven aggregation over recent `order_items`. Drives the home Hot Products section and the prod1 "HOT" badge variant.
- **Questions it answers across gap analyses:**
  - (buyer-home, Q4, what backs Hot Products)
- **Cost to implement (rough):** MEDIUM.
- **If DEFERRED, what placeholder is needed?** Home Hot Products section reuses `SuperSaversSection` with the eyebrow re-skinned to "TRENDING NOW".
- **Recommendation:** **STUBBED**. Reuse existing `SuperSaversSection` data with relabeled eyebrow. Add `isTrending` only when admin curation actually exists.

---

### Feature: Editorial home hero (replace banner-image carousel)

- **Description:** Replace `HeroCarousel` (raster banner images) with the Pencil editorial typography hero (eyebrow + 56/800 H1 + paragraph + 2 CTAs + 4 dot indicators + arrow controls on desktop). Either extend `promotional_banners` with editorial fields or hard-code the hero in code.
- **Questions it answers across gap analyses:**
  - (buyer-home, Q3, hero data source)
- **Cost to implement (rough):** MEDIUM.
- **If DEFERRED, what placeholder is needed?** Existing `HeroCarousel` retoken'd to use ink/paper colors but rendering banner images.
- **Recommendation:** **STUBBED**. Hard-code 1–4 hero slides in a constants file initially; defer the schema extension. The hero copy is editorial-marketing, not data-driven.

---

### Feature: Currency formatter (South-Asian grouping + lakh notation)

- **Description:** New `formatPrice` implementation using `Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })` for "Rs. X,XX,XXX" grouping. Optional compact mode ("Rs. 18.4 L" for KPI cards) using lakh/crore suffixes. Replace `amount.toLocaleString()` callers across cart, checkout, PDP, order pages, drawer stats, KPIs.
- **Questions it answers across gap analyses:**
  - (buyer-product, Q8, currency formatting)
  - (buyer-account-drawer, Q14, lakh notation)
  - (buyer-reorder, Q30, currency formatting)
  - (admin-banners, Q20, K/L/M/Cr abbreviation rules)
  - (admin-dashboard, Q-FMT-1, lakh/crore notation vs full grouping)
- **Cost to implement (rough):** SMALL-MEDIUM.
- **If DEFERRED, what placeholder is needed?** N/A — broken state (Western grouping) already in code.
- **Recommendation:** **IN_SCOPE**. Foundational fix; required by `02 §7 Q17` answer.

---

### Feature: i18n / language toggle plumbing (presentational EN-only)

- **Description:** Wire `LanguageToggle` primitive into a global state (cookie or zustand store) and surface in storefront util-strip, account drawer, mobile chrome, settings app bar, vendor pages. Per `02 §7 Q16` Urdu translation is out-of-scope — toggle persists value but does not actually translate.
- **Questions it answers across gap analyses:**
  - (buyer-home, Q1, util-strip mini toggle vs segmented LanguageToggle)
  - (buyer-account-drawer, Q5, lang toggle global state plumbing)
  - (buyer-orders, Q23, mobile language toggle)
  - (buyer-product, Q27, util-strip toggle)
- **Cost to implement (rough):** SMALL-MEDIUM.
- **If DEFERRED, what placeholder is needed?** Toggle renders inert (visual only) with no state plumbing; clicking does nothing.
- **Recommendation:** **STUBBED**. Add a cookie-backed value just to satisfy state across surfaces, even though there's no translation. Defer real i18n entirely.

---

### Feature: Free delivery threshold + same-day cutoff (business rule)

- **Description:** Add free-delivery rule: when `subtotal ≥ Rs. 50,000` zero out the delivery line and suppress the weight-gauge amber tip. "Same-day cutoff 4 PM" copy displayed but not enforced (or implies an order_cutoff config).
- **Questions it answers across gap analyses:**
  - (buyer-cart, Q10, free-delivery threshold static or live)
  - (buyer-home, Q5, promo strip — marketing copy or enforced)
- **Cost to implement (rough):** SMALL-MEDIUM.
- **If DEFERRED, what placeholder is needed?** Render the strip as static marketing copy; cart delivery line continues to use weight tier regardless.
- **Recommendation:** **STUBBED as marketing copy**. Cheap; defer the actual override logic until product validates the threshold makes sense.

---

### Feature: Reviews migration / deprecation

- **Description:** Existing `product_reviews` table + `POST /api/retailer/reviews` + `ReviewDrawer` component lose their UI entry point because `RetailerOrderDetail` becomes the Reorder screen. Either migrate the trigger to PDP ("review this product"), to a new "Past delivered orders" surface, or deprecate.
- **Questions it answers across gap analyses:**
  - (buyer-reorder, Q37, review feature deprecation/migration)
- **Cost to implement (rough):** MEDIUM (move the trigger; the drawer + endpoint exist).
- **If DEFERRED, what placeholder is needed?** Endpoint stays unwired from any UI. Reviews silently stop.
- **Recommendation:** **DEFERRED**. No design surface for reviews exists in the new pass; preserve the schema/endpoint and revisit. Don't delete the table.

---

### Feature: Admin "Catalog" sidebar grouping + Breadcrumb component

- **Description:** New shared `<Breadcrumb>` primitive (likely shadcn install). Admin sidebar grows a "Catalog" section grouping (Vendors / Categories / Banners / Products), reflected in breadcrumbs across admin screens.
- **Questions it answers across gap analyses:**
  - (admin-categories, Q2 / Q26, Catalog parent grouping)
  - (admin-banners, breadcrumb)
  - (admin-vendors, Q5, breadcrumb component)
  - (buyer-orders, breadcrumb)
  - (buyer-product, Q1, PDP breadcrumb)
  - (buyer-reorder, breadcrumb)
  - (buyer-settings, Q2, breadcrumb component)
- **Cost to implement (rough):** SMALL.
- **If DEFERRED, what placeholder is needed?** Hardcode breadcrumbs inline per screen; no shared primitive.
- **Recommendation:** **IN_SCOPE**. Cheap, used everywhere; install shadcn `breadcrumb` once, retoken, reuse.

---

### Feature: Vendor sidebar Orders count badge

- **Description:** Real-time `count(sub_orders WHERE vendorId AND status='pending')` rendered as an amber pill on the vendor sidebar Orders row + dashboard sidebar.
- **Questions it answers across gap analyses:**
  - (vendor-orders, Q2, pending-order badge data source)
  - (vendor-dashboard, sidebar badge)
- **Cost to implement (rough):** SMALL.
- **If DEFERRED, what placeholder is needed?** Badge hidden.
- **Recommendation:** **IN_SCOPE**. Single count, derivable from existing endpoint. Add to the sidebar pass.

---

### Feature: PDP spec section + delivery card

- **Description:** Two new PDP sections. **Spec section** lists product attributes (brand, vendor, packaging unit, etc.) — either fixed inline or a generic `product_attributes` table. **Delivery card** shows weight-gauge mini view (or generic "MNP delivery · 1–3 days" copy).
- **Questions it answers across gap analyses:**
  - (buyer-product, Q18 / Q19, delivery card + spec section)
- **Cost to implement (rough):** MEDIUM (depending on attribute model choice).
- **If DEFERRED, what placeholder is needed?** Sections hidden; PDP renders without them.
- **Recommendation:** **STUBBED**. Spec section as a fixed inline list (brand + vendor + weight + pack size — all from existing data once pack-pricing lands). Delivery card as static copy. Defer `product_attributes` table.

---

## SMALL features

### Feature: Category icons (Lucide map)

- **Description:** New `categories.iconKey text NULL` column + Lucide icon picker (admin) + storefront mobile category-tile rendering. Mapping: drinks→glass-water, snacks→cookie, etc.
- **Questions it answers across gap analyses:**
  - (buyer-home, Q9, category swatches + lucide icons)
  - (admin-categories, Q5, icon picker vs imageUrl)
- **Cost to implement (rough):** SMALL.
- **If DEFERRED, what placeholder is needed?** Storefront mobile tiles use first-letter fallback or empty swatch.
- **Recommendation:** **IN_SCOPE**. Single column + a curated lucide list; cheap upgrade.

---

### Feature: Footer marketing pages (Help, About, Terms, Privacy, Returns, FAQ, Delivery hubs, Careers)

- **Description:** Static marketing/CMS pages referenced by storefront footer link columns. None designed.
- **Questions it answers across gap analyses:**
  - (buyer-home, Q15, footer link routing)
  - (buyer-account-drawer, Help center / Terms & privacy nav rows)
- **Cost to implement (rough):** SMALL (per page) but content TBD.
- **If DEFERRED, what placeholder is needed?** Links route to a single `/coming-soon` placeholder route (or `#` no-op).
- **Recommendation:** **STUBBED**. Single placeholder page; defer content authoring.

---

### Feature: "How consolidation works" marketing page

- **Description:** Hero secondary CTA target. New static page.
- **Questions it answers across gap analyses:**
  - (buyer-home, hero CTA #2 destination)
- **Cost to implement (rough):** SMALL.
- **If DEFERRED, what placeholder is needed?** Hero secondary CTA hidden or routed to placeholder.
- **Recommendation:** **DROPPED**. Marketing nice-to-have; hide the CTA.

---

### Feature: "Deliver to {city}" delivery zone selector

- **Description:** Subnav cluster on storefront home + PDP that displays current delivery city/zip and (potentially) lets user switch. If interactive, affects shipping tiers, vendor availability, cutoff times.
- **Questions it answers across gap analyses:**
  - (buyer-home, Q2, "Deliver to {city/zip}" subnav cluster)
- **Cost to implement (rough):** SMALL if static, LARGE if interactive.
- **If DEFERRED, what placeholder is needed?** Render as a static, non-interactive label (read from default address).
- **Recommendation:** **STUBBED as static**. Render the user's default-address city if signed-in, else "Pakistan". Defer interactive switcher.

---

### Feature: Status display-label mapping table

- **Description:** Define the canonical mapping from `sub_orders.status` enum values (`pending/packed/handed_to_courier/delivered/cancelled`) and `orders.status` (`processing/partially_fulfilled/completed`) to Pencil display stamps (NEW / PACKED / AT MNP HUB / OUT FOR DELIVERY / DISPATCHED / DELIVERED / CANCELLED / PENDING). Per `02 §7 Q9` user already said display-only; the actual mapping isn't fully specified.
- **Questions it answers across gap analyses:**
  - (buyer-orders, Q2 / Q3 / Q5 / Q6 / Q13 / Q25, mapping rules + multi-suborder rollup)
  - (admin-dashboard, Q-OS-2, status stamp mapping)
  - (vendor-orders, Q4 / Q13, status taxonomy + segment counts)
  - (vendor-dashboard, KPI orders pill)
- **Cost to implement (rough):** SMALL (constants file + 1 helper).
- **If DEFERRED, what placeholder is needed?** N/A — required to ship any status pill.
- **Recommendation:** **IN_SCOPE**. Pure constants work; produces a single source of truth for stamp variants across screens.

---

### Feature: Support phone number (`0300-SHALMI`)

- **Description:** Either env var or `org_settings` table providing the support phone string used in vendor ledger policy block.
- **Questions it answers across gap analyses:**
  - (vendor-ledger, Q15, phone number source)
- **Cost to implement (rough):** SMALL.
- **If DEFERRED, what placeholder is needed?** Use a single hard-coded constant.
- **Recommendation:** **IN_SCOPE as constant**. Single string in a constants file.

---

### Feature: Active vs Draft product status (light version)

- **Description:** Add `products.status enum('active','draft') default 'active'`. Powers the Active/Draft segments + status pill on vendor product list. Stripped-down version of the full approval workflow above.
- **Questions it answers across gap analyses:**
  - (vendor-products, Q9 partial, status taxonomy)
- **Cost to implement (rough):** SMALL.
- **If DEFERRED, what placeholder is needed?** Stats segments hide DRAFTS count.
- **Recommendation:** **IN_SCOPE**. Cheap; gates vendor "Save as draft" UX.

---

### Feature: Admin "Catalog" / "Operations" sidebar grouping (constants change only)

- **Description:** Restructure `ADMIN_NAV_ITEMS` from flat to `{ section, items }[]` to render section eyebrows. No new routes; just nav data shape.
- **Questions it answers across gap analyses:**
  - (admin-dashboard, Q-SB-1)
- **Cost to implement (rough):** SMALL.
- **If DEFERRED, what placeholder is needed?** Single "Navigation" group continues.
- **Recommendation:** **IN_SCOPE**. Cosmetic but expected by every admin Pencil frame.

---

## Out-of-scope clarifications (explicit drops)

These came up across multiple gap analyses but were either explicitly dropped by the user or are clearly out-of-scope for this revamp; listing them here so they don't get re-litigated:

- **Notifications / bell icon** — `02 §7 Q19` user said ignore. **DROPPED**. Render the bell visually inert; no badge, no surface, no schema.
- **"More" tab in vendor mobile bottom bar** — `02 §7 Q19` user said ignore. **DROPPED**.
- **Full Urdu translation / i18n** — `02 §7 Q16` user said EN-only first. **DEFERRED**. Toggle stays presentational.
- **Dark mode** — `02 §7 Q5` user said delete the dark token block. **DROPPED**. Remove `.dark` from `globals.css` during retoken pass.
- **Two `green-2` / `green-600` aliasing question** — `02 §7 Q4` user said follow Pencil. **IN_SCOPE**. Token cleanup only.
- **Admin "Reviewed dispute" entries / disputes entity** — there is no disputes entity. The Pencil sample text in admin dashboard audit log is noise. **DROPPED**.
- **Wallet UI** — `01 §7 Q10` flagged the unused `wallet` table. No Pencil surface designed. **DROPPED**. Schema stays dormant.
- `**(auth)/sign-in` and `(auth)/sign-up` empty stubs** — `01 §7 Q1`. **DROPPED**. Delete during cleanup; phone+OTP at `/auth` stays canonical.

---

## Summary table (for the user's quick scan)


| Feature                                                                          | Cost           | Recommendation                                                       |
| -------------------------------------------------------------------------------- | -------------- | -------------------------------------------------------------------- |
| Banner performance analytics & revenue attribution                               | VERY_LARGE     | DEFERRED                                                             |
| Admin analytics dashboard (full)                                                 | VERY_LARGE     | IN_SCOPE                                                             |
| Pack-based pricing schema migration                                              | VERY_LARGE     | IN_SCOPE (already user-confirmed)                                    |
| Vendor weekly payouts (`payout_runs`)                                            | VERY_LARGE     | IN_SCOPE (already user-confirmed)                                    |
| Wishlist / Saved items                                                           | LARGE          | IN_SCOPE                                                             |
| Order tracking surface                                                           | LARGE          | IN_SCOPE                                                             |
| Vendor add-product approval workflow + autosave                                  | LARGE          | STUBBED                                                              |
| Categories rich model                                                            | LARGE          | IN_SCOPE (only iconKey + isActive)                                   |
| Admin Banners scheduling + status state machine                                  | LARGE          | IN_SCOPE (per user; minus position taxonomy beyond HERO)             |
| Banner audience targeting                                                        | LARGE          | DEFERRED                                                             |
| Reorder screen (interactive)                                                     | LARGE          | IN_SCOPE                                                             |
| Saved shopping lists                                                             | LARGE          | DROPPED                                                              |
| Admin audit log writers + viewer                                                 | LARGE          | STUBBED                                                              |
| Vendor sales analytics                                                           | LARGE          | IN_SCOPE                                                             |
| Vendor product enrichment fields                                                 | LARGE          | IN_SCOPE for all                                                     |
| Vendor third status (PENDING REVIEW)                                             | MEDIUM-LARGE   | DEFERRED                                                             |
| Vendor enrichment (logo, displayId, fullName, address, monthlyLimit, categories) | LARGE          | STUBBED (IN_SCOPE displayId+fullName+address+phone number+logo only) |
| Search route `/search`                                                           | LARGE          | IN_SCOPE                                                             |
| Account drawer (full)                                                            | LARGE          | IN_SCOPE shell + nav; STUBBED payment methods, notification          |
| Buyer profile stats endpoint                                                     | MEDIUM         | STUBBED                                                              |
| Vendor self-service bank-info edit                                               | MEDIUM-LARGE   | IN_SCOPE                                                             |
| Statement/CSV downloads                                                          | LARGE          | STUBBED                                                              |
| Bulk import (CSV)                                                                | LARGE          | IN_SCOPE                                                             |
| Admin Orders/Products/Sales Reports/Users screens                                | LARGE each     | IN_SCOPE all                                                         |
| Admin/Vendor chrome revamp                                                       | LARGE          | IN_SCOPE all                                                         |
| Weight gauge + delivery tier table                                               | MEDIUM         | IN_SCOPE                                                             |
| GST 18% on orders                                                                | MEDIUM         | STUBBED                                                              |
| Postal code + province on addresses                                              | MEDIUM         | IN_SCOPE                                                             |
| Buyer business name (`user.businessName`)                                        | SMALL-MEDIUM   | IN_SCOPE                                                             |
| Settings shell + sub-page routing                                                | MEDIUM         | IN_SCOPE (already user-confirmed)                                    |
| Payment methods feature                                                          | MEDIUM         | STUBBED                                                              |
| Hot products / trending metric                                                   | MEDIUM         | STUBBED                                                              |
| Editorial home hero                                                              | MEDIUM         | IN_SCOPE                                                             |
| Currency formatter (South-Asian + lakh)                                          | SMALL-MEDIUM   | IN_SCOPE                                                             |
| i18n / language toggle plumbing                                                  | SMALL-MEDIUM   | STUBBED                                                              |
| Free delivery threshold + cutoff                                                 | SMALL-MEDIUM   | STUBBED                                                              |
| Reviews migration/deprecation                                                    | MEDIUM         | DEFERRED                                                             |
| Admin Catalog sidebar + Breadcrumb component                                     | SMALL          | IN_SCOPE                                                             |
| Vendor sidebar Orders count badge                                                | SMALL          | IN_SCOPE                                                             |
| PDP spec section + delivery card                                                 | MEDIUM         | IN_SCOPE                                                             |
| Category icons (Lucide map)                                                      | SMALL          | IN_SCOPE                                                             |
| Footer marketing pages                                                           | SMALL          | STUBBED (single /coming-soon)                                        |
| "How consolidation works" page                                                   | SMALL          | STUBBED                                                              |
| "Deliver to {city}" zone selector                                                | SMALL or LARGE | STUBBED as static                                                    |
| Status display-label mapping table                                               | SMALL          | IN_SCOPE                                                             |
| Support phone constant                                                           | SMALL          | IN_SCOPE                                                             |
| Active vs Draft product status (light)                                           | SMALL          | IN_SCOPE                                                             |
| Admin sectioned sidebar (constants)                                              | SMALL          | IN_SCOPE                                                             |


---

(End of Phase 0.7 scope cut. User to override recommendations as needed.)