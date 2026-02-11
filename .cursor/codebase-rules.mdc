---
trigger: always_on
---

# Shaalmi Monorepo - Codebase standards

You are an senior frontend engineer working on the **Shaalmi B2B Ecommerce Platform**, a Next.js monorepo built with Turborepo. This rule defines the architecture, conventions, and standards you must follow when implementing features, fixing bugs, or maintaining code.

---

## 1. Architecture Overview

### Monorepo Structure

| Directory                    | Purpose                             |
| ---------------------------- | ----------------------------------- |
| `apps/web`                   | Next.js 15 application (App Router) |
| `packages/ui`                | Shared UI components (Shadcn/Radix) |
| `packages/hooks`             | Reusable React hooks                |
| `packages/constants`         | Application-wide constants          |
| `packages/utils`             | Shared utility functions            |
| `packages/types`             | TypeScript type definitions         |
| `packages/schemas`           | Zod validation schemas              |
| `packages/contexts`          | Shared React Context providers      |
| `packages/eslint-config`     | Shared ESLint configuration         |
| `packages/typescript-config` | Shared TypeScript configs           |

### Technology Stack

- **Framework**: Next.js 15 (App Router, React 19)
- **Styling**: Tailwind CSS v4 (CSS-first configuration)
- **UI Library**: Shadcn UI (Radix primitives + Tailwind)
- **Data Fetching**: TanStack React Query + Axios
- **State Management**: Zustand (global), nuqs (URL state)
- **Forms**: React Hook Form + Zod + @hookform/resolvers
- **Animations**: Motion (Framer Motion)
- **Toasts**: Sonner

---

## 2. Feature-Module Pattern

### CRITICAL: Modules Over Layers

Code in `apps/web/src` is organized by **feature**, not by technical layer. Never create top-level `components/`, `hooks/`, or `utils/` folders in `src/`.

```text
src/modules/
├── core/                   # Core application logic
│   ├── env/               # Environment validation
│   ├── constants/         # App-specific constants
│   └── utils/             # App-specific utilities
├── auth/                   # Authentication feature
│   ├── components/
│   ├── hooks/
│   ├── server/            # Server actions
│   └── index.ts
├── products/               # Products feature
│   ├── components/
│   ├── hooks/
│   ├── services/          # API calls
│   └── types/
└── root-layout/           # Global layout providers
```

### When Creating a New Feature Module

1. Create folder: `src/modules/{feature-name}/`
2. Add internal structure as needed: `components/`, `hooks/`, `server/`, `types/`
3. Create `index.ts` barrel export
4. Import in pages using `@/modules/{feature-name}`

---

## 3. Package Import Rules

### Subpath Exports Pattern

All shared packages use **subpath exports**. Import from specific modules, never from the package root:

```typescript
// ✅ CORRECT - Specific subpath import
import { shuffleArray } from '@repo/utils/array';
import { COOKIE_KEYS } from '@repo/constants/cookie-keys';
import type { WithChildren } from '@repo/types/common';
import { useEffectOnce } from '@repo/hooks/use-effect-once';
import { paginationParamsSchema } from '@repo/schemas/page-based-pagination';

// ❌ WRONG - Root imports don't exist
import { shuffleArray } from '@repo/utils';
```

### Import Order Convention

Organize imports in this order with blank lines between groups:

```typescript
// 1. React/Next.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. External libraries
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

// 3. Workspace packages (@repo/*)
import { Button } from '@repo/ui/button';
import { cn } from '@repo/ui/utils';
import type { WithChildren } from '@repo/types/common';
import { formatCurrency } from '@repo/utils/formatter';

// 4. Internal modules (@/modules/*)
import { useAuth } from '@/modules/auth';
import { ProductCard } from '@/modules/products/components';

// 5. Relative imports
import { localHelper } from './helpers';
import type { LocalType } from './types';
```

---

## 4. Environment Variables

### CRITICAL: Never Use `process.env` Directly

All environment variables must be accessed through the typed env modules:

```typescript
// ✅ CORRECT
import { clientEnv } from '@/modules/core/env';
const apiUrl = clientEnv.NEXT_PUBLIC_API_URL;

// ❌ WRONG
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

### Adding New Environment Variables

1. Client-side (browser-safe): Add to `src/modules/core/env/client.ts`
2. Server-side only: Add to `src/modules/core/env/server.ts`
3. Prefix client variables with `NEXT_PUBLIC_`

---

## 5. Component Development

### File Naming

- Components: `kebab-case.tsx` (be consistent within a module)
- Hooks: `use-{name}.ts` (always kebab-case with `use-` prefix)
- Utilities: `kebab-case.ts`
- Types: `types.ts` or `{feature}.types.ts`

### Component Structure

```typescript
"use client"; // Only if needed - prefer Server Components

import { type FC } from "react";
import { cn } from "@repo/ui/utils";
import type { WithClassName } from "@repo/types/common";

interface ProductCardProps extends WithClassName {
  product: Product;
  onSelect?: (id: string) => void;
}

export const ProductCard: FC<ProductCardProps> = ({
  product,
  onSelect,
  className,
}) => {
  return (
    <div className={cn("rounded-lg border p-4", className)}>
      {/* Component content */}
    </div>
  );
};
```

### UI Component Guidelines

1. **Use Shadcn components** from `@repo/ui/*` when available. Proceed to add component to repo if not available.
2. **Use `cn()` utility** for class merging: `cn("base-classes", className, conditionalClass && "applied")`
3. **Accept `className` prop** on all reusable components using `WithClassName` type
4. **Prefer Server Components** - only add `"use client"` when absolutely needed

---

## 6. Data Fetching Patterns

### React Query for Client-Side Data

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { getInfiniteQueryData } from '@repo/utils/react-query';

// Query keys should be structured arrays
const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: ProductFilters) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

export const useProducts = (filters: ProductFilters) => {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => fetchProducts(filters),
  });
};
```

### Server Actions for Mutations

```typescript
// src/modules/products/server/actions.ts
'use server';

import { revalidateTag } from 'next/cache';
import { REVALIDATE_TAGS } from '@repo/constants/revalidate-tags';

export async function createProduct(data: CreateProductInput) {
  // Validate with Zod
  const validated = createProductSchema.parse(data);

  // Perform mutation
  const result = await api.products.create(validated);

  // Revalidate cache
  revalidateTag(REVALIDATE_TAGS.PRODUCTS);

  return result;
}
```

---

## 7. Form Handling

### Standard Form Pattern

```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormValues = z.infer<typeof formSchema>;

export const LoginForm = () => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: FormValues) => {
    // Handle submission
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
};
```

---

## 8. Adding to Shared Packages

### When to Add to Packages

| Add to Package    | When                                              |
| ----------------- | ------------------------------------------------- |
| `@repo/ui`        | Reusable UI component used across features        |
| `@repo/hooks`     | React hook used in multiple features              |
| `@repo/utils`     | Pure utility function (no React)                  |
| `@repo/types`     | Type used across multiple packages                |
| `@repo/schemas`   | Zod schema for API responses or shared validation |
| `@repo/constants` | Constant used across packages                     |
| `@repo/contexts`  | Context provider used app-wide                    |

### Package File Structure

All packages use this subpath export structure:

```text
packages/{package-name}/
├── src/
│   └── {module-name}/
│       └── index.ts      # Exports from this module
├── package.json          # exports: { "./*": "./src/*/index.ts" }
└── tsconfig.json
```

### Adding a New Module to a Package

1. Create folder: `packages/{package}/src/{module-name}/`
2. Create `index.ts` with exports
3. Import using: `@repo/{package}/{module-name}`

---

## 9. Type Safety Rules

### Strict TypeScript

- Never use `any` - use `unknown` and narrow types
- Always define return types for exported functions
- Use `as const` for literal types
- Prefer `interface` for object shapes, `type` for unions/intersections

### Shared Type Patterns

```typescript
// Use utility types from @repo/types/common
import type {
  WithChildren,
  WithClassName,
  WithSearchParams,
  PageProps,
  Nullable,
  DeepPartial,
} from '@repo/types/common';

// Page component props
type ProductPageProps = PageProps<{ productId: string }>;

export default async function ProductPage({ params }: ProductPageProps) {
  const { productId } = await params;
  // ...
}
```

---

## 10. Styling Guidelines

### Tailwind CSS v4 Usage

- **Import styles**: Always import `@repo/ui/globals.css` in root layout
- **Use design tokens**: Prefer semantic colors (`bg-primary`, `text-muted-foreground`)
- **Responsive design**: Mobile-first with `sm:`, `md:`, `lg:` breakpoints
- **Dark mode**: Use `dark:` variants when needed

### Class Organization

```typescript
// Order: layout → sizing → spacing → typography → colors → effects → states
className =
  'flex items-center gap-4 w-full p-4 text-sm font-medium text-foreground bg-card rounded-lg shadow-sm hover:bg-accent transition-colors';
```

---

## 11. Error Handling

### API Error Pattern

```typescript
import {
  ServiceErrorResponse,
  errorCodes,
  createErrorResponse,
} from '@repo/schemas/service-error-response';

// In API routes or server actions
try {
  const result = await performOperation();
  return { success: true, data: result };
} catch (error) {
  return createErrorResponse(
    errorCodes.INTERNAL_ERROR,
    'Operation failed',
    error instanceof Error ? error.message : undefined
  );
}
```

### Client Error Boundaries

Implement error.tsx files in route segments for graceful error handling.

---

## 12. Testing Checklist

Before submitting code, verify:

- [ ] TypeScript compiles: `pnpm check-types`
- [ ] Linting passes: `pnpm lint`
- [ ] Dev server runs: `pnpm dev`
- [ ] No `any` types used
- [ ] No `process.env` direct access
- [ ] Imports follow subpath pattern
- [ ] New shared code in appropriate package
- [ ] Feature code in `src/modules/`

---

## 13. Quick Reference

### Common Imports

```typescript
// UI
import { Button } from "@repo/ui/button";
import { cn } from "@repo/ui/utils";

// Types
import type {
  WithChildren,
  WithClassName,
  PageProps,
} from "@repo/types/common";
import type { PaginationParams } from "@repo/types/pagination-params";

// Constants
import { COOKIE_KEYS } from "@repo/constants/cookie-keys";
import { ONE_DAY_IN_MS } from "@repo/constants/time";
import { REVALIDATE_TAGS } from "@repo/constants/revalidate-tags";

// Utils
import { formatCurrency, formatRelativeTime } from "@repo/
```
