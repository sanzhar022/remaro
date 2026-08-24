import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderDetails } from "@/components/orders/order-details";
import { buttonClassName } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { auth } from "@/lib/auth";
import { getOrderByNumber } from "@/lib/orders";

export const metadata: Metadata = {
  title: "Заказ оформлен",
  description: "Подтверждение оформления заказа Remaro.",
  robots: { index: false, follow: false },
};

export default async function OrderSuccessPage({ params, searchParams }: {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const [{ orderNumber }, query, session] = await Promise.all([params, searchParams, auth()]);
  const order = await getOrderByNumber(orderNumber);
  if (!order) notFound();

  const token = typeof query.token === "string" ? query.token : null;
  const isOwner = Boolean(session?.user?.id && order.userId === session.user.id);
  if (!isOwner && token !== order.accessToken) notFound();

  return (
    <Section>
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 text-center">
          <span className="mx-auto grid size-20 place-items-center rounded-full bg-[#e2f3e9] text-success"><CheckCircle2 size={40} aria-hidden="true" /></span>
          <h1 className="type-h1 mt-7">Заказ оформлен</h1>
          <p className="mt-3 text-lg text-muted">Спасибо за заказ! Номер заказа: <strong className="text-foreground">{order.orderNumber}</strong></p>
        </header>
        <OrderDetails order={order} compactHeader />
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/catalog" className={buttonClassName({ size: "lg" })}>Продолжить покупки</Link>
          {isOwner && <Link href="/account/orders" className={buttonClassName({ variant: "outline", size: "lg" })}>Мои заказы</Link>}
        </div>
      </div>
    </Section>
  );
}
