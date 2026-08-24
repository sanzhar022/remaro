"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { useFavoritesStore } from "@/store/favorites-store";

export function FavoritesHeaderButton() {
  const hasMounted = useHasMounted();
  const count = useFavoritesStore((state) => state.items.length);

  return (
    <Link href="/favorites" title="Избранное" aria-label={hasMounted && count > 0 ? `Избранное, товаров: ${count}` : "Избранное"} className="relative flex min-h-11 min-w-11 flex-col items-center justify-center gap-0.5 rounded-[var(--radius-md)] px-2 text-[11px] text-muted transition-colors hover:bg-secondary hover:text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/25">
      <Heart size={21} className={hasMounted && count > 0 ? "fill-current text-destructive" : ""} aria-hidden="true" />
      <span className="hidden xl:block">Избранное</span>
      {hasMounted && count > 0 && <span className="absolute right-0 top-0 grid min-h-5 min-w-5 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-none text-white">{count > 99 ? "99+" : count}</span>}
    </Link>
  );
}
