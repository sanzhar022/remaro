"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "READY", "SHIPPED", "COMPLETED", "CANCELLED"]),
  paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "CANCELLED", "REFUNDED"]),
  deliveryStatus: z.enum(["PENDING", "PREPARING", "READY_FOR_PICKUP", "HANDED_TO_COURIER", "IN_TRANSIT", "DELIVERED", "CANCELLED"]),
  trackingNumber: z.string().trim().max(100).optional(),
});

export async function updateOrderStatus(orderNumber: string, data: FormData) {
  await requireAdmin();
  const parsed = schema.safeParse(Object.fromEntries(data));
  const target = `/admin/orders/${encodeURIComponent(orderNumber)}`;
  if (!parsed.success) redirect(`${target}?error=${encodeURIComponent("Некорректные данные статуса")}`);
  const current = await prisma.order.findUnique({ where: { orderNumber }, select: { paidAt: true, deliveredAt: true } });
  if (!current) redirect(`${target}?error=${encodeURIComponent("Заказ не найден")}`);
  try {
    await prisma.order.update({ where: { orderNumber }, data: {
      ...parsed.data,
      trackingNumber: parsed.data.trackingNumber || null,
      paidAt: parsed.data.paymentStatus === "PAID" && !current.paidAt ? new Date() : current.paidAt,
      deliveredAt: parsed.data.deliveryStatus === "DELIVERED" && !current.deliveredAt ? new Date() : current.deliveredAt,
    } });
  } catch { redirect(`${target}?error=${encodeURIComponent("Не удалось обновить заказ")}`); }
  revalidatePath(target); revalidatePath("/admin/orders"); revalidatePath("/admin"); revalidatePath("/account/orders/[orderNumber]", "page");
}
