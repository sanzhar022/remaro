import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { OrderDetails } from "@/components/orders/order-details";
import { Section } from "@/components/ui/section";
import { auth } from "@/lib/auth";
import { getOrderForUser } from "@/lib/orders";

export const metadata: Metadata = { title: "Заказ", robots: { index: false, follow: false } };

export default async function AccountOrderPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { orderNumber } = await params;
  const order = await getOrderForUser(orderNumber, session.user.id);
  if (!order) notFound();

  return <Section><nav className="type-small mb-6 flex flex-wrap gap-2 text-muted" aria-label="Хлебные крошки"><Link href="/account" className="hover:text-primary">Личный кабинет</Link><span>/</span><Link href="/account/orders" className="hover:text-primary">Мои заказы</Link><span>/</span><span className="text-foreground">{order.orderNumber}</span></nav><OrderDetails order={order} /></Section>;
}
