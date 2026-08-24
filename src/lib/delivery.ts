import "server-only";
import type { DeliveryMethod } from "@/types/checkout";

export const DELIVERY_CITY = "Алматы";
export const PICKUP_ADDRESS = "г. Алматы, ул. Примерная, 10";
export const PICKUP_HOURS = "Ежедневно 09:00–20:00";

export class DeliveryQuoteError extends Error {
  readonly code = "UNSUPPORTED_DELIVERY_CITY";
}

export interface DeliveryQuote {
  price: number;
  eta: string;
  description: string;
}

export function getDeliveryQuote({ city, deliveryMethod }: { city: string; deliveryMethod: DeliveryMethod }): DeliveryQuote {
  if (city.trim().toLocaleLowerCase("ru-KZ") !== DELIVERY_CITY.toLocaleLowerCase("ru-KZ")) {
    throw new DeliveryQuoteError("Сейчас доставка и самовывоз доступны только в Алматы.");
  }
  if (deliveryMethod === "pickup") {
    return { price: 0, eta: "После подтверждения заказа", description: `${PICKUP_ADDRESS} · ${PICKUP_HOURS}` };
  }
  return { price: 2000, eta: "Ориентировочно 1–2 дня", description: "Доставка курьером по Алматы" };
}
