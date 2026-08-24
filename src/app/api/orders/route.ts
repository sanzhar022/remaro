import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createOrderRequestSchema } from "@/lib/order-schema";
import { createOrder, OrderCreationError } from "@/lib/orders";
import { rateLimiter, rateLimitKey } from "@/lib/rate-limit";
import { isSameOrigin } from "@/lib/request-security";

export async function POST(request: Request) {
  try {
    if (!isSameOrigin(request)) return NextResponse.json({ error: "Недопустимый источник запроса.", code: "VALIDATION" }, { status: 403 });
    if (!(await rateLimiter.check(rateLimitKey(request, "orders"))).allowed) return NextResponse.json({ error: "Слишком много запросов.", code: "VALIDATION" }, { status: 429 });
    const payload: unknown = await request.json();
    const parsed = createOrderRequestSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Проверьте данные заказа.", code: "VALIDATION" }, { status: 400 });
    }

    const session = await auth();
    const order = await createOrder(parsed.data, session?.user?.id);
    return NextResponse.json({ orderNumber: order.orderNumber, accessToken: order.accessToken, total: order.total }, { status: 201 });
  } catch (error) {
    if (error instanceof OrderCreationError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    }
    console.error("Order creation failed", error);
    return NextResponse.json({ error: "Не удалось оформить заказ. Попробуйте ещё раз.", code: "ORDER_FAILED" }, { status: 500 });
  }
}
