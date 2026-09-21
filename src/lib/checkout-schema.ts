import { z } from "zod";

const optionalText = z.string().trim().optional();
export function normalizeKazakhstanPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && (digits.startsWith("7") || digits.startsWith("8"))) return `+7${digits.slice(1)}`;
  if (digits.length === 10) return `+7${digits}`;
  return null;
}

export const checkoutSchema = z.object({
  firstName: z.string().trim().min(1, "Введите имя"),
  lastName: z.string().trim().min(1, "Введите фамилию"),
  phone: z.string().trim().min(1, "Введите телефон").refine(
    (phone) => normalizeKazakhstanPhone(phone) !== null,
    "Введите корректный номер телефона",
  ),
  email: z.string().trim().refine(
    (email) => email === "" || z.email().safeParse(email).success,
    "Введите корректный email",
  ).optional(),
  deliveryMethod: z.enum(["delivery", "pickup"]),
  city: z.string().trim().min(1, "Введите город"),
  address: optionalText,
  apartment: optionalText,
  entrance: optionalText,
  floor: optionalText,
  comment: optionalText,
  paymentMethod: z.enum(["card", "kaspi", "cash"]),
  privacyAccepted: z.boolean().refine((accepted) => accepted, "Необходимо согласие на обработку данных"),
}).superRefine((data, context) => {
  if (data.deliveryMethod === "delivery" && !data.address?.trim()) {
    context.addIssue({ code: "custom", path: ["address"], message: "Введите адрес доставки" });
  }
});
