"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { orderStatusTransitions } from "@/lib/order-transitions";
import { Prisma } from "@/generated/prisma/client";

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
  const current = await prisma.order.findUnique({ where: { orderNumber }, select: { status:true,stockReserved:true,paidAt: true, deliveredAt: true,items:{select:{productId:true,quantity:true}} } });
  if (!current) redirect(`${target}?error=${encodeURIComponent("Заказ не найден")}`);
  if(parsed.data.status!==current.status&&!orderStatusTransitions[current.status].includes(parsed.data.status))redirect(`${target}?error=${encodeURIComponent("Выбранный переход статуса запрещён")}`);
  try {
    const update={
      ...parsed.data,
      trackingNumber: parsed.data.trackingNumber || null,
      paidAt: parsed.data.paymentStatus === "PAID" && !current.paidAt ? new Date() : current.paidAt,
      deliveredAt: parsed.data.deliveryStatus === "DELIVERED" && !current.deliveredAt ? new Date() : current.deliveredAt,
    };
    if(parsed.data.status==="CANCELLED"&&current.stockReserved){await prisma.$transaction(async tx=>{const claimed=await tx.order.updateMany({where:{orderNumber,stockReserved:true},data:{...update,stockReserved:false}});if(claimed.count===1){for(const item of current.items)if(item.productId)await tx.product.update({where:{id:item.productId},data:{stock:{increment:item.quantity}}});}else await tx.order.update({where:{orderNumber},data:update});},{isolationLevel:Prisma.TransactionIsolationLevel.Serializable});}else{await prisma.order.update({where:{orderNumber},data:update});}
  } catch { redirect(`${target}?error=${encodeURIComponent("Не удалось обновить заказ")}`); }
  revalidatePath(target); revalidatePath("/admin/orders"); revalidatePath("/admin"); revalidatePath("/account/orders/[orderNumber]", "page");redirect(`${target}?success=saved`);
}
