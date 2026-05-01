# Vendor Portal — Pencil Designs

> **Phase:** Design (Pencil)
> **Date:** 2026-05-01
> **Source of design:** `Pencil-Design/Shalmi`
> **Source of behavior:** existing code (not yet wired up)

This artifact tracks the Pencil-side design of the Vendor Portal. The implementation in `apps/web/src/app/vendor/**` is **not** in scope for this entry; behavior must be confirmed before any code change.

---

## Screens delivered

| Screen | Pencil node ID | Frame size |
|---|---|---|
| Vendor · Dashboard · Desktop | `VqlnC` | 1440 × fit_content (~1563) |
| Vendor · Dashboard · Mobile | `L95K24` | 420 × fit_content (~1458) |
| Vendor · Products · Desktop | `H7jii` | 1440 × fit_content |
| Vendor · Products · Mobile | `tXG16` | 420 × fit_content |

All screens follow the `paper`/`ink`/`green` design system in `a2HFrA` and reuse the chrome already established by `Vendor · Orders · Desktop` (`jXwqE`) / `Vendor · Orders · Mobile` (`EEK8K`):
- Desktop: ink top bar (copied from `LslMi`) + 240w white sidebar with `OVERVIEW / CATALOG / OPERATIONS / ACCOUNT` sections.
- Mobile: ink app bar (copied from `fAWNZ`) + bottom tab bar (Dashboard / Products / Orders / Ledger / More).
- The Orders nav item retains its amber `8` pending-order badge across screens.

## Vendor Dashboard

**Desktop layout (`VqlnC` → Body → Sidebar 240 + Main 1200, padding 40/48/80/48, gap 32):**
1. Header — eyebrow `MONDAY · 28 APRIL · GUJRANWALA`, H1 `Saleem Brothers Wholesale`, subtitle, `This month` filter pill, green `Add product` CTA.
2. KPI row (4 cards, fill_container):
   - `ORDERS TODAY` — 12 (8 NEW · 4 PACKED) on amber-bg.
   - `REVENUE · MTD` — ₨ 4,86,300 with green +14% pill.
   - `ACTIVE LISTINGS` — 47 with red `3 LOW STOCK` pill.
   - `PAYOUT · PENDING` — ₨ 1,12,500 on ink, releases Fri 2 May.
3. Sales chart card — `REVENUE · LAST 7 DAYS` ₨ 1,38,420 with 7 paper-3 bars (Saturday highlighted green-2, Monday ink), 7D/30D/90D segmented control.
4. Two-column row:
   - Left (fill_container): `Recent orders` card with 5 rows (status pills NEW / PACKED / DELIVERED).
   - Right (380w): `Low stock` card (3 rows) + `Top sellers · 30 days` card (4 rows).
5. Payouts callout — paper-2 banner with banknote icon, `Next payout · ₨ 1,12,500`, ledger CTA.

**Mobile layout (`L95K24`, 420w, single column, gap derived from per-section padding):**
1. App bar (Dashboard).
2. Hero (eyebrow + `Saleem Brothers` + subtitle).
3. KPI grid 2×2 (amber-bg orders tile, white revenue, white listings, ink payout).
4. Sales chart card with 7 compact bars (Sat green, Mon ink, single-letter labels).
5. Recent orders section (3 cards with NEW/PACKED status pills).
6. Low stock section (3 SKUs).
7. Payouts callout (banknote icon + View ledger button).
8. Bottom tab bar with Dashboard active.

## Vendor Products

**Desktop layout (`H7jii` → Body → Sidebar 240 + Main 1200, padding 40/48/80/48, gap 28, sidebar Products active):**
1. Header — eyebrow `CATALOG · 47 ACTIVE`, H1 `Your products`, subtitle, `Import CSV` button + green `Add product` CTA.
2. Stats segments (4 cells in a single white card with internal dividers): `ALL PRODUCTS 54` (paper-2 highlight), `ACTIVE 47` (green), `LOW STOCK 3` (red), `DRAFTS 4` (ink-2).
3. Product table (single white card):
   - Filter bar — search 320w + `All categories` + `Status: any` + `Sort: newest`.
   - Header row (paper background): PRODUCT (380) / SKU (120) / CATEGORY (140) / PRICE · PKR (120) / STOCK (90) / STATUS (120) / ACTIONS.
   - 8 product rows: thumbnail 48² + name + tagline, columns, status pill (LOW STOCK / ACTIVE / DRAFT), pencil + ellipsis action icons.
   - Footer — `Showing 1–8 of 54 products` + paginator (1 active / 2 / 3).

**Mobile layout (`tXG16`, 420w):**
1. App bar (Products).
2. Hero — eyebrow `CATALOG · 47 ACTIVE`, H1 `Your products`, compact green `+ Add` button, search input.
3. Filter chip row — `All 54` (ink active) / `Active 47` / `Low stock 3` (red) / `Drafts`.
4. Product list — 6 cards: 60² thumb + name + `SKU · price` row + stock pill (red LOW / green IN STOCK / paper-2 DRAFT) + ellipsis action.
6. Bottom tab bar with Products active.

## Sample copy used (placeholder, must be confirmed before code wiring)

- Vendor name: **Saleem Brothers Wholesale** (Gujranwala).
- Buyer names in recent orders: Tariq Kiryana Store (Gujranwala), Bilal General Store (Daska), Hashmi Wholesalers (Sialkot), Yousaf Provision (Wazirabad), Saeed Brothers (Kamoke).
- SKUs / categories used in product list: Sufi Daana 5kg (Grains & Pulses), Tapal Danedar 950g (Tea & Beverages), Olper's Milk 1L 12pk (Dairy), Mitchell's Jam 450g (Spreads & Honey), National Salt 800g (Pantry Staples), Lipton Yellow Label 95g (Tea & Beverages), Dalda Cooking Oil 5L (Oil & Ghee), Nestlé Nido 1+ 900g (Dairy, draft).
- Bank: Allied Bank account ending 4291 (placeholder).

## Open questions for code wiring (not resolved here)

1. **Vendor schema fields** — `STOCK`, `LOW STOCK threshold`, `DRAFT` flag, `payout_pending_amount`, `payout_release_date`, `payout_bank_last4`. Confirm against `packages/database` before wiring.
2. **Status taxonomy** — order statuses on the dashboard (`NEW`, `PACKED`, `DELIVERED`) and product statuses (`ACTIVE`, `LOW STOCK`, `DRAFT`) need to be reconciled with the existing `vendor`/`order` enums.
3. **CSV import button** on the Products header — no behavior spec exists yet, do not implement until confirmed.
4. **Top sellers / Sales chart** — confirm whether vendor analytics endpoints exist; the chart shape is illustrative only.
5. **Bilingual copy** — none of the new screens include Urdu strings yet (the system supports `font-ar` / Noto Nastaliq Urdu); confirm whether vendor-facing surfaces need bilingual treatment like buyer-facing screens.

## Reused / new components

- Reused: `LslMi` (desktop top bar), `fAWNZ` (mobile app bar), `prod1` (`QZyPu`) is **not** used here.
- New ad-hoc patterns introduced (not yet promoted to reusable):
  - Vendor sidebar nav (rebuilt per-screen with the appropriate active item; should be promoted to a reusable component when the next vendor screen lands).
  - Mobile vendor bottom tab bar (same — promote on the next mobile vendor screen).
  - Stats-segments card (4 stats in a single bordered white card with internal dividers — reused on Dashboard KPIs and Products header).
  - Product table row pattern (thumb + name/tagline + columns + status pill + actions).
