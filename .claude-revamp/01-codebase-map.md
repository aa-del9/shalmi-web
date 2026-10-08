# Phase 0 — Codebase Map

> **Phase:** Pre-revamp inventory (read-only)
> **Date produced:** 2026-05-01
> **Source of behavior:** existing code (this map)
> **Source of design:** Pencil files (not consulted in this artifact)

This is a complete-as-of-today map of the Shalmi monorepo. Anything not stated
here is to be treated as unknown — see **Section 7 (Open questions)** before
acting.

---

## 1. Stack & versions

| Concern | Choice | Notes |
|---|---|---|
| Monorepo | pnpm workspace + Turborepo (`turbo` ^2.7.3) | `pnpm-workspace.yaml`: `apps/*`, `packages/**` |
| Package manager | pnpm 9 | `engines.pnpm >=9.0.0` |
| Node | `>=22.0.0 <25.0.0` (`.nvmrc` pins `v22.14.0`) | |
| App framework | **Next.js ^15.0.0**, **App Router** | `apps/web/src/app/`. Dev runs with `--turbopack` on port 5181. |
| React | ^19.0.0 (RC-grade APIs in use, e.g. `use(params)`) | |
| TypeScript | 5.9.x (root pin `5.9.2`, web pins `^5.8.0`) | |
| Styling | **Tailwind CSS v4** (`@tailwindcss/postcss`), **CSS variables** for design tokens, **shadcn/ui** style primitives, `tw-animate-css`, `class-variance-authority`, `tailwind-merge`, `clsx` | Single global stylesheet at `packages/ui/src/styles/globals.css` |
| Component primitives | Radix UI (`@radix-ui/react-*`), `@dnd-kit` (sortable banners), `embla-carousel-react`, `lucide-react`, `sonner` (toasts), `next-themes` | |
| Client state | **Zustand** ^5 (cart, modal stores) — `zustand/middleware.persist` for cart | |
| URL/query state | **nuqs** ^2 with `NuqsAdapter` (search params) | |
| Server data fetching | **@tanstack/react-query** ^5 (with devtools), `@tanstack/react-virtual` for lists | Plus Next.js server components calling DB directly via `@repo/database` |
| HTTP client | **axios** ^1.7 (custom client in `modules/core/utils/axios`), `axios-logger`, plus raw `fetch` in places | |
| Form library | **react-hook-form** ^7.53 + **@hookform/resolvers** + **Zod** ^3.23 | |
| Database | **PostgreSQL** (Supabase-hosted; `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` in turbo globalEnv) | |
| ORM | **Drizzle ORM** ^0.45.1, **drizzle-kit** ^0.31.8, `postgres` ^3.4.8 driver | Two configs: `drizzle-dev.config.ts`, `drizzle-prod.config.ts`; migrations in `packages/database/migrations/` (6 applied) |
| Auth | **better-auth** ^1.2.0 with Drizzle adapter, **phone-number plugin** (OTP via Twilio), email+password also enabled | Twilio creds in turbo globalEnv (`TWILIO_*`). User roles: `admin`, `vendor`, `retailer` (default). |
| File storage | Supabase Storage via `@repo/storage` (`packages/storage/src/client.ts`, `upload.ts`) | |
| Image processing | `sharp` ^0.33, `blurhash` ^2.0 (computed at upload via `modules/core/services/blurhash`) | `next/image` with `remotePatterns` derived from `SUPABASE_URL` |
| Env validation | `@t3-oss/env-nextjs` ^0.11 (`modules/core/env/{client,server}`) | |
| Animations | `motion` (Framer Motion) ^11.11 | |
| Page progress | `nextjs-toploader` ^3.9 | |
| Date | `dayjs` ^1.11 | |
| Misc | `lodash` ^4.17, `uuid` ^11 | |
| Linting | ESLint ^9 flat config via `@repo/eslint-config/next-js`; `prettier` ^3.7 + `prettier-plugin-tailwindcss`; `husky` pre-commit hook | |
| Hosting | Vercel (per-env build/deploy turbo tasks) | |

**Routing strategy.** Next.js App Router. There is **no** `pages/` directory. Three top-level URL groups:

- `(storefront)` route group — public retailer-facing pages and authenticated profile/checkout pages.
- `(auth)` route group — empty `sign-in`/`sign-up` pages (see Open Q1).
- `admin/`, `vendor/`, `auth/` — non-grouped segments.

**Middleware.** `apps/web/src/middleware.ts` runs on `/admin/:path*`, `/vendor/:path*`, `/profile/:path*` (Node runtime) and:
1. Validates session via `auth.api.getSession`.
2. Redirects unauthenticated users to `/auth?redirect=<from>`.
3. Enforces role: admin paths require `role === 'admin'`, vendor paths require `role === 'vendor'`. Mismatches redirect to `/`.

---

## 2. Directory structure

Top level (`/`):

| Path | Purpose |
|---|---|
| `apps/web/` | The Next.js application (sole app today). |
| `packages/ui/` | Shared component library + Tailwind v4 stylesheet & design tokens. |
| `packages/database/` | Drizzle schema, client, migrations, seed scripts. |
| `packages/schemas/` | Cross-app **Zod** schemas (cart, product, checkout, pagination, metadata). |
| `packages/types/` | Shared TS types (`WithChildren`, pagination, Next.js helpers). |
| `packages/utils/` | Shared utils (formatter, math, react-query, slug, image, file, url, etc.). |
| `packages/constants/` | Shared constants (auth, cookies, headers, query, postgres, route params, search-param keys, revalidate tags, time). |
| `packages/contexts/` | React context providers (`stack-navigator`, `user-context`). |
| `packages/hooks/` | Shared React hooks (`use-effect-once`, `use-infinite-scroll`). |
| `packages/storage/` | Supabase Storage client + bucket-name constants + upload helpers. |
| `packages/eslint-config/` | Flat ESLint config presets (next-js, base). |
| `packages/typescript-config/` | Shared `tsconfig` bases. |
| `Pencil Design/` | Pencil .pen design files (encrypted; access via `pencil` MCP only). |
| `Pencil-Design/` | (Empty as of map.) |
| `.claude-revamp/` | Phase artifacts for this revamp project (this file lives here). |
| `.agent/`, `.cursor/` | Pre-existing AI-tooling rule files. |
| `.github/workflows/` | CI for `dev`, `staging`, `prod`, and PR `preview`. |
| `turbo.json`, `vercel.json`, `pnpm-workspace.yaml` | Monorepo plumbing. |

`apps/web/src/`:

| Path | Purpose |
|---|---|
| `app/` | Next.js App Router routes & route handlers (see Section 4). |
| `middleware.ts` | Auth + role gating for `/admin`, `/vendor`, `/profile`. |
| `modules/` | Feature modules (one folder per feature; mirrors many of the screens). See below. |

`apps/web/src/modules/`:

| Path | Purpose |
|---|---|
| `root-layout/` | Top-level RootLayout wrapper, providers (React Query, NuqsAdapter, Sonner toaster), `GlobalModals`, `NextTopLoader`. |
| `core/` | Shared web-app primitives: `api/` (jsonSuccess/jsonError helpers), `constants/` (absolute-routes, app-info, user-roles), `env/` (client + server env via t3-env), `query-client/`, `server-actions/` (helpers only — no `'use server'` files exist yet), `services/` (blurhash, upload-image), `stores/` (modal-store), `utils/` (axios, file, slug, url). |
| `auth/` | `client/auth-client/` (better-auth React client), `server/auth-client/` (better-auth server), `server/guards/` (`require-session`, error constants), `server/services/otp/` (Twilio SMS), `components/` (auth-modal, auth-page-content, logout-button, otp-verification-form, sign-in-button), `utils/`. |
| `storefront/` | Public storefront UI: `components/` (header, footer, hero-carousel, promo-bar, trust-strip, profile-nav, category-section, category-products-grid, best-prices-section, super-savers-section, product-card, product-carousel-section, product-grid-skeleton), `hooks/` (category products query + keys), `utils/` (cached data fetchers used by Server Components). |
| `cart/` | `stores/cart-store.ts` (Zustand + persist), `components/` (add-to-cart-button, cart-item-row, cart-summary, product-detail, quantity-selector), `utils/` (resolve-price, get-product-by-slug), `types.ts`. |
| `checkout/` | `components/delivery-address-section/`, `schemas/` (`checkoutShippingFormSchema`). |
| `user-addresses/` | `index.tsx` plus `components/` (address-card, address-dialog, addresses-list, addresses-page-header), `hooks/` (use-addresses-query, use-create-address-mutation, address-query-keys), `schemas/` (`createAddressSchema`), `types.ts`. |
| `retailer/` | `retailer-orders/` (list) and `retailer-order-detail/` (detail) — components, hooks, query keys for retailer order surfaces. |
| `vendor/` | `vendor-layout/` (sidebar shell), `vendor-orders/` (list, status-update mutation, order-card), `vendor-products/` (table, image-thumbnail, page-header, hooks for products/categories CRUD, plus `modules/add-product/` form). |
| `admin/` | `admin-layout/` (sidebar shell + LogoutButton), `admin-dashboard/`, `admin-categories/` (table, dialog, hooks, schemas), `admin-vendors/` (table, dialog, pagination, hooks, schemas), `admin-promo-banners/` (banners-carousel, available-banners-grid, banner-dialog, hooks, schemas, utils). |
| `promotions/` | `utils/get-cached-banners.ts` (Server-Component cached banner fetcher). |
| `common/` | `components/image-upload/`, `queries/categories/` (shared category queries). |

---

## 3. Design system inventory

### Token sources (single source of truth)

| File | Role |
|---|---|
| `packages/ui/src/styles/globals.css` | **The** design-token file. Tailwind v4 `@import "tailwindcss"`, RGB-channel CSS custom properties for primitives (`--primary-10..100`, `--neutral-white..black`/10..110, `--error-*`, `--success-*`, `--warning-*`, `--shadow`), full semantic-token layer for backgrounds/content/borders/elevation, `.light` + `.dark` themes, shadcn-compat aliases (`--background`, `--foreground`, `--card`, etc.), and a `@theme inline` block exposing everything as Tailwind utilities (color-*, radius-*, shadow-*, drop-shadow-*, text-display/heading/body/label-* with line-heights). Imported by `apps/web/src/app/layout.tsx` via `@repo/ui/globals.css`. |
| `packages/ui/components.json` | shadcn config: style `new-york`, RSC enabled, Lucide icons, baseColor `neutral`, `cssVariables: true`. |
| `packages/ui/postcss.config.mjs`, `apps/web/postcss.config.mjs` | Both load `@tailwindcss/postcss` only. |
| `apps/web/next.config.ts` | `transpilePackages` for all `@repo/*` consumed by web. |
| `apps/web/src/app/layout.tsx` | Imports `@repo/ui/globals.css` and renders `RootLayout`. |

There is **no** `tailwind.config.ts`/`tailwind.config.js`. All tokens live in CSS custom properties under the `@theme` block in `globals.css` (Tailwind v4 style). Dark mode is class-based (`@custom-variant dark (&:is(.dark *))`).

### Primitive / atom components (`packages/ui/src/components/`)

Every file currently exported. (`.gitkeep` excluded.)

| File | Component(s) | One-line description |
|---|---|---|
| `button.tsx` | `Button`, `buttonVariants` | CVA-based button with `default`/`destructive`/`outline`/`secondary`/`ghost`/`link` variants and size scale; supports `asChild` via Radix Slot. |
| `card.tsx` | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` | Surface container family. |
| `carousel.tsx` | `Carousel`, `CarouselContent`, `CarouselItem`, `CarouselPrevious`, `CarouselNext`, `CarouselApi` | Embla-based carousel primitive. |
| `checkbox.tsx` | `Checkbox` | Radix Checkbox wrapper. |
| `dialog.tsx` | `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`, `DialogClose` | Radix Dialog wrapper. |
| `dropdown-menu.tsx` | `DropdownMenu*` family | Radix DropdownMenu wrapper. |
| `field.tsx` | `Field`, `FieldLabel`, `FieldDescription`, `FieldError` (verify exact exports if depending on them) | Form field grouping primitive. |
| `hover-card.tsx` | `HoverCard*` family | Radix HoverCard wrapper. |
| `input.tsx` | `Input` | Styled `<input>`. |
| `label.tsx` | `Label` | Radix Label. |
| `select.tsx` | `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, etc. | Radix Select wrapper. |
| `separator.tsx` | `Separator` | Radix Separator. |
| `sheet.tsx` | `Sheet`, `SheetTrigger`, `SheetContent`, `SheetHeader`, `SheetTitle`, `SheetDescription`, `SheetClose`, `SheetFooter` | Radix Dialog-as-sheet (slide-over panel). |
| `sidebar.tsx` | `SidebarProvider`, `Sidebar`, `SidebarInset`, `SidebarTrigger`, plus inner pieces | shadcn sidebar shell used by admin & vendor layouts. |
| `skeleton.tsx` | `Skeleton` | Loading shimmer block. |
| `sonner.tsx` | `Toaster` (sonner re-export, themed) | Sonner toast host. |
| `spinner.tsx` | `Spinner` | Loading spinner icon. |
| `table.tsx` | `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableHead`, `TableRow`, `TableCell`, `TableCaption` | Styled HTML table primitives. |

Helpers:

| File | Purpose |
|---|---|
| `packages/ui/src/lib/utils.ts` | `cn` (clsx + tailwind-merge). |
| `packages/ui/src/hooks/` | Empty (only `.gitkeep`). |

### App-level "compound" components (live in `apps/web/src/modules/**/components/`)

These are not in `@repo/ui`; they are app-feature components. Notable ones the revamp will likely touch:

- **Storefront:** `header`, `footer`, `hero-carousel`, `promo-bar`, `trust-strip`, `category-section`, `category-products-grid`, `best-prices-section`, `super-savers-section`, `product-card`, `product-carousel-section`, `product-grid-skeleton`, `profile-nav`.
- **Cart/checkout:** `cart-item-row`, `cart-summary`, `quantity-selector`, `add-to-cart-button`, `product-detail`, `delivery-address-section`.
- **Auth:** `auth-modal`, `auth-page-content`, `otp-verification-form`, `sign-in-button`, `logout-button`.
- **Admin:** `admin-sidebar`, `categories-table` (+ skeleton + page header + dialog), `vendors-table` (+ skeleton + page header + dialog + pagination), `banners-carousel`, `available-banners-grid`, `banner-dialog`.
- **Vendor:** `vendor-sidebar`, vendor `order-card`, `product-table` (+ skeleton), `product-image-thumbnail`, `product-categories-cell`, `product-list-page-header`, plus `add-product-form`.
- **Retailer (profile):** `order-card`, `parcel-box`, `receipt-card`, `review-drawer`.
- **User addresses:** `address-card`, `address-dialog`, `addresses-list`, `addresses-page-header`.
- **Common:** `image-upload`.

---

## 4. Screen inventory

Conventions:
- "Auth" column = enforced by `middleware.ts` (✅ middleware) or per-page logic.
- Server Component (SC) vs Client Component (CC) based on top-of-file directive.
- `(storefront)` & `(auth)` are Next.js route groups (do not appear in URLs).

### Storefront (public + customer)

| Route | File | SC/CC | Auth | Purpose | Major components | Data dependencies |
|---|---|---|---|---|---|---|
| `/` | `app/(storefront)/page.tsx` | SC | None | Home: hero carousel + best prices + popular categories + super savers + more categories. | `HeroCarousel`, `BestPricesSection`, `CategorySection` (×2), `SuperSaversSection` | `getCachedBanners()` → `/api/banners` data layer; `getCachedCategories()` → categories data layer. |
| `(storefront layout)` | `app/(storefront)/layout.tsx` | SC, `dynamic = 'force-dynamic'` | — | Shell for storefront. | `StorefrontHeader`, `StorefrontFooter` | Header reads session via `useSession` & cart via `useCartStore`. |
| `/cart` | `app/(storefront)/cart/page.tsx` | CC | None | Shopping cart view; empty state + line items + summary. | `Button`, `Separator`, `CartItemRow`, `CartSummary` | `useCartStore` (Zustand persisted). |
| `/checkout` | `app/(storefront)/checkout/page.tsx` | CC | Per-page redirect to `/auth?redirect=/checkout` | Choose saved address or enter shipping form, review items, place COD order. | `DeliveryAddressSection`, `Card`, `Button`, react-hook-form | `useSession`, `useCartStore`, `useAddressesQuery` (`GET /api/user/addresses`), `POST /api/checkout` to place order, navigates to `/checkout/success`. |
| `/checkout/success` | `app/(storefront)/checkout/success/page.tsx` | CC | None (but reached after order placed) | Confirmation screen showing display order ID. | `Button`, `Card` | Reads `displayId` from search params. |
| `/categories/[slug]` | `app/(storefront)/categories/[slug]/page.tsx` | SC, generateMetadata | None | Category landing with product grid. | `CategoryProductsGrid` | `getCategoryBySlug(slug)` then client-side React Query (`use-category-products-query`) hits `/api/categories/[id]/products`. |
| `/products/[slug]` | `app/(storefront)/products/[slug]/page.tsx` | SC, generateMetadata | None | Product detail page. | `ProductDetail` | `getProductBySlug(slug)` (server util in `modules/cart/utils/`). |
| `/profile/addresses` | `app/(storefront)/profile/addresses/page.tsx` | CC | ✅ middleware (`/profile/*`) | List/create/edit user addresses. | `UserAddresses` (which renders `AddressesPageHeader`, `AddressesList`, `AddressDialog`) | `useAddressesQuery` (`GET /api/user/addresses`), `useCreateAddressMutation` (`POST /api/user/addresses`). |
| `/profile/orders` | `app/(storefront)/profile/orders/page.tsx` | CC | ✅ middleware | Retailer order history. | `RetailerOrders` (renders `OrderCard`s) | `useRetailerOrdersQuery` → `GET /api/retailer/orders`. |
| `/profile/orders/[id]` | `app/(storefront)/profile/orders/[id]/page.tsx` | CC | ✅ middleware | Single order detail with parcels and review drawer. | `RetailerOrderDetail` (`ParcelBox`, `ReceiptCard`, `ReviewDrawer`) | `useRetailerOrderDetailQuery` → `GET /api/retailer/orders/[id]`; `useSubmitReviewMutation` → `POST /api/retailer/reviews`. |

### Auth (top-level `app/auth/` + empty `(auth)` group)

| Route | File | SC/CC | Auth | Purpose | Major components | Data dependencies |
|---|---|---|---|---|---|---|
| `/auth` | `app/auth/page.tsx` | CC | Public | Phone-number sign-in entry. | `AuthPageContent` (Suspense-wrapped) | better-auth client (`useSession`, OTP send) — see Open Q3. |
| `/auth/otp` | `app/auth/otp/page.tsx` | CC | Public | OTP verification step. | `OtpVerificationForm` | better-auth `verifyPhoneNumber` flow. |
| `/sign-in` | `app/(auth)/sign-in/page.tsx` | SC | Public | **Empty stub** — returns `<div />`. | — | — (see Open Q1). |
| `/sign-up` | `app/(auth)/sign-up/page.tsx` | SC | Public | **Empty stub** — returns `<div />`. | — | — (see Open Q1). |
| `(auth layout)` | `app/(auth)/layout.tsx` | SC | — | Center children in viewport. | — | — |

### Admin (role: `admin`, gated by middleware)

| Route | File | SC/CC | Auth | Purpose | Major components | Data dependencies |
|---|---|---|---|---|---|---|
| `/admin` | `app/admin/page.tsx` | SC | ✅ middleware (admin) | Permanent redirect → `/admin/dashboard`. | — | — |
| `(admin layout)` | `app/admin/layout.tsx` + `modules/admin/admin-layout/index.tsx` | SC | — | Sidebar shell with `AdminSidebar`, header with `LogoutButton`. | `SidebarProvider`, `AdminSidebar`, `SidebarInset`, `SidebarTrigger`, `LogoutButton` | — |
| `/admin/dashboard` | `app/admin/dashboard/page.tsx` → `AdminDashboard` | SC wrapper, CC body | ✅ admin | Admin landing page. | `AdminDashboard` | (Verify: appears placeholder — see Open Q4.) |
| `/admin/categories` | `app/admin/categories/page.tsx` → `AdminCategories` | CC | ✅ admin | List + create/update categories. | `CategoriesPageHeader`, `CategoriesTable` (+ skeleton), `CategoryDialog` | `useCategoryQuery` → `GET /api/categories`; `useCreateCategoryMutation` → `POST /api/admin/categories`; `useUpdateCategoryMutation` → `PATCH /api/admin/categories/[id]`; image upload → `POST /api/admin/upload/categories`. |
| `/admin/promo-banners` | `app/admin/promo-banners/page.tsx` → `AdminPromoBanners` | CC | ✅ admin | Manage promo banners: active carousel + available grid + reorder/replace + bulk save. | `BannersCarousel` (dnd-kit sortable), `AvailableBannersGrid`, `BannerDialog`, `Button`, `Spinner` | `useBannersQuery` → `GET /api/admin/banners`; `useCreateBannerMutation` → `POST /api/admin/banners`; `useBulkUpdateBannersMutation` → `PUT /api/admin/banners/bulk`; image upload → `POST /api/admin/upload/promo-assets`. |
| `/admin/vendors` | `app/admin/vendors/page.tsx` → `AdminVendors` | CC | ✅ admin | Paginated vendor list + create/update vendor (with bank details). | `VendorsPageHeader`, `VendorsTable` (+ skeleton), `VendorsPagination`, `VendorDialog` | `useAdminVendors`/`useVendorsQuery` → `GET /api/admin/vendors`; `useVendorQuery` → `GET /api/admin/vendors/[id]`; `useCreateVendorMutation` → `POST /api/admin/vendors`; `useUpdateVendorMutation` → `PATCH /api/admin/vendors/[id]`. |

### Vendor (role: `vendor`, gated by middleware)

| Route | File | SC/CC | Auth | Purpose | Major components | Data dependencies |
|---|---|---|---|---|---|---|
| `/vendor` | `app/vendor/page.tsx` | SC | ✅ vendor | Permanent redirect → `/vendor/dashboard`. | — | — |
| `(vendor layout)` | `app/vendor/layout.tsx` + `modules/vendor/vendor-layout/index.tsx` | SC | — | Sidebar shell with `VendorSidebar`. | `VendorSidebar` (+ shared sidebar primitives) | — |
| `/vendor/dashboard` | `app/vendor/dashboard/page.tsx` | SC | ✅ vendor | Static placeholder copy ("Use the sidebar…"). | — | — (see Open Q5.) |
| `/vendor/products` | `app/vendor/products/page.tsx` → `VendorProducts` | CC | ✅ vendor | List vendor's products with table + thumbnails + categories. | `ProductListPageHeader`, `ProductTable` (+ skeleton), `ProductImageThumbnail`, `ProductCategoriesCell` | `useVendorProductsQuery` → `GET /api/vendor/products`; `useVendorCategoriesQuery` → `GET /api/categories`. |
| `/vendor/products/new` | `app/vendor/products/new/page.tsx` | SC | ✅ vendor | Create product. | `AddProductForm` | `useCreateProductMutation` → `POST /api/vendor/products`; `POST /api/vendor/upload`. |
| `/vendor/products/[id]/edit` | `app/vendor/products/[id]/edit/page.tsx` | CC (uses `useParams`) | ✅ vendor | Edit existing product (same form, prefilled). | `AddProductForm` | `useVendorProductQuery` → `GET /api/vendor/products/[id]`; `useUpdateProductMutation` → `PATCH /api/vendor/products/[id]`. |
| `/vendor/orders` | `app/vendor/orders/page.tsx` → `VendorOrders` | CC | ✅ vendor | Vendor's sub-orders list with status update. | `OrderCard` | `useVendorOrdersQuery` → `GET /api/vendor/orders`; `useUpdateSubOrderStatusMutation` → `PATCH /api/vendor/orders/[subOrderId]`. |

### Routes implied but not present

- `/search` is referenced by the storefront header form (`<form action="/search">`) but no `app/(storefront)/search/page.tsx` exists. See Open Q6.
- `/vendor/ledger` exists in `ABSOLUTE_ROUTES.VENDOR_LEDGER` but there is no route file.

---

## 5. Schema & types

### Drizzle (PostgreSQL) — `packages/database/src/schema/`

All tables exported from `packages/database/src/schema/index.ts` (re-exported by `@repo/database`). Field lists below are high-level.

| Table | File | Key fields (high level) |
|---|---|---|
| `user` | `auth.ts` | `id` (text PK), `name`, `email`, `emailVerified`, `image`, `phoneNumber` (unique), `phoneNumberVerified`, `role` (default `'retailer'` — but middleware checks `'admin'`/`'vendor'`), `createdAt`, `updatedAt`. |
| `session` | `auth.ts` | `id`, `userId` → user, `token` (unique), `expiresAt`, `ipAddress`, `userAgent`, timestamps. |
| `account` | `auth.ts` | Better-Auth account: `userId`, `accountId`, `providerId`, OAuth tokens, `password`, etc. |
| `verification` | `auth.ts` | Better-Auth verification tokens. |
| `addresses` | `addresses.ts` | `id` (uuid), `userId`, `title`, `recipientName`, `recipientPhone`, `address`, `city`, `isDefault`, timestamps. |
| `vendors` | `vendors.ts` | `id`, `userId` (1:1 to user), `shopName`, `city`, `hub`, `bankName`, `accountTitle`, `iban`, `isActive`, timestamps. |
| `products` | `products.ts` | `id`, `vendorId`, `name`, `slug` (unique), `weightGrams`, `images` (jsonb `{ url, blurHash }[]`), `stock`, `version`, timestamps. |
| `product_price_tiers` | `product-price-tiers.ts` | `id`, `productId`, `minQty`, `maxQty` (nullable for "and above"), `priceCents`, timestamps. |
| `categories` | `categories.ts` | `id`, `name`, `slug` (unique), `imageUrl`, timestamps. |
| `product_categories` | `product-categories.ts` | Composite PK `(productId, categoryId)`. Many-to-many. |
| `orders` | `orders.ts` | `id`, `displayId` (unique, e.g. `ORD-…`), `userId`, shipping snapshot fields, `addressId`, `totalItemsCost`, `totalShippingCost`, `grandTotal`, `status` (`processing`/`partially_fulfilled`/`completed`), timestamps. |
| `sub_orders` | `sub-orders.ts` | `id`, `orderId`, `vendorId`, `status` (`pending`/`packed`/`handed_to_courier`/`delivered`/`cancelled`), `courierTrackingId`, `weightGrams`, COD/payout/cost breakdown ints, `handedAt`, timestamps. |
| `order_items` | `order-items.ts` | `id`, `subOrderId`, `productId`, `quantity`, snapshot `unitPrice` and `totalPrice`, `createdAt`. |
| `wallet` | `wallet.ts` | `id`, `userId` (unique), `balanceCents`, timestamps. |
| `vendor_ledger` | `vendor-ledger.ts` | `id`, `vendorId`, `direction` (`credit`/`debit`), `amount`, `type` (`sale_revenue`/`logistics_reimbursement`/`payout`/`penalty`), `referenceId`, `description`, `createdAt`. |
| `product_reviews` | `product-reviews.ts` | `id`, `productId`, `retailerId`, `rating`, `comment`, `createdAt`. Unique `(retailerId, productId)`. |
| `promotional_banners` | `promotional-banners.ts` | `id`, `title`, `imageUrl`, `targetUrl`, `isActive`, `displayOrder`, timestamps. |
| `admin_audit_log` | `admin-audit-log.ts` | `id`, `adminId`, `action`, `targetType`, `targetId`, `metadata` (jsonb), timestamps. |

Drizzle relations are declared in `relations.ts` (categories, products, productCategories, productPriceTiers, orders, subOrders, orderItems, etc.).

### Zod schemas

**Cross-app (`packages/schemas/src/`):**

- `cart/line-item.ts` — `lineItemSchema` ({productId, quantity}), `lineItemsArraySchema`.
- `catalog/product.ts` — `productImageSchema` ({url, blurHash}), `createProductSchema`, `updateProductSchema` (extends partial of create with `id`/`slug`).
- `catalog/product-price-tiers.ts` — `productPriceTiersFormSchema` (form-side), `createProductPriceTiersSchema` (API-side, requires last tier `maxQty:null`, prices strictly decreasing, no gaps).
- `orders/checkout.ts` — `shippingAddressSchema`, `checkoutCartPayloadSchema` (requires `addressId` OR `shippingAddress`).
- `metadata/index.ts` — `timestampFieldsSchema`, `softDeleteFieldsSchema`, `baseEntitySchema`, `auditFieldsSchema`, `seoMetadataSchema`, `slugSchema` (kebab-case regex), `emailSchema`, `phoneSchema` (E.164-ish), `urlSchema`, `uuidSchema`.
- `page-based-pagination/index.ts` — `paginationMetaSchema`, `paginationParamsSchema`, `createPaginatedResponseSchema<T>`, cursor variants.
- `service-error-response/index.ts` — (header-only stub on inspection — verify if you need it; see Open Q7).

**App-side (`apps/web/src/modules/**/schemas/`):**

- `admin/admin-categories/schemas` — `createCategorySchema` ({name, imageUrl?}), `updateCategorySchema` (partial).
- `admin/admin-promo-banners/schemas` — `createBannerSchema` ({title, imageUrl, targetUrl? — must be internal path `/…`}), `bulkUpdateBannerSchema`, `bulkUpdateBannersPayloadSchema`.
- `admin/admin-vendors/schemas` — `bankDetailsSchema`, `createVendorSchema` ({phoneNumber, shopName, marketHub, bankDetails}), `updateVendorSchema` (extends with `isActive`).
- `checkout/schemas` — `checkoutShippingFormSchema` ({name, phone (≥10), address, city}).
- `user-addresses/schemas` — `createAddressSchema` ({title, recipientName, recipientPhone, address, city, isDefault?}).

### TS types

- `packages/types/src/common/index.ts` — `WithChildren`, etc.
- `packages/types/src/next/index.ts` — Next.js helpers.
- `packages/types/src/pagination-params/index.ts` — pagination param types.
- Per-feature types live next to features (e.g. `modules/cart/types.ts`, `modules/storefront/types.ts`, `modules/admin/admin-categories/types.ts`, etc.).

---

## 6. API surface

All routes live under `apps/web/src/app/api/`. Methods listed are those actually exported.

### Auth

| Method(s) | Route | Notes |
|---|---|---|
| GET, POST | `/api/auth/[...all]` | better-auth catch-all (`toNextJsHandler(auth)`). |

### Storefront / Public

| Method(s) | Route | Notes |
|---|---|---|
| GET | `/api/banners` | Public banner list (active, sorted). |
| GET | `/api/categories` | Category list. |
| GET | `/api/categories/[id]` | Single category. |
| GET | `/api/categories/[id]/products` | Paginated products in a category. |
| GET | `/api/products/[slug]` | Product detail by slug. |

### Cart / Checkout

| Method(s) | Route | Notes |
|---|---|---|
| POST | `/api/checkout` | Validates `checkoutCartPayloadSchema`, requires session, creates `orders` + `sub_orders` + `order_items` (groups items by vendor; generates `displayId`). |

### User (authed retailer)

| Method(s) | Route | Notes |
|---|---|---|
| GET, POST | `/api/user/addresses` | List + create user addresses. |

### Retailer (authed)

| Method(s) | Route | Notes |
|---|---|---|
| GET | `/api/retailer/orders` | Retailer's order list. |
| GET | `/api/retailer/orders/[id]` | Retailer's order detail. |
| POST | `/api/retailer/reviews` | Submit a product review. |

### Vendor (role: vendor)

| Method(s) | Route | Notes |
|---|---|---|
| GET, POST | `/api/vendor/products` | List vendor's products + create. |
| GET, PATCH | `/api/vendor/products/[id]` | Vendor product detail + update. |
| GET | `/api/vendor/orders` | Vendor's sub-orders list. |
| PATCH | `/api/vendor/orders/[subOrderId]` | Update sub-order status (`pending`→`packed`→`handed_to_courier`→`delivered`/`cancelled`). |
| POST | `/api/vendor/upload` | Vendor product image upload (Supabase Storage). |

### Admin (role: admin)

| Method(s) | Route | Notes |
|---|---|---|
| GET, POST | `/api/admin/banners` | Admin banner list + create. |
| PUT | `/api/admin/banners/bulk` | Bulk-update active set/order. |
| POST | `/api/admin/categories` | Create category (note: GET goes through public `/api/categories`). |
| PATCH | `/api/admin/categories/[id]` | Update category. |
| GET, POST | `/api/admin/vendors` | Admin paginated vendor list + create vendor. |
| GET, PATCH | `/api/admin/vendors/[id]` | Admin vendor detail + update (incl. `isActive`). |
| POST | `/api/admin/upload/categories` | Category image upload. |
| POST | `/api/admin/upload/promo-assets` | Promo banner image upload. |

### Infra

| Method(s) | Route | Notes |
|---|---|---|
| POST | `/api/revalidate` | Cache revalidation hook. |
| (none) | `/api/dev/seed-vendor` | Folder exists with no `route.ts` — see Open Q8. |

### Server actions

There are **no `'use server'` files** anywhere under `apps/web/src/`. The directory `modules/core/server-actions/` contains shared helpers (`pagination.ts`, `types.ts`, `index.ts` re-exports) but no actual server actions. All mutations are React Query mutations against the route handlers above (or in the case of `/checkout`, raw `fetch`).

### Server-side data fetchers (used directly from Server Components)

- `modules/promotions/utils/get-cached-banners.ts`
- `modules/storefront/utils/get-cached-categories.ts`
- `modules/storefront/utils/get-category-by-slug.ts`
- `modules/cart/utils/get-product-by-slug.ts`

These call into `@repo/database` (Drizzle) directly without going through `/api`.

---

## 7. Open questions for me

Numbered for easy reference.

1. **`(auth)/sign-in` and `(auth)/sign-up` are empty `<div />` stubs** while the real auth flow lives at `/auth` and `/auth/otp`. Is the `(auth)` group dead code that should be deleted/ignored during the revamp, or are those routes intentionally reserved for an upcoming email/password flow we should design? The current production sign-in path appears to be **phone-only via `/auth` → `/auth/otp`**.

2. **Auth flow specifics.** The Pencil designs will likely show a sign-in screen — should the revamp target the existing `/auth` (phone+OTP) flow, or is the design introducing email/password as well? `better-auth` is configured with `emailAndPassword.enabled: true`, but I see no UI for it.

3. **`AuthPageContent` and `OtpVerificationForm` internal copy/labels** — I haven't read them in depth. Before the revamp touches `/auth` we should diff existing copy/microcopy against the Pencil design (per CLAUDE.md rule: don't change copy silently).

4. **`/admin/dashboard` content** — `AdminDashboard` is rendered but I have not opened it. Is it a meaningful dashboard (KPIs, charts) or a placeholder? The revamp implications differ a lot.

5. **`/vendor/dashboard` is hardcoded placeholder copy** ("Use the sidebar to navigate…"). Pencil presumably has a real dashboard for vendors — should the revamp implement it, or keep the placeholder until backend metrics exist?

6. **`/search` route is referenced by the storefront header (`<form action="/search">`) but does not exist.** Is search in scope for this revamp? If so, what data layer (Drizzle full-text? a new endpoint?) do we expect — there's nothing in the current API to back it.

7. **`packages/schemas/src/service-error-response/index.ts`** — file appears to be a comment-only stub on quick inspection. Confirm whether it's load-bearing before any cleanup.

8. **`/api/dev/seed-vendor`** folder exists but contains no `route.ts`. Stale, or work-in-progress?

9. **`/vendor/ledger` is in `ABSOLUTE_ROUTES.VENDOR_LEDGER` but has no page** and there's a `vendor_ledger` DB table + `LogisticsReimbursement`/`Payout` business logic implied by `sub_orders`. Does the Pencil design include a vendor ledger screen? If yes, this is a brand-new screen, not a revamp.

10. **Wallet model exists but no UI.** `wallet` table tracks `balanceCents` per user; nothing in `app/` references it. Is wallet in-scope for the revamp?

11. **Product reviews** — there's a `POST /api/retailer/reviews` endpoint and a `ReviewDrawer` component, but no public review *display* surface (e.g., on `/products/[slug]`). Does the Pencil design show product ratings/reviews on the PDP? If so, we need a `GET` endpoint plus rendering, neither of which exists.

12. **Theming.** `globals.css` defines a full `.dark` token set and there's a `next-themes` dependency, but I see no theme toggle UI and no `<ThemeProvider>` wired in `root-layout/providers/index.tsx`. Is dark mode in scope for the revamp, or are dark tokens currently unreachable?

13. **Currency / locale.** Prices are stored as `priceCents` integers; `formatPrice` formatting hasn't been inspected in depth. Does the design specify currency symbol (PKR vs $), thousands separators, decimal handling? COD copy says "Cash on Delivery" — confirm whether the design uses different wording or i18n.

14. **Empty/loading/error states.** Many pages have ad-hoc spinners and toasts. The revamp will need explicit guidance for each surface — should I assemble a per-screen state inventory in a follow-up artifact, or will Pencil provide explicit empty/error/loading frames per screen?

15. **Mobile layout.** Most pages use `max-w-7xl` desktop-first containers. Is this revamp also a mobile redesign, or strictly desktop fidelity to Pencil?

16. **Two design folders at repo root: `Pencil Design/` (with `Shalmi`, `Shalmi - Copy.pen`) and an empty `Pencil-Design/`.** Which is canonical for this revamp, and is `Shalmi - Copy.pen` an outdated backup that should be ignored?

---

(End of Phase 0 codebase map. Stopping here per instructions — not starting Phase 1.)
