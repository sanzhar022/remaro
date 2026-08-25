"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { useCartStore } from "@/store/cart-store";

export function CartHeaderButton() {
  const hasMounted = useHasMounted();
  const totalItems = useCartStore((state) => state.items.reduce((total, item) => total + Math.min(item.quantity, item.product.stock), 0));

  return (
    <Link href="/cart" title="Корзина" aria-label={hasMounted && totalItems > 0 ? `Корзина, товаров: ${totalItems}` : "Корзина"} className="relative flex min-h-11 min-w-11 flex-col items-center justify-center gap-0.5 rounded-[var(--radius-md)] px-2 text-[11px] text-white/75 transition-colors hover:bg-white/10 hover:text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/40">
      <ShoppingCart size={21} aria-hidden="true" />
      <span className="hidden xl:block">Корзина</span>
      {hasMounted && totalItems > 0 && <span className="absolute right-0 top-0 grid min-h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-[var(--navy-950)]">{totalItems > 99 ? "99+" : totalItems}</span>}
    </Link>
  );
}
