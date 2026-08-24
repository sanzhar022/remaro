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
  return <><h1 className="type-h1">Обзор</h1><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{cards.map(([label, value]) => <div key={label} className="rounded-lg border border-border bg-surface p-5"><p className="text-sm text-muted">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></div>)}</div><h2 className="type-h2 mt-10">Последние заказы</h2><div className="mt-4 overflow-x-auto rounded-lg border border-border bg-surface"><table className="w-full text-left text-sm"><tbody>{recent.map((order) => <tr key={order.id} className="border-b border-border last:border-0"><td className="p-4"><Link className="font-bold text-primary" href={`/admin/orders/${order.orderNumber}`}>{order.orderNumber}</Link></td><td className="p-4">{order.firstName} {order.lastName}</td><td className="p-4">{formatOrderStatus(order.status)}</td><td className="p-4 font-bold">{formatPrice(order.total)}</td></tr>)}</tbody></table></div></>;
}
