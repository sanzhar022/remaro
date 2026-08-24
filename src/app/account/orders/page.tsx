import type { Metadata } from "next";
import { PackageSearch } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { buttonClassName } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { auth } from "@/lib/auth";
import { formatPrice, formatProductCount } from "@/lib/format";
import { formatDeliveryStatus, formatOrderStatus, formatPaymentStatus } from "@/lib/order-status";
import { getOrdersByUserId } from "@/lib/orders";

export const metadata: Metadata = { title: "Мои заказы", description: "История заказов Remaro." };

export default async function AccountOrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const orders = await getOrdersByUserId(session.user.id);

  return (
    <Section>
      <nav className="type-small mb-6 flex gap-2 text-muted" aria-label="Хлебные крошки"><Link href="/account" className="hover:text-primary">Личный кабинет</Link><span>/</span><span className="text-foreground">Мои заказы</span></nav>
      <h1 className="type-h1">Мои заказы</h1>
      {orders.length === 0 ? (
        <div className="mt-8 flex min-h-80 flex-col items-center justify-center rounded-[var(--radius-xl)] border border-border bg-surface px-5 text-center shadow-[var(--shadow-sm)]">
          <PackageSearch size={42} className="text-primary" aria-hidden="true" />
          <h2 className="type-h2 mt-5">У вас пока нет заказов</h2>
          <p className="mt-2 text-muted">После оформления покупки заказ появится здесь.</p>
          <Link href="/catalog" className={buttonClassName({ size: "lg", className: "mt-6" })}>Перейти в каталог</Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-4">
          {orders.map((order) => (
            <article key={order.id} className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-sm)] sm:p-6">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                <div><h2 className="type-h3">Заказ {order.orderNumber}</h2><p className="type-small mt-2 text-muted">{new Intl.DateTimeFormat("ru-KZ", { dateStyle: "long" }).format(order.createdAt)}</p><p className="mt-2 font-semibold text-primary">{formatOrderStatus(order.status)}</p><p className="type-small mt-1 text-muted">Оплата: {formatPaymentStatus(order.paymentStatus)} · Доставка: {formatDeliveryStatus(order.deliveryStatus)}</p></div>
                <div className="sm:text-right"><p className="text-muted">{formatProductCount(order._count.items)}</p><p className="type-price mt-2">{formatPrice(order.total)}</p><Link href={`/account/orders/${order.orderNumber}`} className={buttonClassName({ variant: "outline", className: "mt-4" })}>Подробнее</Link></div>
              </div>
            </article>
          ))}
        </div>
      )}
    </Section>
  );
}
