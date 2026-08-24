export interface CreateOrderResponse {
  orderNumber: string;
  accessToken: string;
  total: number;
}

export interface OrderApiError {
  error: string;
  code?: "VALIDATION" | "PRODUCT_NOT_FOUND" | "OUT_OF_STOCK" | "UNSUPPORTED_DELIVERY_CITY" | "PAYMENT_UNAVAILABLE" | "ORDER_FAILED";
}
