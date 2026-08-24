import "server-only";
import type { PaymentMethod } from "@/types/checkout";

export const ONLINE_PAYMENT_UNAVAILABLE_MESSAGE = "Онлайн-оплата временно недоступна. Менеджер свяжется с вами для подтверждения.";
export const paymentsEnabled = () => process.env.PAYMENTS_ENABLED === "true";
export const isOnlinePayment = (method: PaymentMethod) => method === "card" || method === "kaspi";
export const isPaymentMethodAvailable = (method: PaymentMethod) => method === "cash" || paymentsEnabled();

export function getPaymentProvider(method: PaymentMethod) {
  if (!isOnlinePayment(method) || !paymentsEnabled()) return null;
  // Future provider selection belongs here. A real provider must validate webhook signature,
  // reference, amount, KZT currency and idempotency before updating an order.
  return null;
}
