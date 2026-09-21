import type { DeliveryMethod } from "@/types/checkout";

export function getDeliveryPrice(method: DeliveryMethod, city = "Алматы"): number {
  void method;
  void city;
  return 0;
}

export function calculateOrderTotal(subtotal: number, deliveryPrice: number): number {
  return subtotal + deliveryPrice;
}
