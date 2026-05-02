# Phase 5 Batch Plan

> **Phase:** Pre-implementation execution order (read-only synthesis).
> **Date produced:** 2026-05-02
> **Inputs:** `01-codebase-map.md`, `02-design-inventory.md`, `04-design-system-implementation-log.md`, `06-scope-cut.md`, `07-default-proposals.md`, every `screens/*/gap-analysis.md`.
> **Output rule:** every in-scope screen lands in exactly one batch; runner executes one batch per night.

## Summary

- Total screens in scope: **16** (5A REVAMP: 12 · 5B NEW: 4)
- Total batches: **6**
- Estimated nights to complete: **6** (one batch per night)
- Cross-cutting foundations (chrome retoken, breadcrumb component, currency formatter, status-display map, weight gauge constants, GST constant) land **inside the first batch that needs them**, not as a separate "Batch 0". The rationale: per `04-design-system-implementation-log.md` the design system / atom layer is already shipped, so each screen's batch will pull in any small shared helper it needs (formatter, mapping table) on first touch.

## Excluded screens

No screen-level DEFERRED / DROPPED entries in `06-scope-cut.md`. Every gap-analysis file is in scope; the cuts in scope-cut are sub-features within screens (e.g. banner audience targeting, banner perf attribution, vendor PENDING REVIEW status) that the gap-analyses already mark as DEFERRED / STUBBED in their answers. No screens are excluded here.

The following Pencil frames from `02-design-inventory.md` are **not part of Phase 5** because they were never in scope:

- `F4eQQ` Desktop Home (v1) — reference mockup only (`02 §7 Q15`).
- `XaQ7g` Mobile Home (v1) — reference mockup only.
- `a2HFrA` Design System — internal showcase; tokens already migrated in Phase 3.

## Scoring methodology

Per-screen complexity profile (computed against gap-analyses and scope-cut answers; **APPROVED** schema/api items only — DEFERRED / STUBBED items don't count toward `schema_changes` or `api_changes`).

Risk formula: `schema_changes×3 + api_changes×2 + cross_screen_deps×3 + (HIGH=5/MED=2/LOW=0) + (NEW=3/REVAMP=0) + answer_count÷5`

Final ranked table (kept here so future batches can be re-scored without re-reading every gap analysis):


| Slug                   | Kind   | Feature area        | answer_count | schema                                                               | api                                         | molecules | cross-deps | interaction | risk   |
| ---------------------- | ------ | ------------------- | ------------ | -------------------------------------------------------------------- | ------------------------------------------- | --------- | ---------- | ----------- | ------ |
| `buyer-orders`         | REVAMP | storefront-account  | 19           | 0                                                                    | 0                                           | 4         | 2          | LOW         | **10** |
| `vendor-orders`        | REVAMP | vendor              | 15           | 0                                                                    | 0                                           | 4         | 2          | MED         | **11** |
| `buyer-home`           | REVAMP | storefront-home     | 15           | 1 (iconKey+isActive)                                                 | 0                                           | 5         | 4          | LOW         | **15** |
| `buyer-cart`           | REVAMP | storefront-purchase | 27           | 0 (consumer)                                                         | 0                                           | 4         | 3          | MED         | **16** |
| `buyer-settings`       | NEW    | storefront-account  | 33           | 1 (postal+province)                                                  | 1 (settings shell)                          | 3         | 2          | LOW         | **19** |
| `admin-categories`     | REVAMP | admin               | 26           | 1 (iconKey UI)                                                       | 1 (admin GET pagination)                    | 5         | 2          | MED         | **21** |
| `buyer-checkout`       | REVAMP | storefront-purchase | 16           | 1 (taxCents)                                                         | 1 (checkout update)                         | 5         | 3          | HIGH        | **22** |
| `admin-vendors`        | REVAMP | admin               | 33           | 2 (displayId+fullName+address+email)                                 | 1 (admin filter/sort)                       | 5         | 2          | MED         | **23** |
| `admin-banners`        | REVAMP | admin               | 20           | 3 (startsAt+endsAt+status+pos+eyebrow+ctaLabel+internalName)         | 2 (PATCH + storefront feed update)          | 4         | 2          | MED         | **25** |
| `buyer-product`        | REVAMP | storefront-purchase | 29           | 1 (pack-pricing migration — owner)                                   | 0                                           | 6         | 5          | MED         | **26** |
| `vendor-dashboard`     | REVAMP | vendor              | 26           | 2 (payout_runs — owner; lowStockThreshold)                           | 3 (recent orders + low-stock + payout tile) | 6         | 3          | MED         | **26** |
| `buyer-reorder`        | NEW    | storefront-account  | 44           | 0 (consumer)                                                         | 1 (cart-store push)                         | 5         | 3          | HIGH        | **26** |
| `admin-dashboard`      | REVAMP | admin               | 41           | 1 (vendors.deactivatedAt)                                            | 1 (recent orders read)                      | 6         | 4          | MED         | **27** |
| `buyer-account-drawer` | NEW    | storefront-chrome   | 34           | 1 (businessName)                                                     | 1 (profile-stats)                           | 5         | 4          | MED         | **29** |
| `vendor-ledger`        | NEW    | vendor              | 27           | 1 (payout_runs UI consumer)                                          | 2 (cycle-roll + ledger reads)               | 4         | 2          | MED         | **29** |
| `vendor-products`      | REVAMP | vendor              | 24           | 3 (pack-pricing creator + SKU+brand+lowStockThreshold + status enum) | 2 (search + draft)                          | 6         | 3          | HIGH        | **32** |


(Risk numbers above are estimates rounded for batch-rubric purposes; do not treat as canonical.)

---

## Batch 1 — Validation (mixed surfaces, low risk)

- **Phase:** 5A
- **Why this batch:** lowest-risk REVAMP screens across three different surfaces (storefront-account, vendor-ops, storefront-home). The point is to pressure-test `BATCH_RUNNER.md` itself on cheap, isolated screens before stakes rise. If anything is wrong with the runner workflow (gap-analysis → implementation → review hand-off), it surfaces here without burning the harder work.
- **Screens (in order):**
  1. `buyer-orders` — risk: 10, kind: REVAMP. Order history list at `/profile/orders`; per-card stamps + filter chips, no schema migration, no new API.
  2. `vendor-orders` — risk: 11, kind: REVAMP. Vendor sub-orders list with status segments + giant "Packed ✓" CTA; consumes existing `PATCH /api/vendor/orders/[subOrderId]`.
  3. `buyer-home` — risk: 15, kind: REVAMP. Storefront home with editorial hero + categories grid + best-prices + hot products + promo strip. **Lands `categories.iconKey + isActive` schema migration** because it's the first screen to consume those columns (mobile category tile icons).
- **Predecessors required:** none.
- **Watch-outs:**
  - This is the first batch — runner should produce its own retro at the end before batch 2 starts. If any batch-runner mechanic feels wrong, fix BATCH_RUNNER.md before batch 2 (do not improvise).
  - `buyer-orders` per-card "View details" CTA routes to existing `/profile/orders/[id]` (`RetailerOrderDetail` parcel-boxes UI). The new "Reorder" per-card CTA introduced in Batch 5 will point at the new `/profile/orders/[id]/reorder` route — Batch 1 does NOT add that CTA (no Reorder screen exists yet). When the order-tracking design lands, tracking renders as a component inside `/profile/orders/[id]` (per user direction Q4 below).
  - `buyer-home` lands the `categories.iconKey + isActive` migration. Admin-categories in Batch 2 will inherit those columns and only add the picker UI — confirm migration is additive (NULLable) before Batch 2 starts.
  - Storefront category tiles fall back to existing `imageUrl` when `iconKey IS NULL` (every existing row will be NULL until admins backfill via Batch 2). This is a deliberate placeholder — no Batch 2 dependency on backfill data.
  - `buyer-home` introduces the **status-display-label mapping table** + **currency formatter (South-Asian grouping + lakh notation, STUBBED)** as small shared modules; downstream batches consume them.
  - Editorial hero is hard-coded slides (per scope-cut "Editorial home hero" recommendation); `promotional_banners` schema does **not** change here. Banner schema work waits for Batch 2.
  - `vendor-orders` and `buyer-orders` both consume the new status-mapping table — verify the helper produced by `buyer-home` is general (not buyer-only) before they import it.

## Batch 2 — Admin (catalog, vendors, banners, dashboard)

- **Phase:** 5A
- **Why this batch:** all four admin screens share the same chrome (ink top bar + sectioned sidebar + breadcrumb component + admin avatar dropdown) and the same data-display patterns (KPI row + filters card + edit panel + stamp variants). Landing them together amortises the chrome retoken (`Q-CHROME-1` / `Q-SB-1..8` from admin-dashboard gap analysis) and lets the same paginated-list-with-edit-panel pattern be tested on three screens before the dashboard's 6-widget composition lands at the end.
- **Screens (in order):**
  1. `admin-categories` — risk: 21, kind: REVAMP. Inline split-pane edit panel + icon picker (consumes `iconKey` from Batch 1). Lands `GET /api/admin/categories` (paginated, mirrors existing admin/vendors). Bulk-select / reorder / export are DEFERRED per scope-cut; UI hides those affordances.
  2. `admin-vendors` — risk: 23, kind: REVAMP. Persistent right-side edit panel, `nuqs`-driven `?vendorId=`. **Lands `vendors.displayId + fullName + address + logoUrl` schema additions** (STUBBED slice of vendor-enrichment scope-cut feature). Bank details stay in panel ("Bank" sub-section, not drawn) because vendor payouts depend on them.
  3. `admin-banners` — risk: 25, kind: REVAMP. **Lands `promotional_banners` scheduling + status state machine + position enum + eyebrow / ctaLabel / internalName** (per scope-cut user-confirmed). Storefront `getCachedBanners()` filter must be updated to `status='live' AND now BETWEEN startsAt AND endsAt`; verify Batch 1 home hero is hard-coded (it is) so storefront feed change doesn't blank the home page.
  4. `admin-dashboard` — risk: 27, kind: REVAMP. Last in batch; depends on admin chrome from earlier screens, the audit-log writers wired into vendor activate/deactivate (added under `admin-vendors` per scope-cut audit STUBBED feature), and the recent-orders mapping from `buyer-orders` (Batch 1). KPI deltas / Sales-by-vendor / Top sellers / "+ New report" CTA all DEFERRED per scope-cut — UI ships shell only.
- **Predecessors required:**
  - Status-display-label mapping (from Batch 1, used in admin-dashboard recent-orders table + admin-vendors stamp).
  - Currency formatter STUBBED (from Batch 1, used in admin-dashboard KPI hero + every Rs. value).
  - `categories.iconKey + isActive` schema (from Batch 1, used in admin-categories edit panel).
- **Watch-outs:**
  - Admin chrome lands as a foundation pass at the start of `admin-categories` (per scope-cut "Admin/Vendor chrome revamp" IN_SCOPE for visual retoken). All four admin screens render against the new shell.
  - Bell icon and global admin search are DEFERRED per scope-cut (`02 §7 Q19` and `Search route /search` STUBBED). Render bell visually inert; search input renders, no-op on submit until the search milestone.
  - Per-vendor logo upload: `logoUrl` is nullable; render initials avatar fallback. Image upload pattern reuses `/api/admin/upload/promo-assets` family.
  - The new `PATCH /api/admin/banners/[id]` replaces the existing bulk-PUT model; the `BannerDialog` modal becomes redundant. Confirm bulk-PUT is removed AFTER the per-banner edit lands and is verified — don't delete prematurely.
  - `admin-dashboard` is the heaviest screen of this batch (answer_count 41, six widgets). It's last for two reasons: (a) consumes the admin chrome the earlier three established; (b) its widgets are mostly STUBBED placeholders so a partial fail still ships a believable shell.
  - Audit log writers must be wired into vendor activate/deactivate during `admin-vendors` (per scope-cut "Admin audit log" STUBBED) so the dashboard feed has real entries by the time `admin-dashboard` lands.
  - Sentence-case button labels ("Add vendor", "Add banner") become the convention this batch — confirm with global label sweep before merging.

## Batch 3 — Storefront purchase flow (PDP → cart → checkout)

- **Phase:** 5A
- **Why this batch:** the buy-flow is one mental model — PDP renders pack pricing, cart consumes the per-pack rows + computes weight tier + GST, checkout snapshots into the order. Implementing them together means the pack-pricing migration, the weight-gauge constants, the GST constant, and the cart-store persist-key migration all land in a single coherent batch with one schema decision instead of three.
- **Screens (in order — by cross-screen dep, not strict risk-ascending):**
  1. `buyer-product` — risk: 26, kind: REVAMP. **Lands the pack-pricing schema migration** (replaces tier-band model with `products.packSize / packMrpCents / packWholesalePriceCents / unitWeightGrams + product_pack_tiers (productId, packQty, pricePerPackCents, badge?, isDefault?)` per scope-cut user-confirmed). Bundle picker, qty stepper, MRP+save pill, spec section, delivery card.
  2. `buyer-cart` — risk: 16, kind: REVAMP. Consumes pack pricing on cart line rows ("Pack of N" eyebrow + per-pack price). **Lands the weight-gauge + delivery-tier constants module** (consumed by reorder + checkout receipt label).
  3. `buyer-checkout` — risk: 22, kind: REVAMP. **Lands `orders.taxCents` + GST 18% computation** (per scope-cut MEDIUM IN_SCOPE), step indicator, payment selector (3 cards drawn, only COD enabled per scope-cut Payment-methods DEFERRED), order_items snapshot of pack pricing.
- **Predecessors required:**
  - Currency formatter (from Batch 1).
  - Status-display-label mapping (from Batch 1; checkout success page reuses it).
  - None of the admin/vendor work blocks this batch — the cart-store and checkout are buyer-only.
- **Watch-outs:**
  - **Pack-pricing migration is the single largest schema change in the revamp** (per scope-cut "VERY_LARGE"). Cart-store persist key shape changes — bump `cart-store` `version` so existing localStorage payloads are migrated/cleared, not silently corrupted.
  - Order step in batch matters: PDP must land first because it owns the schema; if PDP fails, runner stops before cart/checkout touch the new columns.
  - This batch breaks **rule 4** (within-batch ascending risk) intentionally — buyer-cart at risk 16 sits in the middle. Cross-screen-dep rule (rule 8) overrides because the schema must be created by PDP before cart can read it.
  - GST + delivery tier are constants modules per scope-cut, not DB tables. Promote to DB only if admin-editable becomes a need.
  - "How consolidation works" hero CTA is DROPPED per scope-cut — hide the CTA; do not route to placeholder.
  - Wishlist heart icon is DEFERRED per scope-cut — drop the affordance from PDP `prod1` cards; do not implement no-op.
  - Reviews migration is DEFERRED per scope-cut — `ReviewDrawer` stays unwired in this batch (its UI entry on order-detail goes away in Batch 5 when reorder ships).

## Batch 4 — Vendor surfaces (high-risk pair)

- **Phase:** 5A
- **Why this batch:** highest-risk 5A screens (vendor-products risk 32, vendor-dashboard risk 26). Both share vendor chrome + `payout_runs` schema + low-stock derivation. Capped at 2 because vendor-products has HIGH interaction complexity (collapsed list+form, pack-pricing creator side, autosave-deferred behaviour) and a bug there is operationally expensive (vendors can't list products).
- **Screens (in order):**
  1. `vendor-dashboard` — risk: 26, kind: REVAMP. **Lands `payout_runs` table** (per scope-cut user-confirmed: weekStart/weekEnd, paidOn, txnId, completedOrdersCount, gross/returns/MNP/net amounts, status enum) + Friday cycle-roll job stub. Also lands `vendors.deactivatedAt nullable` for KPI 4 of admin dashboard (back-filled from existing data). Sales chart / top sellers / KPI deltas STUBBED per scope-cut.
  2. `vendor-products` — risk: 32, kind: REVAMP. Highest 5A risk. Collapsed single-page list+form (per `02 §7 Q11` user-confirmed). **Lands SKU + brand + lowStockThreshold + active/draft `products.status` enum** (per scope-cut Vendor-product-enrichment IN_SCOPE for SKU+brand+low-stock; full approval workflow STUBBED to draft|active only). Consumes pack-pricing schema from Batch 3 — add-product form writes pack tiers via the new endpoint.
- **Predecessors required:**
  - Pack-pricing schema from Batch 3 (vendor-products add-product form writes to `product_pack_tiers`).
  - Status-display-label mapping (from Batch 1, vendor-orders status segments — reused on dashboard's order pill).
  - Currency formatter (from Batch 1, payout amounts + KPI hero).
- **Watch-outs:**
  - `vendor-products` is the **highest-risk 5A screen** (32). Its watchpoints: (a) the collapse from 3 routes to 1 means existing `/vendor/products/new` and `/vendor/products/[id]/edit` must redirect or be removed cleanly; (b) the inline form's empty state vs edit state branching is new (per `02 §7 Q11` empty-state-on-add, prefilled-on-select); (c) PENDING_REVIEW approval flow is STUBBED — `Save as draft` + `Save product` (no `Submit for approval`) only.
  - `payout_runs` schema migration is large but additive. The 7-day return window business rule (per scope-cut user-confirmed) ships as `eligibleForPayoutAt = handedAt + 7d`, derived not stored, until the schema migration can be additive later.
  - Bank-info edit (Vendor-self-service) is DEFERRED per scope-cut — pencil icon on bank card hidden in this batch. Admin retains the only path.
  - Vendor mobile bottom tab bar is DEFERRED per scope-cut chrome revamp — keep existing collapsible sidebar on mobile in this batch.
  - Vendor sidebar Orders count badge IN_SCOPE — wire it during this batch (single COUNT, derivable from existing `useVendorOrdersQuery`).
  - This is the **final 5A batch**. Per rule 6, capped at 2 screens. If `vendor-products` fails, runner stops; `vendor-dashboard` is shipped because it ran first.

## Batch 5 — Buyer NEW (settings + reorder)

- **Phase:** 5B
- **Why this batch:** lower-risk pair of 5B screens, both buyer-account scoped. `buyer-settings` is mostly a routing shell + sub-page move (existing `/profile/addresses` → `/profile/settings/addresses`). `buyer-reorder` is the heaviest 5B-buyer screen but most of its risk lives in interaction logic (live recompute, edit qty, add-to-cart push) rather than new schema.
- **Screens (in order — risk ascending):**
  1. `buyer-settings` — risk: 19, kind: NEW. New `/profile/settings` route + parent layout (sidebar nav card desktop / stacked index mobile). Existing addresses page moves to `/profile/settings/addresses`; `/profile/addresses` redirects. **Lands `addresses.postalCode + province` schema additions** (per scope-cut Postal-code IN_SCOPE) and `**user.businessName` nullable column** (per scope-cut Buyer-business-name IN_SCOPE). Profile / Payment methods / Notifications / Preferences sub-pages render disabled with "Coming soon" labels per `02 §7 Q2`.
  2. `buyer-reorder` — risk: 26, kind: NEW. New route **`/profile/orders/[id]/reorder`** (per Q4 resolution below — does NOT displace `RetailerOrderDetail` at `/profile/orders/[id]`). Edit quantities + selection + remove on a snapshot of past order; live recompute weight gauge, GST, totals; "Add N items to cart" pushes selected rows into `cart-store`. **No new schema** — reads from existing `orders + sub_orders + order_items` and writes through the cart-store push API. "Save as new list" CTA is DROPPED per scope-cut. `buyer-orders` per-card "Reorder" CTA wires to this new sub-route (added during this batch alongside the screen).
- **Predecessors required:**
  - Pack-pricing schema (from Batch 3) — reorder displays "Pack of N" + per-unit copy.
  - Weight-gauge + delivery-tier constants (from Batch 3).
  - GST constant (from Batch 3).
  - Currency formatter (from Batch 1).
  - Status-display-label mapping (from Batch 1).
- **Watch-outs:**
  - **Reorder ships at `/profile/orders/[id]/reorder` (new sub-route).** `/profile/orders/[id]` continues to render `RetailerOrderDetail` (parcel boxes + ReceiptCard + ReviewDrawer) untouched. When the order-tracking design eventually lands, tracking renders as a component inside that existing detail page (per Q4 resolution).
  - Because `RetailerOrderDetail` survives, `ReviewDrawer` keeps its UI entry point — no review-feature regression in this batch. Scope-cut "Reviews migration / deprecation" DEFERRED stays purely a future concern.
  - Settings shell is mostly chrome — but the redirect from `/profile/addresses` → `/profile/settings/addresses` must keep deep-links / breadcrumbs / cached-query-keys consistent. Re-export the existing `UserAddresses` component into the new route file rather than copy-pasting.
  - `buyer-reorder` is the **first 5B screen with HIGH interaction complexity** (live recompute + add-to-cart push + comparison panel). Comparison panel is a v1 polish item per scope-cut — ship the recompute first.
  - `user.businessName` is consumed by Batch 6's account drawer; landing it here is intentional so drawer has real data to render.

## Batch 6 — Drawer + Ledger (high-risk 5B finale)

- **Phase:** 5B
- **Why this batch:** the two heaviest 5B screens. They are different feature areas (storefront-chrome + vendor) but neither pairs naturally with the lower-risk 5B above, and both consume schema landed in earlier batches (drawer ↔ businessName from Batch 5; ledger ↔ payout_runs from Batch 4). Capped at 2 per rule 7.
- **Screens (in order — risk ascending; both ≈29 — order chosen by feature ergonomics, drawer first because it's chrome-touching):**
  1. `buyer-account-drawer` — risk: 29, kind: NEW. Sheet-based right-side overlay (480w desktop, full-screen mobile) replacing `StorefrontHeader` `DropdownMenu` (per `02 §7 Q3`). **Lands `GET /api/user/profile-stats` endpoint** (STUBBED slice — ordersCount + activeAddressesCount + defaultAddressTitle only; totalSpent / totalSaved / inTransitCount / savedItemsCount DEFERRED until their underlying features land per scope-cut). Stat grid, 9 nav rows, language toggle, logout, version string. Wishlist row + Payment methods row hidden per scope-cut.
  2. `vendor-ledger` — risk: 29, kind: NEW. New `/vendor/ledger` route. **Consumes `payout_runs` schema from Batch 4** (no new schema this batch). Friday countdown card + breakdown card + bank-info card + history card. Statement-download CTA hidden per scope-cut DROPPED. Bank-info edit pencil icon hidden per scope-cut DEFERRED.
- **Predecessors required:**
  - `user.businessName` (from Batch 5) — drawer identity card line.
  - `payout_runs` schema (from Batch 4) — ledger entire screen.
  - Status-display-label mapping (from Batch 1) — drawer "Track order" subtitle.
  - Currency formatter (from Batch 1) — drawer stat grid + ledger amounts.
  - Pack-pricing + GST + weight-gauge (from Batch 3) — only indirectly (drawer Saved-items DEFERRED; reorder-from-orders nav row routes to Batch 5 surface).
- **Watch-outs:**
  - **Account drawer is chrome work** — it touches every storefront page header. The existing `DropdownMenu` in `StorefrontHeader` gets replaced by a Sheet trigger. Verify all storefront screens (Batches 1, 3) still render correctly with the new chrome — there's no responsive breakpoint regression.
  - On mobile, the sheet is an overlay over the current page (per `02 §7 Q3`) — confirm scroll lock + escape behaviour. The existing storefront layout has `dynamic = 'force-dynamic'` so SSR is fine.
  - `/profile` (which has no page today) becomes the drawer trigger surface (per `02 §7 Q3`). Add a server component at `app/(storefront)/profile/page.tsx` that opens the drawer; or wire the drawer to read `?account=open` and have `/profile` redirect there. Either works — pick one and document.
  - Vendor ledger's 7-day return window business rule must use `eligibleForPayoutAt = handedAt + 7d` (derived) — per Batch 4 watchpoint. Cycle-roll job lives in Batch 4; this batch only renders the cycle output.
  - "Saved" stat in drawer renders "—" per scope-cut Buyer-profile-stats STUBBED. Don't wire `totalSaved` calculation — wait for wishlist feature in a later milestone.
  - This is the final 5B batch — no further batches consume any schema landed here. Verify `payout_runs` cycle-roll behaviour end-to-end before sign-off; this is the riskiest fund-flow path in the revamp.

---

## Cross-cutting dependencies graph

Schema migrations and shared modules: which batch introduces them, which batches consume.


| Artifact                                                                        | Owner batch                                                                       | Consumer batches                                                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `categories.iconKey` + `categories.isActive`                                    | **Batch 1** (buyer-home)                                                          | Batch 2 (admin-categories picker UI + filter pills)                                                                                                                                                                                                        |
| Status-display-label mapping (constants module)                                 | **Batch 1** (shared by buyer-orders + vendor-orders)                              | Batches 2, 3, 4, 5, 6 (every status pill)                                                                                                                                                                                                                  |
| Currency formatter (`formatPrice` South-Asian + lakh notation, STUBBED)         | **Batch 1** (buyer-home)                                                          | Batches 2, 3, 4, 5, 6 (every Rs. value)                                                                                                                                                                                                                    |
| Admin chrome (ink top bar + sectioned sidebar + breadcrumb component)           | **Batch 2** (admin-categories)                                                    | Batches 2 (rest), 5 (settings shell breadcrumb), 6                                                                                                                                                                                                         |
| Audit-log writers (vendor activate/deactivate, banner publish, category delete) | **Batch 2** (admin-vendors during, admin-banners during, admin-categories during) | Batch 2 (admin-dashboard feed)                                                                                                                                                                                                                             |
| `vendors.displayId / fullName / address / logoUrl`                              | **Batch 2** (admin-vendors)                                                       | Batch 4 (vendor-dashboard payout block + chrome avatar)                                                                                                                                                                                                    |
| `promotional_banners` scheduling + status state machine + position enum         | **Batch 2** (admin-banners)                                                       | Batch 1 retroactively if storefront feed change is staged: home hero is hard-coded so no breaking dep, but the public `GET /api/banners` filter contract changes — verify storefront banner consumption (currently hero only, hard-coded after Batch 1)    |
| Pack-pricing schema migration (`products.packSize` + `product_pack_tiers`)      | **Batch 3** (buyer-product)                                                       | Batch 3 (cart, checkout), Batch 4 (vendor-products add-product form), Batch 5 (buyer-reorder)                                                                                                                                                              |
| Weight-gauge + delivery-tier constants module                                   | **Batch 3** (buyer-cart)                                                          | Batch 3 (checkout receipt label), Batch 5 (reorder)                                                                                                                                                                                                        |
| `orders.taxCents` + GST constant                                                | **Batch 3** (buyer-checkout)                                                      | Batch 5 (reorder receipt totals)                                                                                                                                                                                                                           |
| Cart-store persist key migration                                                | **Batch 3** (buyer-cart)                                                          | Batch 5 (reorder add-to-cart push API)                                                                                                                                                                                                                     |
| `payout_runs` table + Friday cycle-roll job                                     | **Batch 4** (vendor-dashboard)                                                    | Batch 6 (vendor-ledger entire screen)                                                                                                                                                                                                                      |
| `vendors.deactivatedAt`                                                         | **Batch 4** (vendor-dashboard)                                                    | Batch 2 retroactively if admin-dashboard KPI 4 needs it — current plan has admin-dashboard land in Batch 2 BEFORE this column exists. **See Open ordering question 1.**                                                                                    |
| `products.sku + brand + lowStockThreshold + status enum`                        | **Batch 4** (vendor-products)                                                     | None within Phase 5 (vendor-dashboard low-stock card uses constant threshold per scope-cut placeholder).                                                                                                                                                   |
| `addresses.postalCode + province`                                               | **Batch 5** (buyer-settings)                                                      | Batch 6 (drawer "default Shop" subtitle), Batch 1 retroactively if buyer-orders meta line needs it — buyer-orders gap-analysis answer Q13 says "drop postal code from order meta line if address schema doesn't ship". **No retroactive change required.** |
| `user.businessName`                                                             | **Batch 5** (buyer-settings)                                                      | Batch 6 (drawer identity card), Batch 2 retroactively (admin-dashboard recent-orders + admin-vendors customer cell) — admin-dashboard recent-orders renders user.name only until Batch 5 ships. **Confirmed acceptable gap.**                              |
| `GET /api/user/profile-stats` (STUBBED)                                         | **Batch 6** (account-drawer)                                                      | None within Phase 5                                                                                                                                                                                                                                        |


**What breaks if a batch fails:**

- **Batch 1 fails** → all subsequent batches blocked (status mapping + currency formatter are universal predecessors).
- **Batch 2 fails** → Batches 3-6 are technically unblocked (no schema dep), but admin chrome retoken is incomplete; admin screens stay on legacy shell. Vendor-dashboard chrome (Batch 4) shares the topbar pattern — if admin-vendors topbar fails, vendor-dashboard topbar is at risk too.
- **Batch 3 fails** → Batches 4 and 5 blocked. Vendor-products (Batch 4) cannot ship its add-product form without pack-pricing schema; reorder (Batch 5) cannot render line items without pack-pricing display.
- **Batch 4 fails** → Batch 6 ledger blocked (`payout_runs` not landed). Drawer (Batch 6) is unaffected.
- **Batch 5 fails** → Batch 6 drawer ships with "—" for Saved-items + no businessName line; identity card degrades gracefully.
- **Batch 6 fails** → revamp ships without the new account-drawer chrome (storefront keeps existing DropdownMenu) and without the vendor ledger surface. Both are recoverable as a follow-up batch — neither blocks anything else in Phase 5.

---

## Open ordering questions — resolved

All five ordering questions were answered by the user on 2026-05-02. Outcomes captured below; plan above has been updated where the answers diverged from the original draft.

1. **`admin-dashboard` KPI 4 vs `vendors.deactivatedAt` timing.** **Resolved → option (b):** ship admin-dashboard KPI 4 with `—` placeholder in Batch 2; column lands in Batch 4 (`vendor-dashboard`); KPI delta becomes a one-line follow-up patch when the column exists. Plan unchanged.
2. **Pack-pricing schema in Batch 3 vs `vendor-products` in Batch 4.** **Resolved → option (a):** schema lands in Batch 3 (PDP), creator UI in Batch 4. Plan unchanged.
3. **Account drawer chrome lands in Batch 6, not earlier.** **Resolved → option (a):** 5A storefront screens use existing `DropdownMenu`; Batch 6 swaps the trigger in `StorefrontHeader`. Plan unchanged.
4. **Reorder route conflict with `RetailerOrderDetail`.** **Resolved → option (b):** `buyer-reorder` ships at the new sub-route `/profile/orders/[id]/reorder`; `/profile/orders/[id]` continues to render `RetailerOrderDetail` untouched. When the order-tracking design eventually lands, tracking will render as a component inside that existing detail page. Plan **updated**: Batch 5 reorder description, Batch 5 watchout about `RetailerOrderDetail` displacement, Batch 1 watchout about `buyer-orders` "View details" CTA, and the dependency notes on `ReviewDrawer` (no longer at risk because `RetailerOrderDetail` survives).
5. **Admin dashboard size vs Batch 2's 4-screen footprint.** **Resolved → option (a):** keep Batch 2 at 4 screens with admin-dashboard last. Plan unchanged.

(End of Phase 5 Batch Plan. Stopping per workflow — implementation begins inside Batch 1 only after this plan is signed off.)