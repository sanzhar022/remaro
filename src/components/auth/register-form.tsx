"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerSchema, type RegisterFormData } from "@/lib/auth-schema";

export function RegisterForm() {
  const router = useRouter();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: "", lastName: "", email: "", phone: "", password: "", confirmPassword: "" },
  });

  const submit = async (data: RegisterFormData) => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result: unknown = await response.json();
    if (!response.ok) {
      const message = typeof result === "object" && result && "message" in result ? String(result.message) : "Не удалось создать аккаунт.";
      setError("root", { message });
      return;
    }

    const signInResult = await signIn("credentials", { email: data.email, password: data.password, redirect: false });
    if (signInResult?.error) {
      router.push("/login?registered=true");
      return;
    }
    router.push("/account");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <AuthField label="Имя" error={errors.firstName?.message}><Input autoComplete="given-name" error={Boolean(errors.firstName)} {...register("firstName")} /></AuthField>
        <AuthField label="Фамилия" error={errors.lastName?.message}><Input autoComplete="family-name" error={Boolean(errors.lastName)} {...register("lastName")} /></AuthField>
      </div>
      <AuthField label="Email" error={errors.email?.message}><Input type="email" autoComplete="email" error={Boolean(errors.email)} {...register("email")} /></AuthField>
      <AuthField label="Телефон" error={errors.phone?.message}><Input type="tel" autoComplete="tel" placeholder="+7 777 123 45 67" error={Boolean(errors.phone)} {...register("phone")} /></AuthField>
      <AuthField label="Пароль" error={errors.password?.message}><Input type="password" autoComplete="new-password" error={Boolean(errors.password)} {...register("password")} /></AuthField>
      <AuthField label="Повторите пароль" error={errors.confirmPassword?.message}><Input type="password" autoComplete="new-password" error={Boolean(errors.confirmPassword)} {...register("confirmPassword")} /></AuthField>
      {errors.root?.message && <p role="alert" className="text-sm text-destructive">{errors.root.message}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>{isSubmitting ? "Создаём аккаунт..." : "Зарегистрироваться"}</Button>
      <p className="text-center text-sm text-muted">Уже есть аккаунт? <Link href="/login" className="font-semibold text-primary hover:text-primary-hover">Войти</Link></p>
    </form>
  );
}

function AuthField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label><span className="mb-1.5 block text-sm font-semibold">{label}</span>{children}{error && <span role="alert" className="mt-1 block text-sm text-destructive">{error}</span>}</label>;
}
