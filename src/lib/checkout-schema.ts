import { z } from "zod";

const optionalText = z.string().trim().optional();

export const checkoutSchema = z.object({
  firstName: z.string().trim().min(1, "Введите имя"),
  lastName: z.string().trim().min(1, "Введите фамилию"),
  phone: z.string().trim().min(1, "Введите телефон").refine(
    (phone) => phone.replace(/\D/g, "").length >= 10,
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
  if (data.city.trim().toLocaleLowerCase("ru-KZ") !== "алматы") {
    context.addIssue({ code: "custom", path: ["city"], message: "Сейчас доставка и самовывоз доступны только в Алматы" });
  }
  if (data.deliveryMethod === "delivery" && !data.address?.trim()) {
    context.addIssue({ code: "custom", path: ["address"], message: "Введите адрес доставки" });
  }
});
