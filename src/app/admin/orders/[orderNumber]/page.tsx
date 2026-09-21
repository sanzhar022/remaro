import { notFound } from "next/navigation";
import { OrderDetails } from "@/components/orders/order-details";
import { Button } from "@/components/ui/button";
import { updateOrderStatus } from "@/lib/admin-orders";
import { getOrderByNumber } from "@/lib/orders";
import { orderStatusTransitions } from "@/lib/order-transitions";
import { formatDeliveryStatus,formatOrderStatus,formatPaymentStatus } from "@/lib/order-status";

const paymentStatuses = ["PENDING", "PAID", "FAILED", "CANCELLED", "REFUNDED"] as const;
const deliveryStatuses = ["PENDING", "PREPARING", "READY_FOR_PICKUP", "HANDED_TO_COURIER", "IN_TRANSIT", "DELIVERED", "CANCELLED"] as const;

export default async function AdminOrder({ params, searchParams }: { params: Promise<{ orderNumber: string }>; searchParams: Promise<{ error?: string;success?:string }> }) {
  const { orderNumber } = await params;
  const [order, query] = await Promise.all([getOrderByNumber(orderNumber), searchParams]);
  if (!order) notFound();
  const orderStatuses=[order.status,...orderStatusTransitions[order.status]];
  return <><OrderDetails order={order} />{query.success&&<p role="status" className="mt-6 rounded-md border border-green-200 bg-green-50 p-3 font-semibold text-success">Изменения сохранены.</p>}<form action={updateOrderStatus.bind(null, orderNumber)} className="mt-6 grid gap-4 rounded-lg border border-border bg-surface p-5 sm:grid-cols-2 lg:grid-cols-4"><Select label="Статус заказа" name="status" value={order.status} options={orderStatuses} format={formatOrderStatus}/><Select label="Статус оплаты" name="paymentStatus" value={order.paymentStatus} options={paymentStatuses} format={formatPaymentStatus}/><Select label="Статус доставки" name="deliveryStatus" value={order.deliveryStatus} options={deliveryStatuses} format={formatDeliveryStatus}/><label><span className="mb-1 block text-sm font-semibold">Трек-номер</span><input name="trackingNumber" defaultValue={order.trackingNumber ?? ""} maxLength={100} className="h-11 w-full rounded-md border border-border px-3" /></label><div className="sm:col-span-2 lg:col-span-4"><Button type="submit">Обновить заказ</Button>{query.error && <p role="alert" className="mt-3 text-destructive">{query.error}</p>}</div><p className="text-sm text-muted sm:col-span-2 lg:col-span-4">Тип клиента: {order.userId ? "зарегистрированный" : "гость"} · Создан: {new Intl.DateTimeFormat("ru-KZ",{dateStyle:"medium",timeStyle:"short"}).format(order.createdAt)}</p></form></>;
}

function Select({ label, name, value, options,format }: { label: string; name: string; value: string; options: readonly string[];format:(value:never)=>string }) {
  return <label><span className="mb-1 block text-sm font-semibold">{label}</span><select name={name} defaultValue={value} className="h-11 w-full rounded-md border border-border px-3">{options.map((option) => <option key={option} value={option}>{format(option as never)}</option>)}</select></label>;
}
