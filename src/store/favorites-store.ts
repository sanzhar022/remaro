"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoritesStore {
  items: string[];
  addFavorite: (productId: string) => void;
  removeFavorite: (productId: string) => void;
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  clearFavorites: () => void;
  getTotalFavorites: () => number;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      items: [],
      addFavorite: (productId) => set((state) =>
        state.items.includes(productId) ? state : { items: [...state.items, productId] },
      ),
      removeFavorite: (productId) => set((state) => ({
        items: state.items.filter((id) => id !== productId),
      })),
      toggleFavorite: (productId) => set((state) => ({
        items: state.items.includes(productId)
          ? state.items.filter((id) => id !== productId)
          : [...state.items, productId],
      })),
      isFavorite: (productId) => get().items.includes(productId),
      clearFavorites: () => set({ items: [] }),
      getTotalFavorites: () => get().items.length,
    }),
    {
      name: "remaro-favorites",
      skipHydration: true,
      merge: (persistedState, currentState) => {
        const saved = persistedState as Partial<FavoritesStore>;
        const items = [...new Set((saved.items ?? []).filter((id): id is string => typeof id === "string" && id.length > 0))];
        return { ...currentState, ...saved, items };
      },
    },
  ),
);
