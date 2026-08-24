"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductGrid } from "@/components/product/product-grid";
import { buttonClassName, Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { formatProductCount } from "@/lib/format";
import { useFavoritesStore } from "@/store/favorites-store";
import type { Product } from "@/types/product";

export function FavoritesContent() {
  const hasMounted = useHasMounted();
  const favoriteIds = useFavoritesStore((state) => state.items);
  const clearFavorites = useFavoritesStore((state) => state.clearFavorites);
  const [loadedProducts, setLoadedProducts] = useState<Product[] | undefined>();
  const favoriteProducts = (loadedProducts ?? []).filter((product) => favoriteIds.includes(product.id));

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const loadProducts = async () => {
      await Promise.resolve();
      if (favoriteIds.length === 0) {
        if (active) setLoadedProducts([]);
        return;
      }

      const response = await fetch(`/api/products?ids=${encodeURIComponent(favoriteIds.join(","))}`, { signal: controller.signal });
      if (!response.ok) throw new Error("Не удалось загрузить избранные товары");
      const data: unknown = await response.json();
      if (active) setLoadedProducts(Array.isArray(data) ? data as Product[] : []);
    };

    void loadProducts().catch((error: unknown) => {
      if (active && !(error instanceof DOMException && error.name === "AbortError")) setLoadedProducts([]);
    });

    return () => {
      active = false;
      controller.abort();
    };
  }, [favoriteIds]);

  if (!hasMounted || (favoriteIds.length > 0 && loadedProducts === undefined)) {
    return <div className="grid gap-4 min-[520px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"><Skeleton className="h-96" /><Skeleton className="hidden h-96 min-[520px]:block" /><Skeleton className="hidden h-96 lg:block" /><Skeleton className="hidden h-96 xl:block" /></div>;
  }

  if (favoriteProducts.length === 0) {
    return (
      <div className="flex min-h-96 flex-col items-center justify-center rounded-[var(--radius-xl)] border border-border bg-surface px-5 py-12 text-center shadow-[var(--shadow-sm)]">
        <span className="grid size-16 place-items-center rounded-full bg-secondary text-primary"><Heart size={30} aria-hidden="true" /></span>
        <h2 className="type-h2 mt-6">В избранном пока ничего нет</h2>
        <p className="mt-3 max-w-md text-muted">Сохраняйте товары, чтобы быстро вернуться к ним позже.</p>
        <Link href="/catalog" className={buttonClassName({ size: "lg", className: "mt-7" })}>Перейти в каталог</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-semibold text-muted">{formatProductCount(favoriteProducts.length)}</p>
        <Button variant="ghost" size="sm" className="w-fit text-destructive hover:bg-[#fde8e8] hover:text-destructive" onClick={clearFavorites}>Очистить избранное</Button>
      </div>
      <ProductGrid products={favoriteProducts} />
    </div>
  );
}
