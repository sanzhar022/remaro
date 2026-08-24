import type { DeliveryMethod, DeliveryStatus, OrderStatus, PaymentMethod, PaymentStatus } from "@/generated/prisma/client";

const statusLabels: Record<OrderStatus, string> = {
  PENDING: "Ожидает подтверждения",
  CONFIRMED: "Подтверждён",
  PROCESSING: "В обработке",
  READY: "Готов к выдаче",
  SHIPPED: "Передан в доставку",
  COMPLETED: "Выполнен",
  CANCELLED: "Отменён",
};

const deliveryLabels: Record<DeliveryMethod, string> = {
  DELIVERY: "Доставка",
  PICKUP: "Самовывоз",
};

const paymentLabels: Record<PaymentMethod, string> = {
  CARD: "Банковская карта",
  KASPI: "Kaspi",
  CASH: "При получении",
};

const paymentStatusLabels: Record<PaymentStatus, string> = {
  PENDING: "Ожидает оплаты",
  PAID: "Оплачен",
  FAILED: "Ошибка оплаты",
  CANCELLED: "Отменён",
  REFUNDED: "Возврат",
};

const deliveryStatusLabels: Record<DeliveryStatus, string> = {
  PENDING: "Ожидает обработки",
  PREPARING: "Готовится",
  READY_FOR_PICKUP: "Готов к самовывозу",
  HANDED_TO_COURIER: "Передан курьеру",
  IN_TRANSIT: "В пути",
  DELIVERED: "Доставлен",
  CANCELLED: "Отменена",
};

export const formatOrderStatus = (status: OrderStatus) => statusLabels[status];
export const formatDeliveryMethod = (method: DeliveryMethod) => deliveryLabels[method];
export const formatPaymentMethod = (method: PaymentMethod) => paymentLabels[method];
export const formatPaymentStatus = (status: PaymentStatus) => paymentStatusLabels[status];
export const formatDeliveryStatus = (status: DeliveryStatus) => deliveryStatusLabels[status];
