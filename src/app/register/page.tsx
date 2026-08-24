import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/register-form";
import { Section } from "@/components/ui/section";
import { auth } from "@/lib/auth";

export const metadata: Metadata = { title: "Регистрация", description: "Создание аккаунта покупателя Remaro." };

export default async function RegisterPage() {
  if (await auth()) redirect("/account");
  return (
    <Section>
      <div className="mx-auto max-w-lg rounded-[var(--radius-xl)] border border-border bg-surface p-5 shadow-[var(--shadow-md)] sm:p-8">
        <h1 className="type-h2 text-center">Регистрация</h1><p className="mt-2 text-center text-muted">Создайте аккаунт для удобного доступа к профилю.</p>
        <div className="mt-7"><RegisterForm /></div>
      </div>
    </Section>
  );
}
