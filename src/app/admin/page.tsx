import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { formatOrderStatus } from "@/lib/order-status";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const [products, categories, orders, pendingPayments, paidOrders, awaitingDelivery, users, revenue, recent] = await Promise.all([
    prisma.product.count(), prisma.category.count(), prisma.order.count(),
    prisma.order.count({ where: { paymentStatus: "PENDING" } }),
    prisma.order.count({ where: { paymentStatus: "PAID" } }),
    prisma.order.count({ where: { deliveryStatus: { notIn: ["DELIVERED", "CANCELLED"] } } }),
    prisma.user.count(), prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "PAID" } }),
    prisma.order.findMany({ take: 5, orderBy: { createdAt: "desc" } }),
  ]);
  const cards = [["Товары", products], ["Категории", categories], ["Заказы", orders], ["Ожидают оплаты", pendingPayments], ["Оплачено", paidOrders], ["Ожидают доставки", awaitingDelivery], ["Пользователи", users], ["Выручка", formatPrice(revenue._sum.total ?? 0)]];
  return <><h1 className="type-h1">Обзор</h1><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{cards.map(([label, value]) => <div key={label} className="relative overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-sm)]"><span className="absolute inset-y-0 left-0 w-1 bg-primary" /><p className="text-sm font-medium text-muted">{label}</p><p className="mt-2 text-3xl font-bold tracking-tight text-[var(--navy-900)]">{value}</p></div>)}</div><h2 className="type-h2 mt-10">Последние заказы</h2><div className="mt-4 overflow-x-auto rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-sm)]"><table className="w-full min-w-[42rem] text-left text-sm"><thead className="bg-[var(--navy-900)] text-white"><tr><th className="p-4">Заказ</th><th className="p-4">Клиент</th><th className="p-4">Статус</th><th className="p-4">Сумма</th></tr></thead><tbody>{recent.map((order) => <tr key={order.id} className="border-b border-border transition-colors last:border-0 hover:bg-secondary/50"><td className="p-4"><Link className="font-bold text-[var(--navy-900)] hover:text-primary" href={`/admin/orders/${order.orderNumber}`}>{order.orderNumber}</Link></td><td className="p-4">{order.firstName} {order.lastName}</td><td className="p-4">{formatOrderStatus(order.status)}</td><td className="p-4 font-bold">{formatPrice(order.total)}</td></tr>)}</tbody></table></div></>;
}
