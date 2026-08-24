"use client";

import Link from "next/link";
import { buttonClassName } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";

export interface CartSummaryProps {
  totalItems: number;
  subtotal: number;
}

export function CartSummary({ totalItems, subtotal }: CartSummaryProps) {
  return (
    <aside className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-md)] lg:sticky lg:top-5 sm:p-6">
      <h2 className="type-h2">Ваш заказ</h2>
      <dl className="mt-6 space-y-3 text-sm">
        <div className="flex justify-between gap-4"><dt className="text-muted">Товаров</dt><dd className="font-semibold">{totalItems}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-muted">Стоимость товаров</dt><dd className="font-semibold">{formatPrice(subtotal)}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-muted">Доставка</dt><dd className="text-right font-semibold">Рассчитывается позже</dd></div>
      </dl>
      <div className="mt-6 flex items-baseline justify-between gap-4 border-t border-border pt-5">
        <span className="font-bold">Итого</span>
        <span className="type-price">{formatPrice(subtotal)}</span>
      </div>
      <Link href="/checkout" className={buttonClassName({ size: "lg", className: "mt-6 w-full" })}>Перейти к оформлению</Link>
    </aside>
  );
}
