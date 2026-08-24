"use client";

import { Heart } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { useFavoritesStore } from "@/store/favorites-store";

export interface FavoriteButtonProps {
  productId: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function FavoriteButton({ productId, size = "sm", className = "" }: FavoriteButtonProps) {
  const hasMounted = useHasMounted();
  const isFavorite = useFavoritesStore((state) => state.items.includes(productId));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const label = isFavorite ? "Удалить из избранного" : "Добавить в избранное";

  return (
    <IconButton
      aria-label={label}
      aria-pressed={hasMounted ? isFavorite : false}
      title={label}
      size={size}
      disabled={!hasMounted}
      onClick={() => toggleFavorite(productId)}
      className={`${isFavorite ? "bg-[#fde8e8] text-destructive hover:bg-[#fbdada] hover:text-destructive" : "bg-surface/90"} ${className}`}
    >
      <Heart size={size === "lg" ? 23 : 19} className={isFavorite ? "fill-current" : ""} aria-hidden="true" />
    </IconButton>
  );
}
