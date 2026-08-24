import { notFound } from "next/navigation";
import { OrderDetails } from "@/components/orders/order-details";
import { Button } from "@/components/ui/button";
import { updateOrderStatus } from "@/lib/admin-orders";
import { getOrderByNumber } from "@/lib/orders";

const orderStatuses = ["PENDING", "CONFIRMED", "PROCESSING", "READY", "SHIPPED", "COMPLETED", "CANCELLED"] as const;
const paymentStatuses = ["PENDING", "PAID", "FAILED", "CANCELLED", "REFUNDED"] as const;
const deliveryStatuses = ["PENDING", "PREPARING", "READY_FOR_PICKUP", "HANDED_TO_COURIER", "IN_TRANSIT", "DELIVERED", "CANCELLED"] as const;

export default async function AdminOrder({ params, searchParams }: { params: Promise<{ orderNumber: string }>; searchParams: Promise<{ error?: string }> }) {
  const { orderNumber } = await params;
  const [order, query] = await Promise.all([getOrderByNumber(orderNumber), searchParams]);
  if (!order) notFound();
  return <><OrderDetails order={order} /><form action={updateOrderStatus.bind(null, orderNumber)} className="mt-6 grid gap-4 rounded-lg border border-border bg-surface p-5 sm:grid-cols-2 lg:grid-cols-4"><Select label="Статус заказа" name="status" value={order.status} options={orderStatuses} /><Select label="Статус оплаты" name="paymentStatus" value={order.paymentStatus} options={paymentStatuses} /><Select label="Статус доставки" name="deliveryStatus" value={order.deliveryStatus} options={deliveryStatuses} /><label><span className="mb-1 block text-sm font-semibold">Трек-номер</span><input name="trackingNumber" defaultValue={order.trackingNumber ?? ""} maxLength={100} className="h-11 w-full rounded-md border border-border px-3" /></label><div className="sm:col-span-2 lg:col-span-4"><Button type="submit">Обновить заказ</Button>{query.error && <p className="mt-3 text-destructive">{query.error}</p>}</div><p className="text-sm text-muted sm:col-span-2 lg:col-span-4">User ID: {order.userId ?? "Guest"} · Создан: {order.createdAt.toISOString()} · Обновлён: {order.updatedAt.toISOString()}</p></form></>;
}

function Select({ label, name, value, options }: { label: string; name: string; value: string; options: readonly string[] }) {
  return <label><span className="mb-1 block text-sm font-semibold">{label}</span><select name={name} defaultValue={value} className="h-11 w-full rounded-md border border-border px-3">{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}
