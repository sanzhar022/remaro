import { z } from "zod";
import { checkoutSchema } from "@/lib/checkout-schema";

export const orderItemRequestSchema = z.object({
  productId: z.string().trim().min(1),
  quantity: z.number().int().min(1).max(10_000),
});

export const createOrderRequestSchema = z.object({
  customer: checkoutSchema,
  items: z.array(orderItemRequestSchema).min(1, "Корзина пуста").max(100),
});

export type CreateOrderRequest = z.infer<typeof createOrderRequestSchema>;
