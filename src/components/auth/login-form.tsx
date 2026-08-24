"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginSchema, type LoginFormData } from "@/lib/auth-schema";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const submit = async (data: LoginFormData) => {
    const result = await signIn("credentials", { ...data, redirect: false });
    if (result?.error) {
      setError("root", { message: "Неверный email или пароль." });
      return;
    }
    router.push("/account");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-5">
      {searchParams.get("registered") === "true" && <p className="rounded-[var(--radius-md)] bg-[#e2f3e9] p-3 text-sm text-success">Аккаунт создан. Теперь войдите.</p>}
      <AuthField label="Email" error={errors.email?.message}><Input type="email" autoComplete="email" error={Boolean(errors.email)} {...register("email")} /></AuthField>
      <AuthField label="Пароль" error={errors.password?.message}><Input type="password" autoComplete="current-password" error={Boolean(errors.password)} {...register("password")} /></AuthField>
      {errors.root?.message && <p role="alert" className="text-sm text-destructive">{errors.root.message}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>{isSubmitting ? "Входим..." : "Войти"}</Button>
      <p className="text-center text-sm text-muted">Нет аккаунта? <Link href="/register" className="font-semibold text-primary hover:text-primary-hover">Зарегистрироваться</Link></p>
    </form>
  );
}

function AuthField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label><span className="mb-1.5 block text-sm font-semibold">{label}</span>{children}{error && <span role="alert" className="mt-1 block text-sm text-destructive">{error}</span>}</label>;
}
