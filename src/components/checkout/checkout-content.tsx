"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { CheckoutSummary } from "@/components/checkout/checkout-summary";
import { buttonClassName } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { useCartStore } from "@/store/cart-store";
import type { CheckoutFormData, DeliveryMethod } from "@/types/checkout";
import type { CreateOrderResponse, OrderApiError } from "@/types/order";

export function CheckoutContent() {
  const router = useRouter();
  const hasMounted = useHasMounted();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("delivery");
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!hasMounted) {
    return <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]"><Skeleton className="h-[42rem]" /><Skeleton className="h-80" /></div>;
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-96 flex-col items-center justify-center rounded-[var(--radius-xl)] border border-border bg-surface px-5 py-12 text-center shadow-[var(--shadow-sm)]">
        <span className="grid size-16 place-items-center rounded-full bg-secondary text-primary"><ShoppingCart size={30} aria-hidden="true" /></span>
        <h2 className="type-h2 mt-6">Ваша корзина пуста</h2>
        <p className="mt-3 max-w-md text-muted">Добавьте товары перед оформлением заказа.</p>
        <Link href="/catalog" className={buttonClassName({ size: "lg", className: "mt-7" })}>Перейти в каталог</Link>
      </div>
    );
  }

  const submitOrder = async (customer: CheckoutFormData) => {
    setSubmitError(null);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer,
          items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
        }),
      });
      const result = await response.json() as CreateOrderResponse | OrderApiError;
      if (!response.ok || !("orderNumber" in result)) {
        throw new Error("error" in result ? result.error : "Не удалось оформить заказ. Попробуйте ещё раз.");
      }

      clearCart();
      router.push(`/order-success/${encodeURIComponent(result.orderNumber)}?token=${encodeURIComponent(result.accessToken)}`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Не удалось оформить заказ. Попробуйте ещё раз.");
    }
  };

  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
      <CheckoutForm onSubmit={submitOrder} onDeliveryMethodChange={setDeliveryMethod} submitError={submitError} />
      <CheckoutSummary items={items} deliveryMethod={deliveryMethod} />
    </div>
  );
}
