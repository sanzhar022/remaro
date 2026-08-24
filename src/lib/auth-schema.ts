import { z } from "zod";

const normalizedEmail = z.email("Введите корректный email").transform((value) => value.trim().toLowerCase());
const securePassword = z.string().min(8, "Пароль должен содержать минимум 8 символов")
  .regex(/[A-Za-zА-Яа-яЁё]/, "Пароль должен содержать хотя бы одну букву")
  .regex(/\d/, "Пароль должен содержать хотя бы одну цифру");

export const loginSchema = z.object({
  email: normalizedEmail,
  password: z.string().min(1, "Введите пароль"),
});

export const registerSchema = z.object({
  firstName: z.string().trim().min(1, "Введите имя"),
  lastName: z.string().trim().min(1, "Введите фамилию"),
  email: normalizedEmail,
  phone: z.string().trim().optional(),
  password: securePassword,
  confirmPassword: z.string().min(1, "Повторите пароль"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
