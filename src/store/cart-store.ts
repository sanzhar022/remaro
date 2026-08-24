"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types/cart";
import type { Product } from "@/types/product";

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  increaseQuantity: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

const normalizeQuantity = (quantity: number, stock: number) =>
  Math.min(Math.max(1, Math.floor(quantity)), stock);

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1) => {
        if (product.stock <= 0 || quantity <= 0) return;

        set((state) => {
          const existing = state.items.find((item) => item.product.id === product.id);
          if (!existing) {
            return { items: [...state.items, { product, quantity: normalizeQuantity(quantity, product.stock) }] };
          }

          return {
            items: state.items.map((item) =>
              item.product.id === product.id
                ? { ...item, product, quantity: normalizeQuantity(item.quantity + quantity, product.stock) }
                : item,
            ),
          };
        });
      },
      removeItem: (productId) => set((state) => ({ items: state.items.filter((item) => item.product.id !== productId) })),
      increaseQuantity: (productId) => set((state) => ({
        items: state.items.map((item) =>
          item.product.id === productId
            ? { ...item, quantity: normalizeQuantity(item.quantity + 1, item.product.stock) }
            : item,
        ),
      })),
      decreaseQuantity: (productId) => set((state) => ({
        items: state.items.map((item) =>
          item.product.id === productId && item.quantity > 1
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        ),
      })),
      setQuantity: (productId, quantity) => set((state) => ({
        items: state.items.map((item) =>
          item.product.id === productId && item.product.stock > 0
            ? { ...item, quantity: normalizeQuantity(quantity, item.product.stock) }
            : item,
        ),
      })),
      clearCart: () => set({ items: [] }),
      getTotalItems: () => get().items.reduce((total, item) => total + Math.min(item.quantity, item.product.stock), 0),
      getSubtotal: () => get().items.reduce(
        (total, item) => total + item.product.price * Math.min(item.quantity, item.product.stock),
        0,
      ),
    }),
    {
      name: "remaro-cart",
      skipHydration: true,
      merge: (persistedState, currentState) => {
        const saved = persistedState as Partial<CartStore>;
        const normalizedItems = (saved.items ?? [])
          .filter((item) => item.product.stock > 0)
          .map((item) => ({
            ...item,
            quantity: normalizeQuantity(item.quantity, item.product.stock),
          }));

        return { ...currentState, ...saved, items: normalizedItems };
      },
    },
  ),
);
