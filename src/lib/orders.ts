import "server-only";
import { randomBytes } from "node:crypto";
import { DeliveryMethod, PaymentMethod, Prisma } from "@/generated/prisma/client";
import { calculateOrderTotal } from "@/lib/checkout";
import { normalizeKazakhstanPhone } from "@/lib/checkout-schema";
import { DeliveryQuoteError, getDeliveryQuote } from "@/lib/delivery";
import { getPaymentProvider, isOnlinePayment, ONLINE_PAYMENT_UNAVAILABLE_MESSAGE } from "@/lib/payment-service";
import type { CreateOrderRequest } from "@/lib/order-schema";
import { prisma } from "@/lib/prisma";

export class OrderCreationError extends Error {
  constructor(
    message: string,
    readonly code: "VALIDATION" | "PRODUCT_NOT_FOUND" | "OUT_OF_STOCK" | "UNSUPPORTED_DELIVERY_CITY" | "PAYMENT_UNAVAILABLE" | "ORDER_FAILED",
    readonly status: number,
  ) {
    super(message);
  }
}

const orderInclude = { items: { orderBy: { createdAt: "asc" as const }, include: { product: { select: { images: { orderBy: { order: "asc" as const }, take: 1, select: { url: true, alt: true } } } } } } };

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
  if (normalizedItems.some(({productId})=>productId==="admin-test-product")) throw new OrderCreationError("Служебный товар недоступен для заказа.", "PRODUCT_NOT_FOUND", 400);
  const phone=normalizeKazakhstanPhone(input.customer.phone);
  if(!phone)throw new OrderCreationError("Введите корректный номер телефона.","VALIDATION",400);
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
      const order = await prisma.$transaction(async(tx)=>{
        const products=await tx.product.findMany({where:{id:{in:normalizedItems.map(({productId})=>productId)}},select:{id:true,slug:true,name:true,sku:true,brand:true,price:true,stock:true,unit:true}});
        const productMap=new Map(products.map(product=>[product.id,product]));
        const missing=normalizedItems.find(({productId})=>!productMap.has(productId));
        if(missing)throw new OrderCreationError("Один из товаров больше недоступен. Обновите корзину.","PRODUCT_NOT_FOUND",400);
        const orderItems=normalizedItems.map(({productId,quantity})=>{const product=productMap.get(productId)!;if(product.id==="admin-test-product"||product.slug.startsWith("test-")||product.slug.includes("admin-test"))throw new OrderCreationError("Служебный товар недоступен для заказа.","PRODUCT_NOT_FOUND",400);if(product.price<0)throw new OrderCreationError("Цена товара некорректна. Обратитесь в магазин.","ORDER_FAILED",409);if(product.stock<=0||quantity>product.stock)throw new OrderCreationError(`Недостаточно товара «${product.name}». Доступно: ${Math.max(0,product.stock)}.`,"OUT_OF_STOCK",409);return{productId:product.id,productName:product.name,sku:product.sku,brand:product.brand,unitPrice:product.price,quantity,totalPrice:product.price*quantity,unit:product.unit}});
        for(const item of orderItems){const reserved=await tx.product.updateMany({where:{id:item.productId,stock:{gte:item.quantity}},data:{stock:{decrement:item.quantity}}});if(reserved.count!==1)throw new OrderCreationError(`Недостаточно товара «${item.productName}». Обновите корзину.`,"OUT_OF_STOCK",409)}
        const subtotal=orderItems.reduce((sum,item)=>sum+item.totalPrice,0);
        return tx.order.create({
          data: {
            orderNumber: generateOrderNumber(),
            accessToken: generateAccessToken(),
            userId: userId ?? null,
            firstName: input.customer.firstName,
            lastName: input.customer.lastName,
            email: input.customer.email || null,
            phone,
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
            stockReserved: true,
            items: { create: orderItems },
          },
          include: orderInclude,
        });
      },{isolationLevel:Prisma.TransactionIsolationLevel.Serializable});
      return order;
    } catch (error) {
      if (error instanceof OrderCreationError) throw error;
      if (error instanceof Prisma.PrismaClientKnownRequestError && ["P2002","P2034"].includes(error.code) && attempt < 3) continue;
      console.error("Order transaction failed");
      throw new OrderCreationError("Не удалось оформить заказ. Попробуйте ещё раз.", "ORDER_FAILED", 500);
    }
  }

  throw new OrderCreationError("Не удалось оформить заказ. Попробуйте ещё раз.", "ORDER_FAILED", 500);
}

export function getOrderByNumber(orderNumber: string) {
  return prisma.order.findUnique({ where: { orderNumber }, include: orderInclude });
}

export async function getOrdersByUserId(userId: string,page=1,pageSize=10) {
  const where={userId};
  const [items,total]=await Promise.all([prisma.order.findMany({where,select:{id:true,orderNumber:true,status:true,paymentStatus:true,deliveryStatus:true,deliveryMethod:true,total:true,createdAt:true,_count:{select:{items:true}}},orderBy:{createdAt:"desc"},skip:(page-1)*pageSize,take:pageSize}),prisma.order.count({where})]);
  return{items,total};
}

export function getOrderForUser(orderNumber: string, userId: string) {
  return prisma.order.findFirst({ where: { orderNumber, userId }, include: orderInclude });
}
