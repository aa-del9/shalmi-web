'use client';

import { create } from 'zustand';
import { persist, type PersistStorage } from 'zustand/middleware';
import type { CartItem, CartItemInput } from '../types';
import { resolvePerPackPrice } from '../utils/pack-pricing';

interface CartState {
  items: CartItem[];
  addItem: (product: CartItemInput, packQuantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, packQuantity: number) => void;
  updateSelectedPackQty: (productId: string, selectedPackQty: number) => void;
  clearCart: () => void;
}

const STORAGE_KEY = 'shalmi-cart';
const STORAGE_VERSION = 2;

/**
 * Custom storage so we can hard-reset stale localStorage payloads from the
 * legacy band-tier model. Bumping the persist `version` triggers a migrate;
 * the hard-reset on read covers users coming straight from a stale tab
 * without an in-flight rehydrate.
 */
const cartStorage: PersistStorage<{ items: CartItem[] }> | undefined =
  typeof window === 'undefined'
    ? undefined
    : {
        getItem: (name) => {
          try {
            const raw = window.localStorage.getItem(name);
            if (!raw) return null;
            const parsed = JSON.parse(raw) as {
              version?: number;
              state?: { items: CartItem[] };
            };
            if (parsed.version !== STORAGE_VERSION) return null;
            return parsed.state ? { state: parsed.state, version: STORAGE_VERSION } : null;
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            window.localStorage.setItem(
              name,
              JSON.stringify({ version: STORAGE_VERSION, state: value.state })
            );
          } catch {
            // ignore quota errors
          }
        },
        removeItem: (name) => {
          window.localStorage.removeItem(name);
        },
      };

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (product, packQuantity = 1) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === product.productId
          );

          if (existing) {
            // Per buyer-cart gap-analysis Q8: same product, different
            // bundle selections collapse into one line. New add updates
            // the latest selectedPackQty + accumulates qty.
            return {
              items: state.items.map((i) =>
                i.productId === product.productId
                  ? {
                      ...i,
                      packTiers: product.packTiers,
                      selectedPackQty: product.selectedPackQty,
                      vendorName: product.vendorName,
                      packSize: product.packSize,
                      unitLabel: product.unitLabel,
                      packWeightGrams: product.packWeightGrams,
                      image: product.image ?? i.image,
                      quantity: i.quantity + packQuantity,
                    }
                  : i
              ),
            };
          }

          const newItem: CartItem = { ...product, quantity: packQuantity };
          return { items: [...state.items, newItem] };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      updateQuantity: (productId, packQuantity) =>
        set((state) => {
          if (packQuantity <= 0) {
            return {
              items: state.items.filter((i) => i.productId !== productId),
            };
          }
          return {
            items: state.items.map((i) =>
              i.productId === productId ? { ...i, quantity: packQuantity } : i
            ),
          };
        }),

      updateSelectedPackQty: (productId, selectedPackQty) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, selectedPackQty } : i
          ),
        })),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: STORAGE_KEY,
      version: STORAGE_VERSION,
      storage: cartStorage,
    }
  )
);

export function getCartTotalItems(items: CartItem[]): number {
  // Returns total number of packs across all lines (counts what the
  // header "Your cart · N items" reflects per gap-analysis Q3).
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartLineSubtotal(item: CartItem): number {
  const perPack = resolvePerPackPrice(item.packTiers, item.selectedPackQty);
  return perPack * item.quantity;
}

export function getCartTotalPrice(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + getCartLineSubtotal(item), 0);
}

export function getCartTotalWeightGrams(items: CartItem[]): number {
  return items.reduce(
    (sum, item) =>
      sum + item.packWeightGrams * item.selectedPackQty * item.quantity,
    0
  );
}
