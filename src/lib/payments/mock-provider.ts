import type { PaymentProvider } from "@/lib/payments/provider";

/** Development placeholder only. It never reports a successful payment or creates fake references. */
export class UnavailablePaymentProvider implements PaymentProvider {
  readonly name = "unavailable";
  async createPayment() { return { status: "PENDING" as const }; }
  async getPaymentStatus(reference: string) { return { reference, status: "PENDING" as const }; }
}
