import { formatPrice, formatProductCount } from "@/lib/format";
import { calculateOrderTotal, getDeliveryPrice } from "@/lib/checkout";
import type { CartItem } from "@/types/cart";
import type { DeliveryMethod } from "@/types/checkout";

export function CheckoutSummary({ items, deliveryMethod }: { items: readonly CartItem[]; deliveryMethod: DeliveryMethod }) {
  const subtotal = items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const deliveryPrice = getDeliveryPrice(deliveryMethod, "Алматы");
  const total = calculateOrderTotal(subtotal, deliveryPrice);

  return (
    <aside className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-md)] lg:sticky lg:top-5 sm:p-6">
      <h2 className="type-h2">Ваш заказ</h2>
      <p className="type-small mt-2 text-muted">{formatProductCount(totalItems)}</p>
      <ul className="mt-6 max-h-72 space-y-4 overflow-y-auto border-y border-border py-5">
        {items.map((item) => (
          <li key={item.product.id} className="flex justify-between gap-4 text-sm">
            <span className="min-w-0"><span className="line-clamp-2 font-semibold">{item.product.name}</span><span className="mt-1 block text-muted">× {item.quantity}</span></span>
            <span className="shrink-0 font-bold">{formatPrice(item.product.price * item.quantity)}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex justify-between gap-4"><dt className="text-muted">Стоимость товаров</dt><dd className="font-semibold">{formatPrice(subtotal)}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-muted">Доставка</dt><dd className="font-semibold">{formatPrice(deliveryPrice)}</dd></div>
      </dl>
      <div className="mt-5 flex items-baseline justify-between gap-4 border-t border-border pt-5"><span className="font-bold">Итого</span><span className="type-price">{formatPrice(total)}</span></div>
    </aside>
  );
}
