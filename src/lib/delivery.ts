import "server-only";
import { companyInfo } from "@/lib/company-info";
import type { DeliveryMethod } from "@/types/checkout";

export class DeliveryQuoteError extends Error {
  readonly code = "UNSUPPORTED_DELIVERY_CITY";
}

export interface DeliveryQuote {
  price: number;
  eta: string;
  description: string;
}

export function getDeliveryQuote({ city, deliveryMethod }: { city: string; deliveryMethod: DeliveryMethod }): DeliveryQuote {
  if (!city.trim()) throw new DeliveryQuoteError("Укажите город.");
  if (deliveryMethod === "pickup") {
    return { price: 0, eta: "После подтверждения заказа", description: companyInfo.pickup.detailsText };
  }
  return { price: 0, eta: "После подтверждения заказа", description: companyInfo.delivery.priceText };
}
