# Phase 0.8 — Default Proposals

> **Phase:** Pre-implementation question resolution (read-only synthesis).
> **Date produced:** 2026-05-02
> **Inputs:** every `.claude-revamp/screens/*/gap-analysis.md`, plus `01-codebase-map.md`, `02-design-inventory.md`, and `06-scope-cut.md` (with user overrides).
> **Method:** for each numbered open question across every gap-analysis file, classify as `RESOLVED_BY_SCOPE` / `RESOLVED_BY_STUB` / `DEFAULT_PROPOSED` / `NEEDS_USER` per the Phase 0.8 rubric.

## Summary counts

`RESOLVED_BY_SCOPE`: 51 | `RESOLVED_BY_STUB`: 56 | `DEFAULT_PROPOSED`: 305 | `NEEDS_USER`: 20

Where DEFAULT_PROPOSED, the answer is one of the gap-analysis's own listed plausible answers, picked for: smallest delta from existing code, mirroring an existing codebase pattern, no unnecessary new schema/API concepts, production-realistic for an early-stage e-commerce app.

---

## `DEFAULT_PROPOSED:`Approved as proposed unless marked OVERRIDE

## admin-banners

- **Q1 — Mobile edit affordance.** `DEFAULT_PROPOSED (a)` Mobile is read-only — footer hint reads "Edit banners from desktop"; per-card pencil/trash icons omitted on mobile. Smallest delta — no extra mobile route.
- **Q2 — Image fills on banner cards.** `DEFAULT_PROPOSED (a)` Placeholder only — the real card renders the uploaded `imageUrl`; eyebrow/title overlay sits on top.
- **Q3 — Per-banner copy fields.** `DEFAULT_PROPOSED (a)` Four new fields: `eyebrow`, `internalName`, `ctaLabel`, plus existing `title` repurposed as the public hero title. Cleanest schema; matches Pencil literally.
- **Q4 — Position taxonomy.** `RESOLVED_BY_SCOPE` Banner positions beyond HERO are explicitly DEFERRED in scope-cut. Add a `position` column with enum but ship only HERO storefront slot.
- **Q5 — Reorder / displayOrder.** `DEFAULT_PROPOSED (b)` Keep `displayOrder` per `position` but expose through a numeric "Sort order" input in the edit panel. Preserves existing storefront contract; drops only the dnd-kit UI.
- **Q6 — Status state machine.** `DEFAULT_PROPOSED (a)` Manual flag `live | paused`; derived label is `live | scheduled | paused | expired` from `(status, startsAt, endsAt, now)`. Two SCHEDULED stamp colors collapse to one. Matches Pencil-confirmed feature in scope-cut.
- **Q7 — Revenue attribution.** `RESOLVED_BY_SCOPE` Banner performance analytics & revenue attribution is DEFERRED. Use placeholder: KPI card "REVENUE ATTRIBUTED" hidden or shows "—".
- **Q8 — Delete semantics.** `DEFAULT_PROPOSED (a)` Both call the same hard-delete `DELETE /api/admin/banners/[id]`. Card icon = quick action with confirm Dialog; panel button = same action with confirm.
- **Q9 — Save vs Publish changes.** `DEFAULT_PROPOSED (c)` Visual redundancy — only one Save action ships; drop the second button.
- **Q10 — Link URL internal vs absolute.** `DEFAULT_PROPOSED (a)` Same as today — internal-only path. Hostname prefix in design is presentational only. Preserves existing `createBannerSchema.targetUrl` regex (`^/[a-zA-Z0-9/_-]*$`).
- **Q11 — File metadata storage.** `DEFAULT_PROPOSED (c)` Skip — show filename parsed from URL and uploaded-at from `createdAt`; drop dimension/size strings. No schema change.
- **Q12 — Create vs edit panel.** `DEFAULT_PROPOSED (a)` Edit panel doubles as create — clicking "New banner" focuses it, blanks fields, header reads "New banner".
- **Q13 — Audience targeting.** `RESOLVED_BY_SCOPE` Banner audience targeting DEFERRED. Hide the audience block entirely.
- **Q14 — Preview and Duplicate.** `DEFAULT_PROPOSED` Preview = (b) open storefront homepage in new tab with `?previewBannerId=…`. Duplicate = (d) all fields except dates (status forced to `paused` on the clone).
- **Q15 — Mobile KPI mini-row + filter chip count.** `RESOLVED_BY_SCOPE` Banner perf KPIs DEFERRED → mini-row hidden on mobile. Filter chips collapse to 3 status pills (Live / Scheduled / Expired).
- **Q16 — Performance report CTA.** `RESOLVED_BY_SCOPE` Banner perf DEFERRED → hide button.
- **Q17 — Header subtitle counts.** `RESOLVED_BY_SCOPE` Drop impressions count from subtitle (perf DEFERRED). Status counts (active=live): `DEFAULT_PROPOSED (a)` "active" is synonym for "live"; one count source. Subtitle becomes "8 live · 2 scheduled".
- **Q18 — SCHEDULED card stats "—".** `RESOLVED_BY_SCOPE` Per-card stats hidden entirely under perf-DEFERRED placeholder.
- **Q19 — Title "Promo Banners" → "Banners".** `DEFAULT_PROPOSED (a)` Title only; keep route at `/admin/promo-banners`. Smallest diff — avoids touching constants and DB table name.
- **Q20 — Indian SI abbreviation rules.** `RESOLVED_BY_STUB` Currency formatter IN_SCOPE → `Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })` for full grouping; lakh/crore notation only on KPI hero numbers (threshold ≥ 1,00,000).

---

## admin-categories

- **Q1 — Header subtitle copy & data sources.** `RESOLVED_BY_SCOPE` Categories aggregates DEFERRED → drop live counts; keep static descriptive copy ("Manage product categories.").
- **Q2 — Breadcrumb hierarchy.** `RESOLVED_BY_STUB` Catalog Breadcrumb IN_SCOPE. `DEFAULT_PROPOSED (a)` Visual-only label — non-clickable middle "Catalog" segment. No route move.
- **Q3 — Selecting a row.** `DEFAULT_PROPOSED (a)` Full-row click opens panel; trash and overflow icons stop propagation. URL not synced.
- **Q4 — "Add category" flow target.** `DEFAULT_PROPOSED (a)` Same right-side Edit panel in empty/create mode; header reads "New category"; on save panel switches to edit mode.
- **Q5 — Icon picker (`iconKey`) vs `imageUrl`.** `RESOLVED_BY_STUB` Category icons IN_SCOPE. `DEFAULT_PROPOSED (b)` Keep both — `iconKey` for admin/category-list, `imageUrl` for storefront tile (least destructive).
- **Q6 — Description field.** `RESOLVED_BY_SCOPE` `description` DEFERRED in scope-cut.
- **Q7 — Parent category.** `RESOLVED_BY_SCOPE` `parentId` DEFERRED.
- **Q8 — Sort order.** `RESOLVED_BY_SCOPE` `sortOrder` DEFERRED.
- **Q9 — `isActive` field & storefront semantics.** `RESOLVED_BY_STUB` `isActive` IN_SCOPE. `DEFAULT_PROPOSED (b)` Hide from public list, keep direct slug accessible. Smallest behavioral change vs current public feed.
- **Q10 — Audit "created/last edited by".** `RESOLVED_BY_SCOPE` Audit DEFERRED.
- **Q11 — Per-row PRODUCTS / VENDORS counts.** `RESOLVED_BY_SCOPE` Aggregates DEFERRED.
- **Q12 — Admin list endpoint.** `DEFAULT_PROPOSED` Promote to `GET /api/admin/categories` with `?page=&limit=&q=&sort=&dir=&status=` query params, mirroring existing `GET /api/admin/vendors` (`apps/web/src/app/api/admin/vendors/route.ts`). Public `GET /api/categories` stays untouched.
- **Q13 — Delete (trash + Remove).** `RESOLVED_BY_SCOPE` Trash + Remove affordances are part of rich-model UI, DEFERRED. Hide both.
- **Q14a — Reorder header CTA.** `RESOLVED_BY_SCOPE` Reorder DEFERRED. Hide button.
- **Q14b — Mobile tap-to-edit destination.** `DEFAULT_PROPOSED (a)` Same right-side Edit panel reused as a full-screen `Sheet` (mirrors buyer-account-drawer mobile pattern).
- **Q15 — Export CSV.** `RESOLVED_BY_SCOPE` CSV downloads STUBBED → render visible but click is no-op (toast "Coming soon").
- **Q16 — KPI definitions and deltas.** `RESOLVED_BY_SCOPE` Aggregates DEFERRED → render KPI cards with "—" or hide row.
- **Q17 — Bulk-select target action.** `RESOLVED_BY_SCOPE` Categories rich model DEFERRED → bulk-select hidden.
- **Q18 — Sentence-case copy.** `DEFAULT_PROPOSED (a)` Adopt sentence case across admin button labels; this is the new convention per Pencil.
- **Q19 — Slug edit + breaking-change concern.** `RESOLVED_BY_SCOPE` Slug-edit + redirects DEFERRED.
- **Q20 — Trash + ellipsis overflow.** `RESOLVED_BY_SCOPE` DEFERRED with the rich model.
- **Q21 — Removed Image / Created columns.** `DEFAULT_PROPOSED (a)` Intentional — image swatch replaces image column; created moves into Edit panel.
- **Q22 — "Visible to buyers" copy semantics.** `RESOLVED_BY_STUB` `isActive` IN_SCOPE → confirm semantics tie exactly; storefront `GET /api/categories` adds `WHERE isActive = true`.
- **Q23 — Status stamp values vs DB.** `RESOLVED_BY_STUB` `isActive` IN_SCOPE = ACTIVE / INACTIVE only; `NEEDS REVIEW` deferred. Use existing `Stamp` primitive `success` and `critical` variants.
- **Q24 — Loading / empty / error / form-error states.** `DEFAULT_PROPOSED (a)` Extract from existing `CategoriesTableSkeleton`, "No categories yet." copy, inline error row; retoken to design system; ship as-is.
- **Q25 — Audit panel for Add mode.** `RESOLVED_BY_SCOPE` Audit DEFERRED.
- **Q26 — Catalog sidebar grouping.** `RESOLVED_BY_STUB` Admin sectioned sidebar IN_SCOPE → add `CATALOG` section eyebrow.

---

## admin-dashboard

(Admin analytics dashboard moved to IN_SCOPE in user override, so most "DEFERRED" questions become STUBBED-or-default.)

- **Q1 — Brand cluster in admin top bar.** `DEFAULT_PROPOSED (c)` New shared component across admin/vendor (vendor chrome has the same shape). Reduces duplication.
- **Q2 — Admin global search.** `RESOLVED_BY_STUB` Search route IN_SCOPE. `DEFAULT_PROPOSED (a)` Inline dropdown grouped by entity (vendors / products / orders) — simplest UX, mirrors typical admin UX.
- **Q3 — Bell icon.** `RESOLVED_BY_SCOPE` Notifications DROPPED → render visually inert (no badge, no surface).
- **Q4 — Avatar + name + chevron cluster.** `DEFAULT_PROPOSED (a)` Avatar opens DropdownMenu with `Profile / Settings / Logout`; existing `LogoutButton` semantics moved into menu item.
- **Q5 — Sidebar section eyebrows.** `RESOLVED_BY_STUB` Admin sectioned sidebar IN_SCOPE. `DEFAULT_PROPOSED (a)` `ADMIN_NAV_ITEMS` shape changes to `{ section, items: [...] }[]`.
- **Q6 — Sales reports nav destination.** `DEFAULT_PROPOSED (a)` Routes to placeholder `/admin/sales-reports/page.tsx` (per scope, IN_SCOPE but undesigned → ships as "Coming soon" placeholder route).
- **Q7 — Products nav destination.** `DEFAULT_PROPOSED (a)` Read-only catalog browser at `/admin/products` reusing `GET /api/vendor/products` (joined across all vendors); placeholder shell while design pass lands.
- **Q8 — Orders nav badge count.** `DEFAULT_PROPOSED (a)` Count of open `sub_orders` (`status IN ('pending','packed','handed_to_courier')`); polled via React Query (matches existing `useVendorOrdersQuery` 5s refetch pattern).
- **Q9 — Banners label vs route.** `DEFAULT_PROPOSED (a)` Title-only rename in nav; keep route `/admin/promo-banners`.
- **Q10 — Categories icon.** `DEFAULT_PROPOSED (a)` Adopt `folder-tree` lucide; cosmetic.
- **Q11 — 11th sidebar item label.** `DEFAULT_PROPOSED` "Users" → `/admin/users` (per scope IN_SCOPE; placeholder route).
- **Q12 — Logout placement.** `DEFAULT_PROPOSED` Confirmed — logout moves into avatar dropdown; explicit header `LogoutButton` removed.
- **Q13 — Title subtitle copy.** `DEFAULT_PROPOSED` Show "Performance for {currentMonth}" only (interpolated server-side); drop "last sync" until cache strategy lands.
- **Q14 — Title size.** `DEFAULT_PROPOSED (a)` Adopt 32/800 sans, letter-spacing -0.02.
- **Q15 — Range presets.** `DEFAULT_PROPOSED` Today / 7 days / 30 days / This month / Last month / Custom (custom opens calendar). Most-common preset set.
- **Q16 — Export CSV scope.** `RESOLVED_BY_SCOPE` Statement/CSV STUBBED → render but inert.
- **Q17 — "+ New report" destination.** `DEFAULT_PROPOSED` Routes to `/admin/sales-reports/new` placeholder (Sales Reports IN_SCOPE per scope-cut).
- **Q18 — KPI 1 lakh formatting.** `RESOLVED_BY_STUB` Currency formatter IN_SCOPE — collapse to lakhs (`L`) at threshold ≥ 1,00,000.
- **Q19 — Delta format per KPI.** `DEFAULT_PROPOSED` Match Pencil per card — k1/k3 percentages; k2 absolute count; k4 absolute count of deactivation events. Documented in a constants file.
- **Q20 — Comparison period for deltas.** `DEFAULT_PROPOSED` KPIs always compare month-over-month regardless of range — simplest rule; copy stays "vs last month".
- **Q21 — Vendor revenue source.** `NEEDS_USER` Real product/financial decision: gross order value vs vendor net (after platform fee) vs COD collected. Each gives different totals; user must pick canonical "revenue" definition.
A21: gross order value
- **Q22 — "See all vendors" target.** `DEFAULT_PROPOSED (a)` Link to `/admin/vendors` sorted by sales desc.
- **Q23 — PENDING bucket definition.** `DEFAULT_PROPOSED (b)` Group `pending + packed + handed_to_courier` (i.e., "anything not delivered/cancelled"). Matches scope-cut placeholder semantics.
- **Q24 — Status stamp mapping.** `RESOLVED_BY_STUB` Status display-label mapping IN_SCOPE. `DEFAULT_PROPOSED (a)` `pending → PENDING`, `packed → PACKED`, `handed_to_courier → AT MNP HUB`, `delivered → DELIVERED`, `cancelled → CANCELLED`. (OUT FOR DELIVERY is a synonym; collapse — see buyer-orders Q5.)
- **Q25 — Avg fulfillment computation.** `DEFAULT_PROPOSED` Use `AVG(handedAt − createdAt)` (existing field) as the anchor; defer adding `deliveredAt` until tracking surface lands.
- **Q26 — SLA target source.** `DEFAULT_PROPOSED (b)` Hardcoded constant in shared module.
- **Q27 — Customer "shop name" field.** `RESOLVED_BY_STUB` `user.businessName` IN_SCOPE.
- **Q28 — `displayId` format.** `DEFAULT_PROPOSED (a)` Treat `SH-` as visual placeholder; keep `ORD-` prefix in db. Smallest delta — no migration.
- **Q29 — Order-level status when sub-orders disagree.** `DEFAULT_PROPOSED` Derived rollup: any cancelled→CANCELLED; all delivered→DELIVERED; any handed_to_courier→AT MNP HUB; else worst-case (PACKED → PENDING). Pure helper, no schema.
- **Q30 — Row click behavior.** `DEFAULT_PROPOSED (c)` Rows inert until `/admin/orders/[id]` route exists; per scope Admin Orders IN_SCOPE so this becomes a clickable row to a placeholder detail page.
- **Q31 — Items count blanks.** `DEFAULT_PROPOSED (a)` Always show count; treat blanks in design as oversights.
- **Q32 — Top-seller row click.** `DEFAULT_PROPOSED (a)` Click → `/admin/vendors/[id]`.
- **Q33 — Top-seller trend computation period.** `DEFAULT_PROPOSED (a)` This week vs last week (matches "Top sellers this week" eyebrow). Threshold for flat: ≤ 5% change.
- **Q34 — Vendor deactivation event source.** `RESOLVED_BY_STUB` Audit log STUBBED. `DEFAULT_PROPOSED (a)` Add nullable `vendors.deactivatedAt timestamp`. Smallest additive column.
- **Q35 — Audit log writers.** `RESOLVED_BY_STUB` Audit log STUBBED. Wire writers into vendor activate/deactivate, banner publish, category delete only (per scope-cut placeholder).
- **Q36 — Action vocabulary + dispute.** `RESOLVED_BY_SCOPE` Disputes DROPPED in scope-cut explicit drops. `DEFAULT_PROPOSED (a)` Define a controlled enum of action verbs (e.g. `vendor.activate`, `vendor.deactivate`, `banner.publish`, `category.delete`).
- **Q37 — Audit log "View more" affordance.** `DEFAULT_PROPOSED` Show only latest 5; "View all" link routes to `/admin/audit-log` placeholder route.
- **Q38 — Mobile KPI count.** `DEFAULT_PROPOSED (a)` Other 2 KPIs are below the fold in a 2×2 stack.
- **Q39 — Existing placeholder copy replaced.** `DEFAULT_PROPOSED (a)` Confirmed — replaced entirely.
- **Q40 — Empty / loading / error states for widgets.** `DEFAULT_PROPOSED (a)` Card-level skeletons (using existing `Skeleton` primitive); empty-state copy with optional action; error renders inline retry button.
- **Q41 — Lakh/Crore vs full grouping.** `RESOLVED_BY_STUB` Currency formatter IN_SCOPE — confirms two display modes coexist (compact for KPI hero, full for tables; threshold ≥ 1,00,000).

---

## admin-vendors

- **Q1 — Edit-panel routing.** `DEFAULT_PROPOSED (b)` URL search param via `nuqs` (already in stack — see `01 §1` deps). Shareable + refresh-stable + no new route file.
- **Q2 — Mobile sheet field subset.** `DEFAULT_PROPOSED (a)` Intentional minimum-viable mobile edit; full edit on desktop.
- **Q3 — Edit-panel default state.** `DEFAULT_PROPOSED (a)` Empty placeholder ("Select a vendor to edit"); no auto-select.
- **Q4 — Subtitle stats copy.** `RESOLVED_BY_SCOPE` PENDING REVIEW status DEFERRED → drop "12 pending review" segment from subtitle. Render "{N} active · {M} inactive · {K} new this month".
- **Q5 — Breadcrumb.** `RESOLVED_BY_STUB` Catalog Breadcrumb IN_SCOPE. `DEFAULT_PROPOSED (a)` New global breadcrumb derived from a static admin nav tree.
- **Q6 — Export CSV / Bulk import scope.** `NEEDS_USER` Bulk import IN_SCOPE per user but no flow design exists; user must specify CSV column set + flow (modal vs route). Export CSV: `RESOLVED_BY_SCOPE` STUBBED → button visible but inert.
A6: design the feature and create a suitable csv column structure that caters to end to end product add. csv will then be provided according to that
- **Q7 — `PENDING REVIEW` third status.** `RESOLVED_BY_SCOPE` DEFERRED — keep `isActive` boolean.
- **Q8 — Per-row stamp values.** `RESOLVED_BY_SCOPE` Only ACTIVE / INACTIVE stamps; PENDING DEFERRED.
- **Q9 — Status toggle in panel.** `RESOLVED_BY_SCOPE` Toggle stays 2-state Active/Inactive; PENDING is set via separate verification flow when designed.
- **Q10 — GST / NTN field.** `RESOLVED_BY_SCOPE` `02 §7 Q14` user said "no GST" → `DEFAULT_PROPOSED (a)` Honor prior answer; drop the field even though drawn.
- **Q11 — Bank details placement.** `DEFAULT_PROPOSED (b)` Separate "Bank" tab/section inside the same edit panel (not drawn yet) — keep admin path; vendor self-service edit IN_SCOPE adds the second path.
- **Q12 — Remove vendor.** `DEFAULT_PROPOSED (a)` Soft delete via new `vendors.deletedAt timestamp` (matches scope-cut Q34 vendor deactivation column). Confirmation Dialog.
- **Q13 — Search query target.** `DEFAULT_PROPOSED (a)` Server-side ILIKE on `shopName` / `fullName` (and on mobile `phoneNumber`); debounced. Server-side via new `q=` param on `GET /api/admin/vendors`.
- **Q14 — Bazaar dropdown source.** `DEFAULT_PROPOSED (a)` `SELECT DISTINCT hub FROM vendors`. Cheapest; no new table.
- **Q15 — Sort dropdown options.** `DEFAULT_PROPOSED (a)` Newest first (default), Oldest first. Two options; expand later.
- **Q16 — Bulk select target action.** `DEFAULT_PROPOSED (a)` Bulk activate/deactivate (single `isActive` toggle on selection).
- **Q17 — Row kebab menu items.** `DEFAULT_PROPOSED` Minimal: View, Deactivate, Remove.
- **Q18 — Mobile "Sales report" button.** `DEFAULT_PROPOSED` Per Admin Sales Reports IN_SCOPE → routes to `/admin/vendors/[id]/sales` placeholder route.
- **Q19 — Mobile ORDERS stat (not on desktop).** `DEFAULT_PROPOSED` Render mobile-only as drawn; desktop keeps Products/Monthly Sales triplet.
- **Q20 — Avatar generation algorithm.** `DEFAULT_PROPOSED (b)` `initials(fullName)` — first letter of first two whitespace-split words, up to 2 letters. Handles single-word names ("Ali" → "A").
- **Q21 — `vendors.city` survival.** `DEFAULT_PROPOSED (b)` Keep both — `city` for filtering, `address` is free-form. Smallest non-destructive change.
- **Q22 — Vendor display ID format.** `RESOLVED_BY_STUB` Vendor enrichment `displayId` IN_SCOPE. `DEFAULT_PROPOSED` Auto-numbered sequential `VND-{NNNN}` zero-padded, mirroring `orders.displayId` (`ORD-…`) pattern in `apps/web/src/app/api/checkout/route.ts`.
- **Q23 — Categories per-vendor.** `RESOLVED_BY_SCOPE` Per-vendor categories DEFERRED.
- **Q24 — Monthly limit semantics.** `RESOLVED_BY_SCOPE` Monthly limit DEFERRED.
- **Q25 — Audit "onboarded by / last edited by".** `RESOLVED_BY_STUB` Audit log STUBBED → Audit block hidden in this revamp; full audit deferred.
- **Q26 — Lifetime sales aggregate window.** `RESOLVED_BY_SCOPE` Aggregates DEFERRED.
- **Q27 — Selected-row visual.** `DEFAULT_PROPOSED` Confirmed — `paper-2` fill = same as currently-edited; not a separate bulk-select highlight.
- **Q28 — First-page row count.** `DEFAULT_PROPOSED (b)` Keep `PAGE_LIMIT = 10`; "8 rows" in design is illustrative.
- **Q29 — Empty / loading / error / form-error states.** `DEFAULT_PROPOSED (a)` Reuse current ad-hoc states (`VendorsTableSkeleton`, inline error row, sonner toasts) with retoken.
- **Q30 — `Add vendor` casing.** `DEFAULT_PROPOSED` Sentence case is the new convention.
- **Q31 — Pagination footer copy.** `DEFAULT_PROPOSED` New "Showing m–n of total" wording adopted; trailing entity-noun is interpolatable so the same component can be reused.
- **Q32 — Save-changes inverse-ink button.** `DEFAULT_PROPOSED` Add `inverse` variant to `Button` (per `04 Q-BUTTON-1`); panel uses it.
- **Q33 — Email field source.** `RESOLVED_BY_STUB` Vendor email IN_SCOPE → `DEFAULT_PROPOSED (a)` Persist on `user.email` (single source of truth); form loads/saves through to user.

---

## buyer-account-drawer

- **Q1 — Drawer scrim opacity 50% vs 60%.** `DEFAULT_PROPOSED (a)` Align scrim to existing `--bg-overlay` (50%); drop the 60% as a Pencil rounding artifact.
- **Q2 — "Saved" stat formula.** `RESOLVED_BY_STUB` Buyer profile stats STUBBED → render "—" for `totalSavedCents` until savings model is defined.
- **Q3 — Trailing pill new primitive vs ad-hoc.** `DEFAULT_PROPOSED (b)` Inline frame here, generalize later. Smallest delta — no new primitive.
- **Q4 — Payment methods row schema vs static.** `RESOLVED_BY_SCOPE` Payment methods STUBBED → render row with static "Cash on delivery default", no destination route.
- **Q5 — Lang toggle global state plumbing.** `RESOLVED_BY_STUB` i18n STUBBED → `DEFAULT_PROPOSED (a)` Cookie `lang=en|ur` set by toggle, no UI changes today.
- **Q6 — Drawer width override on `<SheetContent>`.** `DEFAULT_PROPOSED (b)` Per-consumer `className="sm:!max-w-[480px]"` override. Smallest delta — no primitive change.
- **Q7 — Trigger surface — `/profile` route + header button.** `DEFAULT_PROPOSED (a)` `/profile/page.tsx` mounts a client component that opens the drawer on mount and replaces history with `/`. Cleanest deep-link strategy.
- **Q8 — Logout target after `signOut`.** `DEFAULT_PROPOSED (a)` Follow `LogoutButton` pattern — close drawer first, then `signOut()` → `router.push('/')` → `router.refresh()`.
- **Q9 — Version string source.** `DEFAULT_PROPOSED (a)` `NEXT_PUBLIC_APP_VERSION` env var, populated at build time from `package.json`. Mirrors existing `t3-env` setup (`modules/core/env/{client,server}`).
- **Q10 — Track-order row when no active order.** `DEFAULT_PROPOSED (a)` Hide row entirely.
- **Q11 — Stats freshness / cache strategy.** `RESOLVED_BY_STUB` Buyer profile stats STUBBED. `DEFAULT_PROPOSED (a)` React Query, prefetch on header trigger hover; matches existing patterns.
- **Q12 — Initials computation.** `DEFAULT_PROPOSED (a)` Split on whitespace, take first letter of first two parts ("Tariq Ahmed" → "TA", single name "Ali" → "A").
- **Q13 — "Member since" date format.** `DEFAULT_PROPOSED (a)` Abbreviated `dayjs(...).format('MMM YYYY')`.
- **Q14 — Lakh notation for currency.** `RESOLVED_BY_STUB` Currency formatter IN_SCOPE — drawer uses compact mode at threshold ≥ 1,00,000.
- **Q15 — Saved items / wishlist scope.** `RESOLVED_BY_STUB` Wishlist IN_SCOPE per user — drive from the new endpoint.
- **Q16 — Unauthed drawer behavior.** `DEFAULT_PROPOSED (a)` Hide trigger; show "Sign In" Button as today. Matches existing `StorefrontHeader` conditional.
- **Q17 — "default Shop" copy in Saved-addresses subtitle.** `DEFAULT_PROPOSED (a)` Render the literal `addresses.title` field (so default "Office" shows "default Office"). No new enum.
- **Q18 — Drawer header close-button.** `DEFAULT_PROPOSED (a)` Hide default `<SheetClose>`; render custom 36px outline button inside the title row.

---

## buyer-cart

- **Q1 — Pack count display.** `RESOLVED_BY_STUB` Pack-based pricing IN_SCOPE → eyebrow shows pack count from new schema.
- **Q2 — Vendor name on cart line.** `DEFAULT_PROPOSED (a)` Snapshot at add-time — extend `CartItem` (`apps/web/src/modules/cart/types.ts`) with `vendorName`. Mirrors existing snapshot pattern (`weightGrams`, `priceTiers`); `cart-store.ts` `persist` migration handled in same change.
- **Q3 — Title copy + item count.** `DEFAULT_PROPOSED (a)` Adopt verbatim — "Your cart · 12 items" desktop, "Your cart · 12" mobile.
- **Q4 — Weight display "1.008 KG".** `DEFAULT_PROPOSED (a)` Per-pack/unit weight as configured (`weightGrams / 1000`), not line total.
- **Q5 — Quantity selector behavior.** `DEFAULT_PROPOSED (b)` Keep typeable input (existing `QuantitySelector` pattern); restyle to a single segmented frame so the "2" cell becomes the editable input.
- **Q6 — PDP linking from cart row.** `DEFAULT_PROPOSED (b)` Keep `<Link>` on title; drop underline/hover styling. Image is inert.
- **Q7 — Mobile cart row remove + per-pack price drop.** `DEFAULT_PROPOSED (a)` Remove via `−` until qty=0 (existing store already removes at qty=0). No swipe gesture.
- **Q8 — `Clear cart` action on mobile.** `DEFAULT_PROPOSED (a)` Mobile has no clear-cart affordance — intentional; users remove items individually.
- **Q9 — "Items (N)" line removed.** `DEFAULT_PROPOSED (a)` Remove; the title bar `· 12 items` already conveys the count.
- **Q10 — Free-delivery threshold.** `RESOLVED_BY_STUB` Free delivery STUBBED as marketing copy → static caption; no computation.
- **Q11 — Amber tip edge cases.** `RESOLVED_BY_STUB` Weight gauge IN_SCOPE. `DEFAULT_PROPOSED (a)` Hide tip when no next-cheaper tier; mobile never shows it.
- **Q12 — Mobile sticky bottom bar behavior.** `DEFAULT_PROPOSED (a)` Always pinned; inline mobile CTA does not exist; body padding-bottom reserves bar height.
- **Q13 — Auth gate on checkout CTA.** `DEFAULT_PROPOSED (a)` Keep existing modal behavior (`openAuthModal`); visual matches Pencil but click handler still gates.
- **Q14 — Empty state behavior.** `DEFAULT_PROPOSED (a)` Keep current copy + structure; restyle to Pencil tokens; no logic change.
- **Q15 — Continue Shopping CTA.** `DEFAULT_PROPOSED (a)` Remove entirely.
- **Q16 — Clear-cart icon + casing.** `DEFAULT_PROPOSED (a)` Adopt verbatim — trash-2 + "Clear cart" sentence-case + inline non-button styling.
- **Q17 — Receipt-card surface composition.** `DEFAULT_PROPOSED (a)` Adopt three-piece composition exactly (paper-2 receipt + standalone CTA + free-delivery caption as siblings).
- **Q18 — GST rate source.** `RESOLVED_BY_SCOPE` GST STUBBED. `DEFAULT_PROPOSED (a)` Hardcoded constant `GST_RATE = 0.18` in `modules/cart/utils/`. (Per scope STUBBED — display row but no `orders.taxCents` persistence yet.)
- **Q19 — Delivery tier table source.** `RESOLVED_BY_STUB` Weight gauge IN_SCOPE → `DEFAULT_PROPOSED (a)` Constant in `modules/cart/utils/delivery-tiers.ts`.
- **Q20 — Tier-active highlight rule.** `DEFAULT_PROPOSED (a)` Inclusive on min, exclusive on max: `tier.minKg ≤ kg < tier.maxKg`. At 0 kg, first tier is highlighted (matches "current weight bracket" semantics).
- **Q21 — Receipt label "Delivery (10–25 kg tier)" format.** `DEFAULT_PROPOSED (a)` Exact format `Delivery ({minKg}–{maxKg} kg tier)` for bounded tiers, `Delivery ({minKg}+ kg tier)` for last tier.
- **Q22 — Mobile vs desktop receipt copy difference ("tier" suffix).** `DEFAULT_PROPOSED (b)` Standardize to one wording across breakpoints — keep the longer desktop variant ("10–25 kg tier") for clarity.
- **Q23 — Per-pack price column.** `RESOLVED_BY_STUB` Pack-based pricing IN_SCOPE.
- **Q24 — Trash-2 vs `x` icon.** `DEFAULT_PROPOSED (a)` Adopt verbatim — `x` lucide ink-3.
- **Q25 — Cart row image not a Link.** `DEFAULT_PROPOSED` Same as Q6 — image inert; title keeps the link.
- **Q26 — Mobile cart-row title truncation.** `DEFAULT_PROPOSED (a)` Auto-truncate desktop string with `text-overflow: ellipsis`; same string at both breakpoints.
- **Q27 — Subtotal row label change.** `DEFAULT_PROPOSED` Confirmed via Q9 — Subtotal / Delivery / GST / Total only; no "Items (N)" prefix.

---

## buyer-checkout

- **Q1 — Step indicator copy and behavior.** `DEFAULT_PROPOSED (a)` Display-only step row; mobile chevron always navigates to `/cart`. Smallest delta.
- **Q2 — Mobile address-card field set.** `DEFAULT_PROPOSED (b)` Always show all fields; design omitted for visual brevity.
- **Q3 — Rider-instructions persistence.** `DEFAULT_PROPOSED (c)` Optional `text` column on `orders.riderNotes` with max 500 chars, nullable. Smallest additive — one column, parent-order-level.
- **Q4 — Payment method enum scope.** `RESOLVED_BY_SCOPE` Payment methods STUBBED → render the 3-card selector with COD pre-selected and other 2 disabled "(coming soon)"; no `paymentMethod` field on payload.
- **Q5 — Delivery (shipping) tier source.** `RESOLVED_BY_STUB` Weight gauge IN_SCOPE → constant table; `DEFAULT_PROPOSED (b)` Per sub-order (each vendor parcel charges its own delivery — matches existing `subOrders.shippingFeeCustomer` field).
- **Q6 — GST 18% computation base.** `RESOLVED_BY_SCOPE` GST STUBBED. `DEFAULT_PROPOSED (a)` `taxCents = round(0.18 × (subtotal + delivery))`; persisted on `orders.taxCents` (stub adds the column even if not displayed everywhere yet).
- **Q7 — Items overflow `+ N more items`.** `DEFAULT_PROPOSED (a)` Non-interactive truncation; user navigates back to `/cart` to see all.
- **Q8 — "+ Use a new address" target.** `DEFAULT_PROPOSED (a)` Open existing `AddressDialog` (`apps/web/src/modules/user-addresses/components/address-dialog/`); on save, address is added + auto-selected.
- **Q9 — `Manage addresses` link removal.** `DEFAULT_PROPOSED (a)` Intentional removal — `+ Use a new address` (Q8) covers the same need.
- **Q10 — Manual shipping form removal.** `DEFAULT_PROPOSED (b)` Move manual form into the new-address dialog (per Q8); checkout flow only takes `addressId`. Existing `checkoutShippingFormSchema` becomes part of the dialog's create flow.
- **Q11 — `DEFAULT` mono pill global.** `DEFAULT_PROPOSED (c)` Reuse existing `Stamp` primitive (`packages/ui/src/components/stamp.tsx`) with a `success` intent variant. No new primitive.
- **Q12 — Eyebrow style for the three sections.** `DEFAULT_PROPOSED (a)` Checkout-only pattern — keep numbered-mono eyebrow scoped to checkout for now.
- **Q13 — CTA copy `Place order` vs `Place Order (COD)`.** `DEFAULT_PROPOSED (a)` Drop suffix; sentence-case is the new standard.
- **Q14 — `Subtotal` vs `Items (n)`.** `DEFAULT_PROPOSED (b)` Drop count from row; add `· N items` to the `ORDER SUMMARY` eyebrow (matches mobile design).
- **Q15 — `Use a new address` vs `Use a different address`.** `DEFAULT_PROPOSED (a)` Adopt new copy verbatim.
- **Q16 — Disabled payment options treatment.** `DEFAULT_PROPOSED (a)` `aria-disabled` + non-interactive; cursor `not-allowed`; hover/focus suppressed.
- **Q17 — Order-summary item-list image source.** `DEFAULT_PROPOSED (b)` Use product image when available; fall back to lucide `package` glyph.
- **Q18 — Page-level loading state.** `DEFAULT_PROPOSED (a)` Keep centered `Spinner` from `@repo/ui/components/spinner`.
- **Q19 — Submission loading state on CTA.** `DEFAULT_PROPOSED (a)` Keep current behavior verbatim (in-button spinner + "Placing order…").
- **Q20 — Error feedback.** `DEFAULT_PROPOSED (c)` Both — Sonner toast for network errors, inline section-level errors for validation.

---

## buyer-home

- **Q1 — Util-strip lang toggle vs segmented `LanguageToggle`.** `RESOLVED_BY_STUB` i18n STUBBED. `DEFAULT_PROPOSED (a)` One component with `variant="mini" | "segmented"`.
- **Q2 — "Deliver to {city/zip}" subnav.** `RESOLVED_BY_STUB` Deliver-to-city STUBBED static — render user's default-address city if signed-in, else "Pakistan".
- **Q3 — Hero data source.** `RESOLVED_BY_STUB` Editorial home hero IN_SCOPE. `DEFAULT_PROPOSED (c)` Hard-code 1–4 hero slides in a constants file (`modules/storefront/components/hero-carousel/slides.ts`) initially; defer schema extension. Smallest delta from existing carousel.
- **Q4 — "Hot products" / TRENDING NOW source.** `RESOLVED_BY_STUB` Hot products STUBBED → reuse `SuperSaversSection` data with relabeled eyebrow.
- **Q5 — Promo strip — marketing or enforced.** `RESOLVED_BY_STUB` Free delivery STUBBED as marketing copy.
- **Q6 — Footer redesign.** `DEFAULT_PROPOSED (a)` Drop social icons; use `ink` background as drawn; bottom row has city list + © string.
- **Q7 — Account button — drawer trigger replaces dropdown.** `DEFAULT_PROPOSED (a)` Replace dropdown entirely with drawer (matches account-drawer feature).
- **Q8 — Cart action pill + label.** `DEFAULT_PROPOSED (a)` Pill-with-label desktop, icon-only mobile (as drawn).
- **Q9 — Categories grid icons.** `RESOLVED_BY_STUB` Category icons IN_SCOPE → render `iconKey` glyph inside the green-bg swatch on both desktop and mobile.
- **Q10 — "Popular" section metric + data source.** `DEFAULT_PROPOSED (c)` Re-skin of existing first-N categories (no new aggregation). Drop "{N} SKUs" caption until aggregates land.
- **Q11 — `prod1` price model — list vs sale.** `RESOLVED_BY_STUB` Pack-based pricing IN_SCOPE → MRP is the strikethrough; current pack price is the main value.
- **Q12 — Wishlist scope.** `RESOLVED_BY_STUB` Wishlist IN_SCOPE per user override.
- **Q13 — `/search` route implementation.** `RESOLVED_BY_STUB` Search route IN_SCOPE per user override.
- **Q14 — Mobile chrome — separate component or responsive header.** `DEFAULT_PROPOSED (b)` One header with a `useIsMobile`-style branch (matches existing single-`StorefrontHeader` pattern). `mCartDot` triggers when cart has unread/items count > 0 (re-uses cart-store).
- **Q15 — Footer link routing.** `RESOLVED_BY_STUB` Footer marketing pages STUBBED → all link to a single `/coming-soon` placeholder route.
- **Q16 — Loading / empty / error states for sections.** `DEFAULT_PROPOSED (a)` Add skeletons matching the new `prod1` card grid geometry; existing `null` empty states remain.

---

## buyer-orders

- **Q1 — Filter tab inventory + default.** `DEFAULT_PROPOSED (a)` Adopt design as drawn — All / In transit / Delivered / Cancelled, default `All`; drop existing `pending`/Roman-Urdu tabs.
- **Q2 — Mapping rule for `In transit`.** `DEFAULT_PROPOSED (b)` Strict — at least one sub-order in `handed_to_courier`. Doesn't double-count packed orders.
- **Q3 — Mapping rule for `Cancelled`.** `DEFAULT_PROPOSED (a)` All sub-orders cancelled. Avoids overlap with In Transit.
- **Q4 — Subtitle aggregates source.** `DEFAULT_PROPOSED (a)` Server-side in same `GET /api/retailer/orders` route, wrapping response as `{ orders, summary: { count, lifetimeTotal } }`.
- **Q5 — `OUT FOR DELIVERY` vs `AT MNP HUB` discriminator.** `RESOLVED_BY_STUB` Status display-label mapping IN_SCOPE. `DEFAULT_PROPOSED (c)` Semantic synonyms — pick `AT MNP HUB` as canonical for `handed_to_courier`. Drop `OUT FOR DELIVERY` from the mapping.
- **Q6 — Stamps `PENDING` and `PACKED` on this screen.** `DEFAULT_PROPOSED (a)` Use design-system PACKED variant; PENDING uses `warning` intent (per status-mapping table).
- **Q7 — `Quick reorder` top-right button.** `DEFAULT_PROPOSED (a)` Reorder the most recent delivered order in one click → navigates to `/profile/orders/{lastDeliveredId}` (the new Reorder screen).
- **Q8 — `Export CSV` scope.** `RESOLVED_BY_SCOPE` Statement/CSV STUBBED → button visible but inert.
- **Q9 — Card click target and "View details" target.** `DEFAULT_PROPOSED` Per `02 Q1` user answer, "View details" opens Reorder. Whole card click also opens Reorder for parity. Existing `/profile/orders/[id]` route stays — repurposed as the Reorder screen (per scope-cut).
- **Q10 — Card chevron-down behavior.** `DEFAULT_PROPOSED (c)` Placeholder for future behavior; render but inert (no expand, no menu) for now.
- **Q11 — Tab labels: copy + emoji.** `DEFAULT_PROPOSED` Clean wipe to English — drop emoji + Roman-Urdu strings (per `02 §7 Q16`).
- **Q12 — Card meta "Delivered 26 Apr · 2 days".** `RESOLVED_BY_STUB` Order tracking IN_SCOPE per user override. `DEFAULT_PROPOSED (a)` Add `sub_orders.deliveredAt timestamp`; "X days" derived from `deliveredAt − createdAt`.
- **Q13 — Card meta postal code.** `RESOLVED_BY_STUB` Postal code IN_SCOPE → `addresses.postalCode` + mirrored on `orders` shipping snapshot.
- **Q14 — Card thumbnails: placeholder vs real photos.** `NEEDS_USER` This is a real visual-direction decision (warehouse aesthetic vs product photos). Pencil's deliberate use of icons across multiple screens suggests intentional, but smallest delta is to keep existing real photos. User must pick.
A14: for products, images will be used. for categories, vendor can choose b/w image or icon.
- **Q15 — Card meta "COD · paid on delivery".** `RESOLVED_BY_SCOPE` Payment methods STUBBED → static copy; no `paymentMethod` column.
- **Q16 — Items caption format.** `DEFAULT_PROPOSED (a)` Confirm desktop/mobile split as drawn; lead with 4 names desktop / 3 names mobile; separator " · "; if N=0, hide the suffix.
- **Q17 — Sort options.** `DEFAULT_PROPOSED` Newest first (default), Oldest first. Two options; expand later.
- **Q18 — Search scope.** `DEFAULT_PROPOSED (b)` `displayId` + `products.name` (matches the placeholder).
- **Q19 — Loading / empty / no-results / error states.** `DEFAULT_PROPOSED (a)` Keep current shapes (skeleton, empty, error) but rewrite copy to English and retoken visually.
- **Q20 — Mobile back chevron target.** `DEFAULT_PROPOSED (a)` `/profile` (account drawer trigger surface per `02 §7 Q3`).
- **Q21 — Mobile drops "View details" button.** `DEFAULT_PROPOSED (a)` Tap card body opens Reorder (matches Q9 desktop semantic).
- **Q22 — Mobile "Cancelled" chip without count.** `DEFAULT_PROPOSED (b)` Pencil oversight — add count.
- **Q23 — Mobile language toggle.** `RESOLVED_BY_STUB` i18n STUBBED → render the `LanguageToggle` atom inert (no-op).
- **Q24 — `Quick reorder` vs per-card "Reorder" copy.** `DEFAULT_PROPOSED` Confirm both labels correct; differentiated by surface (header CTA = Quick reorder; card CTA = Reorder).
- **Q25 — Stamp aggregation precedence.** `DEFAULT_PROPOSED` Derived rollup: any cancelled→CANCELLED; all delivered→DELIVERED; any handed_to_courier→AT MNP HUB; any packed→PACKED; else PENDING.
- **Q26 — Card border / surface palette.** `DEFAULT_PROPOSED (a)` Use existing `Card` primitive (`packages/ui/src/components/card.tsx`) composed with a paper-2 header strip.
- **Q27 — Pill-tab + count primitive.** `DEFAULT_PROPOSED (b)` Thin styling on top of buttons (small inline `TabPill` component in the orders module). Defer making it a `@repo/ui` primitive.
- **Q28 — Chip row mobile (`clip:true` scroll).** `DEFAULT_PROPOSED` Tailwind `flex overflow-x-auto` div; promote to primitive only if reused in 3+ screens.
- **Q29 — Sticky tab bar + backdrop blur.** `DEFAULT_PROPOSED` Drop sticky / backdrop-blur entirely (Pencil shows pure flow).
- **Q30 — DELIVERED stamp text color token.** `DEFAULT_PROPOSED` Confirmed — use `green-700` (Pencil aliases `green = green-700`).

---

## buyer-product

- **Q1 — PDP breadcrumb (multi-category resolution).** `RESOLVED_BY_STUB` Breadcrumb IN_SCOPE. `DEFAULT_PROPOSED (a)` Pick first category by `product_categories` insert order; render `Home › {Category} › {Product}`.
- **Q2 — Title eyebrow `(48 × 21g)` storage.** `RESOLVED_BY_STUB` Pack-based pricing IN_SCOPE. `DEFAULT_PROPOSED (b)` Computed at render from `packSize` + `unitWeightGrams`.
- **Q3 — Bare weight subtitle drop.** `DEFAULT_PROPOSED (a)` Drop — packaging info handled by title eyebrow + spec section.
- **Q4 — Main price copy.** `RESOLVED_BY_STUB` Pack-based pricing IN_SCOPE. `DEFAULT_PROPOSED (a)` Yes — current-bundle total only; remove "From" prefix.
- **Q5 — MRP strikethrough.** `RESOLVED_BY_STUB` Pack-based pricing IN_SCOPE. `DEFAULT_PROPOSED (c)` Optional `packMrpCents` — if missing, hide strikethrough + save pill. Vendor isn't forced to set MRP.
- **Q6 — Save pill computation.** `RESOLVED_BY_STUB` Pack-based pricing IN_SCOPE. `DEFAULT_PROPOSED (a)` Derived: `save = mrp − pricePerPack`, `percent = round((save/mrp)×100)`.
- **Q7 — Per-unit caption.** `RESOLVED_BY_STUB` Pack-based pricing IN_SCOPE. `DEFAULT_PROPOSED (a)` Stored as integer `pricePerUnitCents` per product per `02 §7 Q12 / pack-pricing surface map`.
- **Q8 — Currency formatting.** `RESOLVED_BY_STUB` Currency formatter IN_SCOPE. `DEFAULT_PROPOSED (a)` `Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })` for all `Rs.` displays; decimals only on per-unit caption.
- **Q9 — Bundle section header copy.** `DEFAULT_PROPOSED (a)` Use Pencil copy verbatim ("CHOOSE BUNDLE SIZE"); drop Package icon.
- **Q10 — Bundle cards taxonomy.** `RESOLVED_BY_STUB` Pack-based pricing IN_SCOPE. `DEFAULT_PROPOSED (a)` One badge flag per tier with enum `none | save | best`; selected-state `bg-ink text-white`.
- **Q11 — Removal of `product_price_tiers`.** `RESOLVED_BY_STUB` Pack-based pricing IN_SCOPE. `DEFAULT_PROPOSED (a)` Drop `product_price_tiers` and add fresh `product_pack_tiers`. Cleanest.
- **Q12 — Default-selected bundle.** `DEFAULT_PROPOSED (a)` Vendor-pinned `isDefault` boolean on one tier row.
- **Q13 — Qty stepper unit & height.** `RESOLVED_BY_STUB` Pack-based pricing IN_SCOPE. `DEFAULT_PROPOSED (a)` Min = 1 pack, max = `stock` (interpreted as packs); changing the bundle resets quantity to 1.
- **Q14 — Wishlist heart on PDP.** `RESOLVED_BY_STUB` Wishlist IN_SCOPE. `DEFAULT_PROPOSED (a)` Signed-in only — bounce guest clicks to `/auth?redirect=/products/[slug]`. (Defer guest local-storage merge until v2.)
- **Q15 — Stock indicator on PDP.** `DEFAULT_PROPOSED (a)` Drop entirely from PDP — out-of-stock is communicated via Add-to-cart disabled state.
- **Q16 — Out-of-stock disabled state.** `DEFAULT_PROPOSED (a)` Keep disabled + "Out of Stock" copy (existing behavior).
- **Q17 — "Added to Cart" success state.** `DEFAULT_PROPOSED (a)` Drop inline transition; show Sonner toast (matches existing `sonner` integration).
- **Q18 — Delivery card content.** `RESOLVED_BY_SCOPE` PDP spec/delivery STUBBED → static copy "MNP delivery · 1–3 days".
- **Q19 — Spec section content.** `RESOLVED_BY_SCOPE` PDP spec STUBBED → fixed inline list (brand + vendor + weight + pack size from existing fields).
- **Q20 — Mobile sticky add-to-cart bar.** `DEFAULT_PROPOSED (a)` Sticky bar is the only qty + Add-to-cart surface on mobile (pure migration from inline to sticky).
- **Q21 — YMAL related products.** `DEFAULT_PROPOSED (a)` Same primary category, exclude self, ordered by stock-or-recency, fixed take=8. New endpoint `GET /api/products/[slug]/related`.
- **Q22 — Mobile thumbnails strip.** `DEFAULT_PROPOSED (a)` Drop thumbs on mobile; show only the first image (matches Pencil mobile hero).
- **Q23 — "Qty:" label prefix.** `DEFAULT_PROPOSED (b)` Keep visually-hidden as `sr-only` for a11y.
- **Q24 — Inline line-total under qty.** `DEFAULT_PROPOSED (a)` Drop entirely — the price block IS the total.
- **Q25 — Product-not-found state.** `DEFAULT_PROPOSED (a)` Keep default Next.js 404.
- **Q26 — `prod1` card heart icon.** `RESOLVED_BY_STUB` Wishlist IN_SCOPE. `DEFAULT_PROPOSED (a)` Interactive — same wishlist endpoint as Q14.
- **Q27 — Util strip language toggle on PDP.** `RESOLVED_BY_STUB` i18n STUBBED → render the toggle, EN selected, no-op on click.
- **Q28 — "From {price}" prefix.** `DEFAULT_PROPOSED (a)` Default-selected bundle's price renders immediately; "From" copy removed from PDP.
- **Q29 — `weightGrams` column ambiguity.** `RESOLVED_BY_STUB` Pack-based pricing IN_SCOPE. `DEFAULT_PROPOSED (a)` Rename to `packWeightGrams`; `unitWeightGrams` is the new per-unit column.

---

## buyer-reorder

- **Q1 — Breadcrumb vs back button.** `RESOLVED_BY_STUB` Breadcrumb IN_SCOPE. `DEFAULT_PROPOSED (b)` Replace fully — breadcrumb on desktop and a smaller breadcrumb above the title on mobile.
- **Q2 — Page title literal.** `DEFAULT_PROPOSED (a)` Always literal "Replenish last week's cart" placeholder copy.
- **Q3 — Page description copy.** `DEFAULT_PROPOSED` Adopt verbatim; visible on every visit (not first-visit-only).
- **Q4 — Page eyebrow date format.** `DEFAULT_PROPOSED` Uppercase month (`24 APR 2026`); shared formatter for all date eyebrows across design.
- **Q5 — Mobile eyebrow drops order id.** `DEFAULT_PROPOSED (a)` Intentional — mobile shows order id elsewhere (page eyebrow + breadcrumb already have it).
- **Q6 — Tier table source.** `RESOLVED_BY_STUB` Weight gauge IN_SCOPE → constant in `modules/cart/utils/delivery-tiers.ts`.
- **Q7 — Help banner template + edge cases.** `DEFAULT_PROPOSED (a)` Hide banner at top tier; otherwise compute delta + savings; mobile never shows it.
- **Q8 — Compact mobile gauge legend.** `DEFAULT_PROPOSED` Confirm intentional — mobile drops Rs. labels per cell for space.
- **Q9 — Items toolbar count "3 quantity changes".** `DEFAULT_PROPOSED` Includes quantity edits + removals + deselections; segment hides when count is 0.
- **Q10 — Select-all behavior.** `DEFAULT_PROPOSED` Toggle (Select all → Deselect all); skips out-of-stock rows; resets removed rows to selected.
- **Q11 — Items list grouping (sub-order parcels).** `RESOLVED_BY_STUB` Order tracking IN_SCOPE → parcel/status info moves to dedicated tracking screen. `DEFAULT_PROPOSED (a)` Reorder is flat list.
- **Q12 — Per-row thumbnail.** `DEFAULT_PROPOSED (a)` Pencil-deliberate placeholder icons (warehouse aesthetic). Drop `next/image` rendering on Reorder rows.
- **Q13 — Title with "Pack of N".** `RESOLVED_BY_STUB` Pack-based pricing IN_SCOPE.
- **Q14 — Per-item weight eyebrow.** `RESOLVED_BY_STUB` Pack-based pricing IN_SCOPE → pack weight = `unitWeightGrams × packSize`.
- **Q15 — Per-unit price phrasing variations.** `RESOLVED_BY_STUB` Vendor product enrichment IN_SCOPE → derived from `packagingUnit` field.
- **Q16 — Quantity stepper bounds.** `DEFAULT_PROPOSED` Lower=1, upper=`stock` (in packs), step=1; X removes the row.
- **Q17 — Per-row total recompute.** `DEFAULT_PROPOSED (a)` Always current pack price (live, not historical snapshot). Justified: original order is immutable; reorder draft uses today's prices.
- **Q18 — Stock label threshold.** `RESOLVED_BY_STUB` Vendor product enrichment IN_SCOPE → per-product `lowStockThreshold`.
- **Q19 — Per-row remove X confirmation.** `DEFAULT_PROPOSED` No confirmation; Sonner inline undo toast (matches existing `sonner` pattern).
- **Q20 — Out-of-stock row state.** `DEFAULT_PROPOSED` Checkbox disabled (not user-overridable); X still active for removal.
- **Q21 — Receipt eyebrow `ORDER SUMMARY` vs existing.** `DEFAULT_PROPOSED` Confirmed canonical; drop `displayId` from receipt body.
- **Q22 — `6 items` row desktop only.** `DEFAULT_PROPOSED` Desktop only as drawn; mobile uses eyebrow `· N items`.
- **Q23 — `Subtotal` vs `Items Total`.** `DEFAULT_PROPOSED` Confirmed rename to `Subtotal`.
- **Q24 — `Delivery (10–25 kg)` label includes tier.** `DEFAULT_PROPOSED` Always shown; for free-delivery (post-threshold) the row reads `Delivery (free)` but free delivery is STUBBED so this is decorative.
- **Q25 — `GST 18%` row.** `RESOLVED_BY_SCOPE` GST STUBBED.
- **Q26 — Total label vs `COD Amount to Collect`.** `DEFAULT_PROPOSED` Drop COD framing; new label is `Total`.
- **Q27 — Wallet refund row removed.** `DEFAULT_PROPOSED` Remove from this screen; wallet schema stays dormant (per scope-cut DROPPED on Wallet UI).
- **Q28 — Comparison panel desktop-only.** `DEFAULT_PROPOSED` Confirm intentional desktop-only.
- **Q29 — Difference sign and color rule.** `DEFAULT_PROPOSED (a)` Red text + `+ Rs. X` when more expensive; green-700 + `− Rs. X` when cheaper.
- **Q30 — Currency formatting (South-Asian grouping).** `RESOLVED_BY_STUB` Currency formatter IN_SCOPE.
- **Q31 — Primary CTA `Add N items to cart`.** `DEFAULT_PROPOSED` Plural form (`Add 1 item to cart` / `Add N items to cart`); when N=0, button reads `Select items` and is disabled.
- **Q32 — Save as new list.** `RESOLVED_BY_SCOPE` Saved shopping lists DROPPED → hide secondary CTA.
- **Q33 — Delivery info pill content.** `DEFAULT_PROPOSED (a)` Hardcoded "2–3 days" copy + city from buyer's default-address; "same MNP partner" claim hidden (no `courierPartner` field exists).
- **Q34 — Mobile sticky bar omits secondary CTA + delivery pill.** `DEFAULT_PROPOSED` Confirm omissions — mobile is intentionally minimal; saved-list cut entirely (Q32).
- **Q35 — Delivery address card removal.** `DEFAULT_PROPOSED` Confirm removal; admin retains historical shipping snapshot via `orders.shipping`* columns.
- **Q36 — Per-parcel status pill / parcel grouping.** `RESOLVED_BY_STUB` Order tracking IN_SCOPE → status moves to tracking surface.
- **Q37 — Per-item Rate button + ReviewDrawer flow.** `RESOLVED_BY_SCOPE` Reviews migration DEFERRED → endpoint stays unwired from any UI.
- **Q38 — Cancellation visualization.** `DEFAULT_PROPOSED` Out of scope on this screen — cancellation surfacing belongs to the tracking screen.
- **Q39 — Loading state.** `DEFAULT_PROPOSED` Skeleton rows in items list using existing `Skeleton` primitive.
- **Q40 — Error state.** `DEFAULT_PROPOSED` Full-page retry card (mirror admin patterns).
- **Q41 — Empty state (zero items in draft).** `DEFAULT_PROPOSED` Disabled CTA + hint "Select items to continue"; no separate empty illustration.
- **Q42 — Role pivot — reorder vs order-detail.** `RESOLVED_BY_STUB` Order tracking IN_SCOPE → tracking lives on a separate screen; `/profile/orders/[id]` is the Reorder screen always.
- **Q43 — Reorder line-item row primitive.** `DEFAULT_PROPOSED (a)` Build a new `<ReorderLineItem>` component (screen-local in `modules/retailer/retailer-reorder/`); don't extend `<CartLineItem>`.
- **Q44 — Stock label primitive vs inline.** `DEFAULT_PROPOSED (b)` Inline text styling per row. No new atom.
- **Q45 — Help / inline callout banner.** `DEFAULT_PROPOSED` Build generic `<Callout variant="info|warning|critical">` in `@repo/ui` since cart + reorder + checkout all use the idiom.
- **Q46 — Mobile sticky bottom bar primitive.** `DEFAULT_PROPOSED (a)` Build shared `<StickyBottomBar>` in `@repo/ui` (used on cart, checkout, reorder, PDP mobile).
- **Q47 — Breadcrumb primitive.** `RESOLVED_BY_STUB` Catalog Breadcrumb IN_SCOPE — install shadcn `breadcrumb` once.
- **Q48 — Page header primitive.** `DEFAULT_PROPOSED` Build shared `<PageHeader>` molecule (eyebrow + title + description + actions row) since admin/buyer screens all use the pattern.

---

## buyer-settings

- **Q1 — Sub-shell route structure.** `RESOLVED_BY_STUB` Settings shell IN_SCOPE. `DEFAULT_PROPOSED (a)` Next.js layout file at `app/(storefront)/profile/settings/layout.tsx`; mobile = same layout, conditionally renders the index at `/profile/settings` and a back-bar at `/profile/settings/[sub]`.
- **Q2 — Breadcrumb component.** `RESOLVED_BY_STUB` Breadcrumb IN_SCOPE. `DEFAULT_PROPOSED (a)` Install shadcn `breadcrumb` and retoken.
- **Q3 — Profile-active default.** `DEFAULT_PROPOSED (a)` Right panel renders only the Saved addresses card (per `02 §7 Q2` only Saved Addresses is in scope).
- **Q4 — Page title hierarchy.** `DEFAULT_PROPOSED (a)` Shell H1 = "Account & settings"; sub-page section H2 = per sub-page.
- **Q5 — Un-implemented sidebar items.** `RESOLVED_BY_SCOPE` Other settings sub-pages DEFERRED per `02 §7 Q2`. `DEFAULT_PROPOSED (a)` Render visible but disabled (greyed, no hover).
- **Q6 — Orders nav row destination.** `DEFAULT_PROPOSED (a)` Keep `/profile/orders` as is; nav row links to it; no route move.
- **Q7 — Logout in sidebar — coexist with header dropdown.** `DEFAULT_PROPOSED (a)` Both available; sidebar logout is one more entry point.
- **Q8 — Page title copy "Account & settings".** `DEFAULT_PROPOSED` Confirm verbatim; MapPin icon dropped from existing page-header.
- **Q9 — Section title casing "Saved addresses" sentence-case.** `DEFAULT_PROPOSED` Adopt sentence case verbatim.
- **Q10 — DEFAULT pill primitive.** `DEFAULT_PROPOSED (b)` Extend `Stamp` with `inverse` variant + `rotated={false}` prop. Smallest delta over a new primitive.
- **Q11 — DEFAULT pill copy.** `DEFAULT_PROPOSED` Adopt all-caps mono "DEFAULT" verbatim.
- **Q12 — Address text composition.** `RESOLVED_BY_STUB` Postal code + province IN_SCOPE. `DEFAULT_PROPOSED (c)` Composed from existing `address` + `city` + new `postalCode` + new `province` fields.
- **Q13 — Postal code field.** `RESOLVED_BY_STUB` Postal code IN_SCOPE. `DEFAULT_PROPOSED` `text` type, optional, no regex (handles non-PK formats).
- **Q14 — Province field.** `RESOLVED_BY_STUB` Postal code + province IN_SCOPE. `DEFAULT_PROPOSED` Free-text `province` column (not enum), optional.
- **Q15 — Recipient name display vs model.** `DEFAULT_PROPOSED (a)` Display-only removal — field stays in form + DB (still snapshotted to `orders.shippingName` at checkout).
- **Q16 — Phone display change.** `DEFAULT_PROPOSED` Confirm font/size/color (mono 12 ink-3); recipient name removed from this row.
- **Q17 — Add address button variant.** `DEFAULT_PROPOSED` Confirm variant change to outline ink + 13/600.
- **Q18 — Edit address UI.** `DEFAULT_PROPOSED (a)` Re-use existing `AddressDialog` modal with title swap "Add address" / "Edit address" and seeded values. Smallest delta.
- **Q19 — Edit API shape.** `DEFAULT_PROPOSED` `PATCH /api/user/addresses/[id]` accepting partial fields; same session+ownership check as POST; `isDefault: true` cascade-unsets others (mirrors POST behavior at `apps/web/src/app/api/user/addresses/route.ts:68-73`).
- **Q20 — Set-as-default UX.** `DEFAULT_PROPOSED (a)` Inside the edit dialog (existing `isDefault` checkbox carried into edit mode).
- **Q21 — Delete address.** `DEFAULT_PROPOSED (b)` Out of scope — addresses immutable post-creation. Avoid the cascade-effects question (`orders` references address by id).
- **Q22 — Add/Edit dialog visual.** `DEFAULT_PROPOSED` Retain existing `AddressDialog` visual; retoken.
- **Q23 — Empty state.** `DEFAULT_PROPOSED (a)` Keep current empty state retoken'd.
- **Q24 — Loading state.** `DEFAULT_PROPOSED` Keep centered `Spinner` from `@repo/ui/components/spinner`.
- **Q25 — Error state.** `DEFAULT_PROPOSED (b)` Toast-only via `sonner` (matches existing pattern).
- **Q26 — Mobile addresses sub-page.** `DEFAULT_PROPOSED (a)` Same desktop card translated to single column, paper-2 default + white non-default cards stacked, App bar with chevron-back.
- **Q27 — Mobile App bar replacement.** `DEFAULT_PROPOSED (a)` Replace storefront header on `/profile/settings/`* mobile screens with the Settings App bar.
- **Q28 — EN/Urdu toggle placement & behavior.** `RESOLVED_BY_STUB` i18n STUBBED → render visible-but-inert.
- **Q29 — `/profile/settings` index route.** `DEFAULT_PROPOSED (a)` `/profile/settings` is the index — renders 5-row list on mobile, redirects to `/profile/settings/addresses` on desktop (or shows a "select a setting" placeholder).
- **Q30 — Version footer.** `DEFAULT_PROPOSED` Read from `NEXT_PUBLIC_APP_VERSION`; show only on the mobile index.
- **Q31 — Card padding 16 → 18.** `DEFAULT_PROPOSED` Use Tailwind `p-[18px]` to match Pencil exactly.
- **Q32 — Card title 14/600 → 15/700.** `DEFAULT_PROPOSED` Adopt 15/700 verbatim.
- **Q33 — Grid columns at intermediate breakpoints.** `DEFAULT_PROPOSED` 2 columns at tablet (768–1024); 1 column on phone; 3 columns at ≥1024.

---

## vendor-dashboard

- **Q1 — "This month" filter pill interaction.** `DEFAULT_PROPOSED (a)` Click opens a dropdown of preset windows (Today / This week / This month / Last month / This year).
- **Q2 — Filter scope.** `DEFAULT_PROPOSED (b)` Re-scopes everything (KPI row + recent orders + low stock + top sellers); chart keeps its own segmented control.
- **Q3 — Sidebar `Settings` entry.** `DEFAULT_PROPOSED (a)` Routes to a placeholder `/vendor/settings` page; ships inert until designed.
- **Q4 — Header eyebrow city.** `DEFAULT_PROPOSED (b)` `vendors.hub` (the MNP hub, matches the "Gujranwala" sample).
- **Q5 — Sales chart segmented labels & states.** `DEFAULT_PROPOSED` Confirm `7D / 30D / 90D` per `screens/vendor-portal.md`; `7D` is active by default; inactive pills have no fill.
- **Q6 — Sales chart day order.** `DEFAULT_PROPOSED (a)` Trailing 7 days ending today (rightmost bar = today).
- **Q7 — Mobile hero drops "This month" + "Add product".** `DEFAULT_PROPOSED (a)` Intentionally removed on mobile; mobile dashboard is read-only.
- **Q8 — Mobile recent orders pill labels.** `DEFAULT_PROPOSED` Confirm — first two cards `NEW` (amber), third `PACKED` (neutral).
- **Q9 — Mobile bottom-tab `Orders` badge.** `DEFAULT_PROPOSED (b)` Design churn — add the badge on mobile too.
- **Q10 — Bell + user-pill behavior.** Bell: `RESOLVED_BY_SCOPE` Notifications DROPPED → render visually inert. User pill: `DEFAULT_PROPOSED (a)` Opens DropdownMenu; logout moves into it.
- **Q11 — Revenue MTD source.** `NEEDS_USER` Real financial decision: which money column counts as "revenue" — gross order value, vendor net (after platform fee), or COD collected. Each yields different numbers and reporting semantics.
A11: lets keep the gross order value for now. might change later
- **Q12 — Active vs draft schema.** `RESOLVED_BY_STUB` Active/Draft product status (light) IN_SCOPE → `products.status enum('active','draft')`.
- **Q13 — Low-stock threshold.** `RESOLVED_BY_STUB` Vendor product enrichment IN_SCOPE → per-product `lowStockThreshold`.
- **Q14 — Order display id format.** `DEFAULT_PROPOSED (b)` Keep `ORD-` prefix in DB; `SH-` is visual placeholder. Smallest delta — no migration.
- **Q15 — Buyer "shop name" field.** `RESOLVED_BY_STUB` `user.businessName` IN_SCOPE.
- **Q16 — Product SKU field.** `RESOLVED_BY_STUB` Vendor product enrichment IN_SCOPE → `sku` text per product, unique per vendor.
- **Q17 — Empty / loading / error per panel.** `DEFAULT_PROPOSED (a)` Whole-card `Skeleton` blocks; per-row skeletons in Recent orders; empty-state copy with action; error toast + Retry on the card.
- **Q18 — Header subtitle desktop vs mobile copy.** `DEFAULT_PROPOSED` Pick desktop wording canonical ("Your shop at a glance — orders, stock, payouts.") on both breakpoints.
- **Q19 — `PAYOUT · PENDING` vs `PAYOUT PENDING`.** `DEFAULT_PROPOSED` Canonicalize on desktop format with the middle dot.
- **Q20 — Chart eyebrow word order.** `DEFAULT_PROPOSED` Canonicalize — `REVENUE · LAST 7 DAYS` on both breakpoints.
- **Q21 — Payouts callout body copy.** `DEFAULT_PROPOSED` Canonical desktop body ("Releases Friday, 2 May to your registered Allied Bank account ending 4291.").
- **Q22 — Sidebar label "Products" vs "My Products".** `DEFAULT_PROPOSED` Adopt "Products" per Pencil.
- **Q23 — Recent orders `Last 5` vs `Last 3`.** `DEFAULT_PROPOSED` Viewport-derived (5 desktop, 3 mobile) — keep the per-breakpoint count.
- **Q24 — `Add Product` sidebar entry removal.** `RESOLVED_BY_SCOPE` Vendor products collapse confirmed in `02 §7 Q11` → delete sidebar entry; retire `/vendor/products/new` route.
- **Q25 — `LogoutButton` placement.** `DEFAULT_PROPOSED` Moved into user-pill dropdown (matches admin chrome behavior).

---

## vendor-ledger

- **Q1 — Copy / microcopy across the screen.** `DEFAULT_PROPOSED` All approved as-is except phone number `0300-SHALMI` (placeholder until real support number is set — Q15 below resolves source).
- **Q2 — Next-payout date format.** `DEFAULT_PROPOSED (a)` Per-surface format helpers (long for ledger hero, short for mobile, KPI form for dashboard tile).
- **Q3 — Source of truth for release date.** `RESOLVED_BY_STUB` Vendor weekly payouts IN_SCOPE. `DEFAULT_PROPOSED (b)` Stored on the active `payout_runs` row as `releasesAt`.
- **Q4 — Active week reads (draft row vs recompute).** `DEFAULT_PROPOSED (a)` Active week has a draft `payout_runs` row (status `pending`) upserted continuously as the week accrues. Cleanest.
- **Q5 — Countdown granularity & re-render.** `DEFAULT_PROPOSED (a)` Days only; static (no client tick); refreshes on navigation.
- **Q6 — Statement download buttons.** `RESOLVED_BY_SCOPE` Statement/CSV STUBBED → render visible but click no-op.
- **Q7 — Cycle window display vs cycle.** `DEFAULT_PROPOSED (a)` Full 7-day cycle (Sat–Fri) per `surface-map §7 Q2`; display label strips weekends to Mon–Fri.
- **Q8 — 7-day return window column.** `DEFAULT_PROPOSED (a)` Reuse `handedAt` with delta against `now`. Smallest delta — no new column.
- **Q9 — Weight format.** `DEFAULT_PROPOSED (a)` Always "X.X kg" (fixed 1-decimal).
- **Q10 — "Returns" deduction semantics.** `DEFAULT_PROPOSED (a)` Recomputed from `sub_orders` totals on read where `status='cancelled'` AND falls in cycle window. No new ledger type.
- **Q11 — "MNP delivery fees" source.** `NEEDS_USER` `sub_orders` cost-breakdown columns weren't enumerated in `01-codebase-map`; user must identify which integer column on `sub_orders` represents MNP fee deductions (or confirm a new ledger type is needed).
A11: lets keep it under courier_cost column.
- **Q12 — Mobile drops `Items packed` / `Weight shipped`.** `DEFAULT_PROPOSED (a)` Confirmed — mobile users see them only in the per-run detail modal.
- **Q13 — IBAN mask format desktop vs mobile.** `DEFAULT_PROPOSED (a)` Both intentional per width — desktop uses 3 mask groups, mobile 2.
- **Q14 — Bank-edit flow.** `RESOLVED_BY_STUB` Vendor self-service bank IN_SCOPE per user override. `DEFAULT_PROPOSED (a)` Dialog modal + OTP confirmation (reuses existing better-auth phone OTP plugin from `apps/web/src/modules/auth/server/services/otp/`).
- **Q15 — Phone number `0300-SHALMI`.** `RESOLVED_BY_STUB` Support phone IN_SCOPE as constant. `DEFAULT_PROPOSED (a)` Hardcoded constant in `packages/constants/src/support.ts`; user supplies real number when ready.
- **Q16 — Mobile policy-block tooltip trigger.** `DEFAULT_PROPOSED (a)` New `info` lucide icon on the bank row triggers a Popover (built on shadcn).
- **Q17 — Pending row stamp + state vs failed/held.** `DEFAULT_PROPOSED (c)` Surface only `pending` and `paid` initially; defer `failed`/`held`/`clearing` to a later phase.
- **Q18 — `payout_runs` ↔ `vendor_ledger.type='payout'` duplication.** `DEFAULT_PROPOSED (a)` Both: `payout_runs` carries display + status; `vendor_ledger` writes one debit row per paid run with `referenceId = payout_runs.id`. Preserves existing ledger as cash-flow authority.
- **Q19 — Lifetime totals source.** `DEFAULT_PROPOSED (a)` Both amount and count over `payout_runs` (consistent with the history table).
- **Q20 — "View older weeks" pagination + mobile-omission.** `DEFAULT_PROPOSED (a)` Intentional — mobile is fixed-window 6 cards; link omitted by design. Pagination: cursor by week-end date.
- **Q21 — Mobile pending-stamp fill `#FBFAF5`.** `DEFAULT_PROPOSED (a)` Authoring slip — should be `$amber-bg`.
- **Q22 — Per-run detail modal layout.** `DEFAULT_PROPOSED (a)` Same Breakdown layout, hydrated from the run snapshot; full row clickable.
- **Q23 — `vendor_ledger.type='penalty'` rows.** `DEFAULT_PROPOSED (c)` Silently subtracted from Net payout math only (no visible row). Penalties are rare and design doesn't draw a row for them.
- **Q24 — `referenceId` / `description` per-line metadata.** `DEFAULT_PROPOSED (a)` Hidden from vendors — admin-only metadata.
- **Q-CHROME-1 — Vendor app shell visual mismatch.** `RESOLVED_BY_STUB` Admin/Vendor chrome revamp IN_SCOPE all per user override → ledger ships against the new chrome.
- **Q-DS-1 — Tooltip primitive missing.** `DEFAULT_PROPOSED (a)` Install shadcn `tooltip` once and retoken (matches `04` add-when-needed convention).
- **Q-DATA-1 — Vendor session payload shape.** `DEFAULT_PROPOSED (b)` Issue a new `GET /api/vendor/me` query (separate from session); cache via React Query. Mirrors how addresses are fetched (`useAddressesQuery`).

---

## vendor-orders

- **Q1 — Mobile bottom tab bar present.** `RESOLVED_BY_STUB` Admin/Vendor chrome revamp IN_SCOPE all per user override → bottom tab bar lives in vendor mobile layout, rendered on this screen.
- **Q2 — Pending-order badge data source.** `RESOLVED_BY_STUB` Vendor sidebar Orders count badge IN_SCOPE. `DEFAULT_PROPOSED (a)` Embedded in existing `GET /api/vendor/orders` payload as a meta field.
- **Q3 — Status segments interaction.** `DEFAULT_PROPOSED (a)` Interactive filters reproducing existing tab behavior; selected state styling re-derived from tokens.
- **Q4 — Status segments counts source + bucketing.** `DEFAULT_PROPOSED` NEW=`pending`, PACKED=`packed`, third tile (COMPLETE/DISPATCHED) = `handed_to_courier + delivered` rollup over a current-week window. Pencil's "286 COMPLETE" is a long-window count; window is configurable later.
- **Q5 — "Later zone" callout meaning.** `DEFAULT_PROPOSED (c)` Static informational footer (no real count behind it). Smallest delta — defer the underlying scheduling concept.
- **Q6 — Per-order detail page tap-through.** `DEFAULT_PROPOSED (a)` No detail page; everything inline (current behavior preserved).
- **Q7 — Giant "Packed ✓" CTA workflow.** `DEFAULT_PROPOSED (b)` CTA contextual per card status — "Packed ✓" for pending → packed; "Handed off ✓" for packed → handed_to_courier; nothing for terminal states.
- **Q8 — Order card line-item layout.** `DEFAULT_PROPOSED (c)` Keep both image + unit price (existing code) — Pencil is illustrative; smallest delta from current row shape.
- **Q9 — Empty / loading / error states.** `DEFAULT_PROPOSED (a)` Re-derive from Pencil tokens (paper-2 cards, hairline rules, no emoji); rewrite copy to English; keep behavior identical.
- **Q10 — Audio + haptic feedback on success.** `DEFAULT_PROPOSED (a)` Keep as-is (`navigator.vibrate` + `/success-ding.wav`).
- **Q11 — Polling cadence.** `DEFAULT_PROPOSED (a)` Keep 5s `refetchInterval`.
- **Q12 — Roman Urdu copy in existing UI.** `RESOLVED_BY_STUB` i18n STUBBED → `DEFAULT_PROPOSED (a)` Replace all Roman Urdu with Pencil English copy; ship language toggle as placeholder.
- **Q13 — Status display labels mapping.** `RESOLVED_BY_STUB` Status display-label mapping IN_SCOPE → use the canonical map (admin-dashboard Q24).
- **Q14 — Order card header time vs status.** `DEFAULT_PROPOSED (b)` Keep both — stamp left of order id, time on right.
- **Q15 — `voSubHd` content.** `NEEDS_USER` Specific content not extracted via `pencil:batch_get`; user should confirm whether `voSubHd` contains an action CTA (Print all / Filter / bulk) or just an eyebrow + count.
A15: yes contains a "Print All Labels" button.

---

## vendor-products

- **Q1 — Stats segments interactivity.** `DEFAULT_PROPOSED (b)` Tappable — clicking a cell sets the status filter; `paper-2` highlight = currently selected.
- **Q2 — Header subtitle promise vs approval gate.** `RESOLVED_BY_SCOPE` Approval workflow STUBBED (draft + active only; no `pending_review`). `DEFAULT_PROPOSED (a)` Edits go live immediately; "Submit for approval" copy adjusted to "Save product"; subtitle keeps "changes go live immediately".
- **Q3 — Mobile chip row vs desktop status dropdown.** `DEFAULT_PROPOSED (a)` Desktop: dropdown only. Mobile: chips only. Both filter the same `status` field; "Low stock" is a derived status (active + stock ≤ threshold).
- **Q4 — `Import CSV` flow.** `NEEDS_USER` Bulk import IN_SCOPE per user override but no flow design exists; user must specify CSV column set + flow surface (modal vs route).
A4: column surface should be decided based on vendor product form so that all needed fields are populated. add a modal for the upload surface, following design.
- **Q5 — Pack size (units) semantics vs Bundle pricing tiers.** `RESOLVED_BY_STUB` Pack-based pricing IN_SCOPE → `packSize` is units inside one wholesale unit (descriptive); `BUY-N` cards are number of wholesale units.
- **Q6 — Net weight unit + scale.** `RESOLVED_BY_STUB` Pack-based pricing IN_SCOPE. `DEFAULT_PROPOSED (a)` Display kg, store grams (multiply by 1000 on submit). DB column unchanged.
- **Q7 — Category model multi vs single.** `DEFAULT_PROPOSED (b)` Keep M2M; designate `products.primaryCategoryId` for list/PDP display; multi-select retained in admin or vendor form depending on UX. Smallest delta — no destructive migration.
- **Q8 — SKU autogeneration `Auto` pill.** `RESOLVED_BY_STUB` Vendor product enrichment IN_SCOPE. `DEFAULT_PROPOSED (a)` Click `Auto` → server generates a unique SKU from brand/name/pack-size; user can override.
- **Q9 — Status taxonomy + approval workflow.** `RESOLVED_BY_SCOPE` Approval workflow STUBBED. `DEFAULT_PROPOSED (b)` Two real statuses (`draft`, `active`); `pending_review` deferred; toggle directly publishes.
- **Q10 — Autosave + Save as draft + Cancel + Submit semantics.** `RESOLVED_BY_SCOPE` Approval autosave STUBBED. `DEFAULT_PROPOSED (b)` Explicit-save — nothing persists until `Save as draft` or `Save product`. `Cancel` discards in-memory changes only. Footer autosave copy hidden.
- **Q11 — Pack pricing card semantics.** `RESOLVED_BY_STUB` Pack-based pricing IN_SCOPE. `DEFAULT_PROPOSED (a)` Wholesale price is `BUY 1` implicit; cards are `units → price` rows; vendor adds N cards; no monotonicity validation server-side; ink-fill is visual hierarchy only.
- **Q12 — Mobile pagination / load behavior.** `DEFAULT_PROPOSED (a)` Infinite scroll fetching pages of 8 under the hood.
- **Q13 — Edit-form transition / Edit-mode title.** `DEFAULT_PROPOSED (a)` Title swaps to `Edit · {product name}`; transition is a smooth scroll to the form section.
- **Q14 — SKU uniqueness scope.** `DEFAULT_PROPOSED (a)` Unique per vendor (a vendor can't have two products with the same SKU). Schema constraint: `UNIQUE (vendor_id, sku)`.
- **Q15 — 4-slot thumb strip + primary-image flag.** `DEFAULT_PROPOSED (b)` No cap; the strip is a 4-up preview of the first 4 in upload order; first is implicitly primary. Smallest delta — no schema change.
- **Q16 — Upload constraints (PNG/JPG, 4 MB, 1000×1000).** `DEFAULT_PROPOSED (a)` Revamp adds size + mime validation server-side at `/api/vendor/upload`; matches the copy.
- **Q17 — Removed list columns: weight + image count.** `DEFAULT_PROPOSED (a)` Intentional — vendor doesn't need weight in the list; image count replaced by 48² thumbnail.
- **Q18 — Single-category list cell vs M2M.** `DEFAULT_PROPOSED` Show `primaryCategoryId` only on the list (per Q7).
- **Q19 — `pencil` icon vs `ellipsis` menu.** `DEFAULT_PROPOSED (c)` Ellipsis decorative for now; only the pencil icon is wired to open the edit form. Smallest delta.
- **Q20 — Mobile ellipsis on each card.** `DEFAULT_PROPOSED (a)` Tap card body → open edit; ellipsis → secondary menu (currently empty / decorative).
- **Q21 — Mobile status pill copy differs from desktop.** `DEFAULT_PROPOSED (a)` Same status enum; presentation differs by surface (desktop = label only, mobile = label + count when applicable). Driven by helpers, not separate fields.
- **Q22 — Mobile `Drafts` chip without count + `Low stock` red.** `DEFAULT_PROPOSED (a)` `Drafts` count omitted when 0; numbered chips show only when > 0. Red treatment on `Low stock` is conditional on count > 0.
- **Q23 — `Cancel` button behavior.** `DEFAULT_PROPOSED (b)` Closes form and discards unsaved changes (matches Q10 explicit-save model).
- **Q24 — Eyebrow `NEW PRODUCT · DRAFT` semantics.** `DEFAULT_PROPOSED (a)` Dynamic, status-driven (`NEW PRODUCT · DRAFT` for fresh row → `EDIT PRODUCT · ACTIVE` once saved active).

---

(End of Phase 0.8 default proposals. Stopping here per instructions — all NEEDS_USER items are surfaced for Pass 3.)