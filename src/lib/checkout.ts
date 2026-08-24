import type { DeliveryMethod } from "@/types/checkout";

export function getDeliveryPrice(method: DeliveryMethod, city = "Алматы"): number {
  return city.trim().toLocaleLowerCase("ru-KZ") === "алматы" && method === "delivery" ? 2000 : 0;
}

export function calculateOrderTotal(subtotal: number, deliveryPrice: number): number {
  return subtotal + deliveryPrice;
}
