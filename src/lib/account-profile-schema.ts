import { z } from "zod";
import { normalizeKazakhstanPhone } from "@/lib/checkout-schema";

export const accountProfileSchema = z.object({
  firstName: z.string().trim().min(1, "Введите имя").max(100, "Имя слишком длинное"),
  lastName: z.string().trim().min(1, "Введите фамилию").max(100, "Фамилия слишком длинная"),
  phone: z.string().trim().refine((value)=>value===""||normalizeKazakhstanPhone(value)!==null,"Введите корректный номер телефона"),
});
