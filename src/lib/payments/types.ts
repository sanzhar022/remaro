import type { PaymentStatus } from "@/generated/prisma/client";
import type { PaymentMethod } from "@/types/checkout";

export interface CreatePaymentInput { orderNumber: string; amount: number; currency: "KZT"; method: PaymentMethod }
export interface CreatePaymentResult { reference?: string; status: PaymentStatus; redirectUrl?: string }
export interface PaymentStatusResult { reference: string; status: PaymentStatus }
