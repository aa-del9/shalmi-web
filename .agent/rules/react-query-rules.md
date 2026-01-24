---
trigger: always_on
---

# React Query Implementation Standards

This rule defines how to implement data fetching with TanStack React Query v5 in the Shaalmi monorepo. Follow these patterns for all queries, mutations, and hooks.

---

## 1. Key Resources

| Resource        | Import Path                   | Purpose                              |
| --------------- | ----------------------------- | ------------------------------------ |
| Query Constants | `@repo/constants/query`       | Stale times, GC times, retry config  |
| Query Utilities | `@repo/utils/react-query`     | Client factory, key factory, helpers |
| Query Client    | `@/modules/core/query-client` | App's QueryClient singleton          |

---

## 2. Query Key Factory Pattern

**CRITICAL**: Always use `createQueryKeyFactory` for type-safe, hierarchical query keys.

### Creating a Key Factory

```typescript
// src/modules/products/hooks/keys.ts
import { createQueryKeyFactory } from '@repo/utils/react-query';

export const productKeys = createQueryKeyFactory('products', {
  lists: () => ['list'] as const,
  list: (filters: ProductFilters) => ['list', filters] as const,
  details: () => ['detail'] as const,
  detail: (id: string) => ['detail', id] as const,
  categories: () => ['categories'] as const,
});
```

### Using Query Keys

```typescript
// Usage in hooks
productKeys.all; // ['products'] - invalidate everything
productKeys.lists(); // ['products', 'list'] - all lists
productKeys.list({ page: 1 }); // ['products', 'list', { page: 1 }]
productKeys.detail('123'); // ['products', 'detail', '123']

// Invalidation examples
queryClient.invalidateQueries({ queryKey: productKeys.all });
queryClient.invalidateQueries({ queryKey: productKeys.lists() });
```

---

## 3. Implementing Query Hooks

### Standard Query Hook

```typescript
// src/modules/products/hooks/use-product.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { getQueryErrorMessage, isQueryLoading } from '@repo/utils/react-query';
import { STALE_TIME_STANDARD } from '@repo/constants/query';

import { productKeys } from './keys';
import { fetchProduct } from '../services/api';
import type { Product } from '../types';

interface UseProductOptions {
  id: string;
  enabled?: boolean;
}

export function useProduct({ id, enabled = true }: UseProductOptions) {
  const query = useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => fetchProduct(id),
    staleTime: STALE_TIME_STANDARD,
    enabled: enabled && Boolean(id),
  });

  return {
    ...query,
    // Convenience helpers
    isLoading: isQueryLoading(query.isPending, query.isFetching, query.data),
    errorMessage: query.error ? getQueryErrorMessage(query.error) : null,
  };
}
```

### Query Hook with Filters

```typescript
// src/modules/products/hooks/use-products.ts
'use client';

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { STALE_TIME_DYNAMIC } from '@repo/constants/query';

import { productKeys } from './keys';
import { fetchProducts } from '../services/api';
import type { ProductFilters, ProductsResponse } from '../types';

export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => fetchProducts(filters),
    staleTime: STALE_TIME_DYNAMIC,
    placeholderData: keepPreviousData, // Keep old data while fetching new
  });
}
```

### Infinite Query Hook

```typescript
// src/modules/products/hooks/use-infinite-products.ts
'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import {
  getInfiniteQueryData,
  getInfiniteQueryCount,
} from '@repo/utils/react-query';
import { STALE_TIME_DYNAMIC } from '@repo/constants/query';

import { productKeys } from './keys';
import { fetchProducts } from '../services/api';
import type { ProductFilters, ProductsResponse } from '../types';

export function useInfiniteProducts(filters: Omit<ProductFilters, 'page'>) {
  const query = useInfiniteQuery({
    queryKey: productKeys.list({ ...filters, infinite: true }),
    queryFn: ({ pageParam }) => fetchProducts({ ...filters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    staleTime: STALE_TIME_DYNAMIC,
  });

  return {
    ...query,
    // Flattened data for easy consumption
    products: getInfiniteQueryData(query.data, (page) => page.products),
    totalCount: getInfiniteQueryCount(query.data, (page) => page.totalCount),
  };
}
```

---

## 4. Implementing Mutation Hooks

### Standard Mutation Hook

```typescript
// src/modules/products/hooks/use-create-product.ts
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getQueryErrorMessage } from '@repo/utils/react-query';

import { productKeys } from './keys';
import { createProduct } from '../services/api';
import type { CreateProductInput, Product } from '../types';

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProductInput) => createProduct(input),
    onSuccess: (newProduct) => {
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success('Product created successfully');
    },
    onError: (error) => {
      toast.error(getQueryErrorMessage(error, 'Failed to create product'));
    },
  });
}
```

### Mutation with Optimistic Updates

```typescript
// src/modules/products/hooks/use-update-product.ts
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getQueryErrorMessage } from '@repo/utils/react-query';

import { productKeys } from './keys';
import { updateProduct } from '../services/api';
import type { UpdateProductInput, Product } from '../types';

export function useUpdateProduct(productId: string) {
  const queryClient = useQueryClient();
  const queryKey = productKeys.detail(productId);

  return useMutation({
    mutationFn: (input: UpdateProductInput) => updateProduct(productId, input),

    // Optimistic update
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousProduct = queryClient.getQueryData<Product>(queryKey);

      // Optimistically update
      if (previousProduct) {
        queryClient.setQueryData<Product>(queryKey, {
          ...previousProduct,
          ...newData,
        });
      }

      return { previousProduct };
    },

    // Rollback on error
    onError: (error, _variables, context) => {
      if (context?.previousProduct) {
        queryClient.setQueryData(queryKey, context.previousProduct);
      }
      toast.error(getQueryErrorMessage(error, 'Failed to update product'));
    },

    // Refetch on success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },

    onSuccess: () => {
      toast.success('Product updated');
    },
  });
}
```

### Delete Mutation

```typescript
// src/modules/products/hooks/use-delete-product.ts
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getQueryErrorMessage } from '@repo/utils/react-query';

import { productKeys } from './keys';
import { deleteProduct } from '../services/api';

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => deleteProduct(productId),
    onSuccess: (_data, productId) => {
      // Remove from cache immediately
      queryClient.removeQueries({ queryKey: productKeys.detail(productId) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success('Product deleted');
    },
    onError: (error) => {
      toast.error(getQueryErrorMessage(error, 'Failed to delete product'));
    },
  });
}
```

---

## 5. Stale Time Selection Guide

Choose the appropriate stale time based on data characteristics:

| Constant              | Duration | Use For                                        |
| --------------------- | -------- | ---------------------------------------------- |
| `STALE_TIME_STATIC`   | 30 min   | App config, static lists, rarely-changing data |
| `STALE_TIME_STANDARD` | 5 min    | User data, products, orders (default)          |
| `STALE_TIME_DYNAMIC`  | 1 min    | Inventory counts, notifications, prices        |
| `STALE_TIME_REALTIME` | 0        | Chat messages, live dashboards                 |

```typescript
import {
  STALE_TIME_STATIC,
  STALE_TIME_STANDARD,
  STALE_TIME_DYNAMIC,
  STALE_TIME_REALTIME,
} from '@repo/constants/query';

// Static data - rarely changes
useQuery({
  queryKey: ['app-config'],
  queryFn: fetchAppConfig,
  staleTime: STALE_TIME_STATIC,
});

// Dynamic data - changes frequently
useQuery({
  queryKey: ['inventory', productId],
  queryFn: () => fetchInventory(productId),
  staleTime: STALE_TIME_DYNAMIC,
});
```

---

## 6. Error Handling

### In Query Hooks

```typescript
import { getQueryErrorMessage, isQueryLoading } from "@repo/utils/react-query";

export function useProduct(id: string) {
  const query = useQuery({...});

  return {
    ...query,
    isLoading: isQueryLoading(query.isPending, query.isFetching, query.data),
    errorMessage: query.error ? getQueryErrorMessage(query.error) : null,
  };
}

// In component
const { data, isLoading, errorMessage } = useProduct(id);

if (isLoading) return <Skeleton />;
if (errorMessage) return <ErrorMessage message={errorMessage} />;
```

### In Mutations

```typescript
import { getQueryErrorMessage } from '@repo/utils/react-query';
import { toast } from 'sonner';

useMutation({
  mutationFn: createProduct,
  onError: (error) => {
    toast.error(getQueryErrorMessage(error, 'Failed to create product'));
  },
});
```

---

## 7. Prefetching Data

### In Server Components

```typescript
// src/app/products/[id]/page.tsx
import { getQueryClient } from "@/modules/core/query-client";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { safePrefetch } from "@repo/utils/react-query";

import { productKeys } from "@/modules/products/hooks/keys";
import { fetchProduct } from "@/modules/products/services/api";
import { ProductView } from "@/modules/products/components/product-view";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const queryClient = getQueryClient();

  await safePrefetch(queryClient, productKeys.detail(id), () =>
    fetchProduct(id)
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductView id={id} />
    </HydrationBoundary>
  );
}
```

### In Client Components (on hover/focus)

```typescript
import { useQueryClient } from "@tanstack/react-query";
import { productKeys } from "./keys";
import { fetchProduct } from "../services/api";

function ProductCard({ product }: { product: Product }) {
  const queryClient = useQueryClient();

  const handleMouseEnter = () => {
    // Prefetch on hover for instant navigation
    queryClient.prefetchQuery({
      queryKey: productKeys.detail(product.id),
      queryFn: () => fetchProduct(product.id),
    });
  };

  return (
    <Link
      href={`/products/${product.id}`}
      onMouseEnter={handleMouseEnter}
    >
      {product.name}
    </Link>
  );
}
```

---

## 8. File Organization

Organize React Query code within feature modules:

```text
src/modules/products/
├── components/
│   ├── product-list.tsx
│   └── product-card.tsx
├── hooks/
│   ├── keys.ts              # Query key factory
│   ├── use-products.ts      # List query
│   ├── use-product.ts       # Detail query
│   ├── use-create-product.ts
│   ├── use-update-product.ts
│   └── use-delete-product.ts
├── services/
│   └── api.ts               # API functions (fetch*, create*, etc.)
├── types/
│   └── index.ts
└── index.ts                  # Barrel exports
```

### Barrel Export Pattern

```typescript
// src/modules/products/index.ts
export * from './hooks/use-products';
```
