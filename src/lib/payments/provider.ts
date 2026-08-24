import type { CreatePaymentInput, CreatePaymentResult, PaymentStatusResult } from "@/lib/payments/types";

export interface PaymentProvider {
  readonly name: string;
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  getPaymentStatus(reference: string): Promise<PaymentStatusResult>;
}
