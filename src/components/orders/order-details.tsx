import type { DeliveryMethod, DeliveryStatus, OrderStatus, PaymentMethod, PaymentStatus } from "@/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import { formatDeliveryMethod, formatDeliveryStatus, formatOrderStatus, formatPaymentMethod, formatPaymentStatus } from "@/lib/order-status";

interface OrderDetailsProps {
  order: {
    orderNumber: string;
    status: OrderStatus;
    createdAt: Date;
    firstName: string;
    lastName: string;
    phone: string;
    deliveryMethod: DeliveryMethod;
    city: string;
    address: string | null;
    apartment: string | null;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    deliveryStatus: DeliveryStatus;
    trackingNumber: string | null;
    subtotal: number;
    deliveryPrice: number;
    total: number;
    items: Array<{
      id: string;
      productName: string;
      sku: string;
      unitPrice: number;
      quantity: number;
      totalPrice: number;
      unit: string;
    }>;
  };
  compactHeader?: boolean;
}

export function OrderDetails({ order, compactHeader = false }: OrderDetailsProps) {
  const address = order.deliveryMethod === "PICKUP"
    ? "Магазин Remaro"
    : [order.city, order.address, order.apartment && `кв./офис ${order.apartment}`].filter(Boolean).join(", ");

  return (
    <div className="space-y-6">
      {!compactHeader && <h1 className="type-h1">Заказ {order.orderNumber}</h1>}
      <dl className="grid gap-4 rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-sm)] sm:grid-cols-2 lg:grid-cols-3 sm:p-7">
        <Info label="Статус заказа" value={formatOrderStatus(order.status)} />
        <Info label="Дата" value={new Intl.DateTimeFormat("ru-KZ", { dateStyle: "long", timeStyle: "short" }).format(order.createdAt)} />
        <Info label="Получатель" value={`${order.firstName} ${order.lastName}`} />
        <Info label="Телефон" value={order.phone} />
        <Info label="Получение" value={`${formatDeliveryMethod(order.deliveryMethod)} · ${address}`} />
        <Info label="Оплата" value={formatPaymentMethod(order.paymentMethod)} />
        <div><dt className="text-sm text-muted">Статус оплаты</dt><dd className="mt-1"><Badge variant={order.paymentStatus === "PAID" ? "success" : "neutral"}>{formatPaymentStatus(order.paymentStatus)}</Badge></dd></div>
        <div><dt className="text-sm text-muted">Статус доставки</dt><dd className="mt-1"><Badge variant={order.deliveryStatus === "DELIVERED" ? "success" : "neutral"}>{formatDeliveryStatus(order.deliveryStatus)}</Badge></dd></div>
        {order.trackingNumber && <Info label="Трек-номер" value={order.trackingNumber} />}
      </dl>

      <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-sm)] sm:p-7">
        <h2 className="type-h2">Товары</h2>
        <ul className="mt-5 divide-y divide-border">
          {order.items.map((item) => (
            <li key={item.id} className="flex flex-col justify-between gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
              <div><p className="font-bold">{item.productName}</p><p className="type-small mt-1 text-muted">Артикул: {item.sku} · {item.quantity} × {formatPrice(item.unitPrice)} / {item.unit}</p></div>
              <p className="shrink-0 font-bold">{formatPrice(item.totalPrice)}</p>
            </li>
          ))}
        </ul>
        <dl className="ml-auto mt-6 max-w-sm space-y-3 border-t border-border pt-5 text-sm">
          <Total label="Товары" value={formatPrice(order.subtotal)} />
          <Total label="Доставка" value={formatPrice(order.deliveryPrice)} />
          <Total label="Итого" value={formatPrice(order.total)} emphasized />
        </dl>
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-sm text-muted">{label}</dt><dd className="mt-1 font-semibold">{value}</dd></div>;
}

function Total({ label, value, emphasized = false }: { label: string; value: string; emphasized?: boolean }) {
  return <div className="flex justify-between gap-4"><dt className={emphasized ? "font-bold" : "text-muted"}>{label}</dt><dd className={emphasized ? "text-lg font-black" : "font-semibold"}>{value}</dd></div>;
}
