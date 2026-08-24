"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { CartItem } from "@/components/cart/cart-item";
import { CartSummary } from "@/components/cart/cart-summary";
import { buttonClassName, Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { useCartStore } from "@/store/cart-store";

export function CartContent() {
  const hasMounted = useHasMounted();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.product.price * item.quantity, 0);

  if (!hasMounted) {
    return <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]"><Skeleton className="h-72" /><Skeleton className="h-64" /></div>;
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-96 flex-col items-center justify-center rounded-[var(--radius-xl)] border border-border bg-surface px-5 py-12 text-center shadow-[var(--shadow-sm)]">
        <span className="grid size-16 place-items-center rounded-full bg-secondary text-primary"><ShoppingCart size={30} aria-hidden="true" /></span>
        <h2 className="type-h2 mt-6">Корзина пуста</h2>
        <p className="mt-3 max-w-md text-muted">Добавьте товары из каталога, чтобы оформить заказ.</p>
        <Link href="/catalog" className={buttonClassName({ size: "lg", className: "mt-7" })}>Перейти в каталог</Link>
      </div>
    );
  }

  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
      <div className="min-w-0">
        <div className="mb-4 flex items-center justify-between gap-4">
          <p className="text-muted">{totalItems} товаров</p>
          <Button variant="ghost" size="sm" className="text-destructive hover:bg-[#fde8e8] hover:text-destructive" onClick={clearCart}>Очистить корзину</Button>
        </div>
        <div className="space-y-4">{items.map((item) => <CartItem key={item.product.id} item={item} />)}</div>
      </div>
      <CartSummary totalItems={totalItems} subtotal={subtotal} />
    </div>
  );
}
