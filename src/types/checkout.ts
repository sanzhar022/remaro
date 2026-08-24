export type DeliveryMethod = "delivery" | "pickup";
export type PaymentMethod = "card" | "kaspi" | "cash";

export interface CheckoutFormData {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  deliveryMethod: DeliveryMethod;
  city: string;
  address?: string;
  apartment?: string;
  entrance?: string;
  floor?: string;
  comment?: string;
  paymentMethod: PaymentMethod;
  privacyAccepted: boolean;
}
