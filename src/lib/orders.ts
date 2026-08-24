import "server-only";
import { randomBytes } from "node:crypto";
import { DeliveryMethod, PaymentMethod, Prisma } from "@/generated/prisma/client";
import { calculateOrderTotal } from "@/lib/checkout";
import { DeliveryQuoteError, getDeliveryQuote } from "@/lib/delivery";
import { getPaymentProvider, isOnlinePayment, ONLINE_PAYMENT_UNAVAILABLE_MESSAGE } from "@/lib/payment-service";
import type { CreateOrderRequest } from "@/lib/order-schema";
import { prisma } from "@/lib/prisma";

export class OrderCreationError extends Error {
  constructor(
    message: string,
    readonly code: "PRODUCT_NOT_FOUND" | "OUT_OF_STOCK" | "UNSUPPORTED_DELIVERY_CITY" | "PAYMENT_UNAVAILABLE" | "ORDER_FAILED",
    readonly status: number,
  ) {
    super(message);
  }
}

const orderInclude = { items: { orderBy: { createdAt: "asc" as const } } };

function generateOrderNumber(date = new Date()) {
  const datePart = date.toISOString().slice(0, 10).replaceAll("-", "");
  return `RM-${datePart}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

function generateAccessToken() {
  return randomBytes(32).toString("hex");
}

function normalizeItems(items: CreateOrderRequest["items"]) {
  const quantities = new Map<string, number>();
  for (const item of items) quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
  return [...quantities].map(([productId, quantity]) => ({ productId, quantity }));
}

const deliveryMap = { delivery: DeliveryMethod.DELIVERY, pickup: DeliveryMethod.PICKUP } as const;
const paymentMap = { card: PaymentMethod.CARD, kaspi: PaymentMethod.KASPI, cash: PaymentMethod.CASH } as const;

export async function createOrder(input: CreateOrderRequest, userId?: string | null) {
  const normalizedItems = normalizeItems(input.items);
  const products = await prisma.product.findMany({
    where: { id: { in: normalizedItems.map(({ productId }) => productId) } },
    select: { id: true, name: true, sku: true, brand: true, price: true, stock: true, unit: true },
  });
  const productMap = new Map(products.map((product) => [product.id, product]));
  const missing = normalizedItems.find(({ productId }) => !productMap.has(productId));
  if (missing) throw new OrderCreationError("Один из товаров больше недоступен. Обновите корзину.", "PRODUCT_NOT_FOUND", 400);

  const orderItems = normalizedItems.map(({ productId, quantity }) => {
    const product = productMap.get(productId)!;
    if (quantity > product.stock) {
      throw new OrderCreationError(`Недостаточно товара «${product.name}». Доступно: ${product.stock}.`, "OUT_OF_STOCK", 409);
    }
    return {
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      brand: product.brand,
      unitPrice: product.price,
      quantity,
      totalPrice: product.price * quantity,
      unit: product.unit,
    };
  });
  const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
  let deliveryPrice: number;
  try {
    deliveryPrice = getDeliveryQuote({ city: input.customer.city, deliveryMethod: input.customer.deliveryMethod }).price;
  } catch (error) {
    if (error instanceof DeliveryQuoteError) throw new OrderCreationError(error.message, error.code, 400);
    throw error;
  }
  const provider = getPaymentProvider(input.customer.paymentMethod);
  if (isOnlinePayment(input.customer.paymentMethod) && !provider) {
    throw new OrderCreationError(ONLINE_PAYMENT_UNAVAILABLE_MESSAGE, "PAYMENT_UNAVAILABLE", 409);
  }

  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      // Nested item creation is atomic; the batch transaction also avoids Neon interactive-transaction startup latency.
      const [order] = await prisma.$transaction([
        prisma.order.create({
          data: {
            orderNumber: generateOrderNumber(),
            accessToken: generateAccessToken(),
            userId: userId ?? null,
            firstName: input.customer.firstName,
            lastName: input.customer.lastName,
            email: input.customer.email || null,
            phone: input.customer.phone,
            deliveryMethod: deliveryMap[input.customer.deliveryMethod],
            city: input.customer.city,
            address: input.customer.address || null,
            apartment: input.customer.apartment || null,
            entrance: input.customer.entrance || null,
            floor: input.customer.floor || null,
            comment: input.customer.comment || null,
            paymentMethod: paymentMap[input.customer.paymentMethod],
            paymentStatus: "PENDING",
            deliveryStatus: "PENDING",
            paymentProvider: null,
            subtotal,
            deliveryPrice,
            total: calculateOrderTotal(subtotal, deliveryPrice),
            items: { create: orderItems },
          },
          include: orderInclude,
        }),
      ]);
      // TODO: add stock reservation/decrement together with cancellation and payment-state flows.
      return order;
    } catch (error) {
      if (error instanceof OrderCreationError) throw error;
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002" && attempt < 3) continue;
      console.error("Order transaction failed");
      throw new OrderCreationError("Не удалось оформить заказ. Попробуйте ещё раз.", "ORDER_FAILED", 500);
    }
  }

  throw new OrderCreationError("Не удалось оформить заказ. Попробуйте ещё раз.", "ORDER_FAILED", 500);
}

export function getOrderByNumber(orderNumber: string) {
  return prisma.order.findUnique({ where: { orderNumber }, include: orderInclude });
}

export function getOrdersByUserId(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    include: { _count: { select: { items: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export function getOrderForUser(orderNumber: string, userId: string) {
  return prisma.order.findFirst({ where: { orderNumber, userId }, include: orderInclude });
}
