"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cart-store";
import { useFavoritesStore } from "@/store/favorites-store";

let hydrationPromise: Promise<void> | undefined;

function hydratePersistedStores(): Promise<void> {
  hydrationPromise ??= Promise.all([
    useCartStore.persist.rehydrate(),
    useFavoritesStore.persist.rehydrate(),
  ]).then(() => undefined);
  return hydrationPromise;
}

export function useHasMounted(): boolean {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    let active = true;

    const hydrate = async () => {
      await hydratePersistedStores();
      if (active) setHasMounted(true);
    };

    void hydrate();

    return () => {
      active = false;
    };
  }, []);

  return hasMounted;
}
