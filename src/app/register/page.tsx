import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/register-form";
import { BrandLogo } from "@/components/layout/brand-logo";
import { Section } from "@/components/ui/section";
import { auth } from "@/lib/auth";

export const metadata: Metadata = { title: "Регистрация", description: "Создание аккаунта покупателя Remaro." };

export default async function RegisterPage() {
  if (await auth()) redirect("/account");
  return (
    <Section>
      <div className="mx-auto max-w-lg overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface shadow-[var(--shadow-md)]">
        <div className="flex justify-center bg-[var(--navy-900)] px-5 py-6"><BrandLogo /></div>
        <div className="p-5 sm:p-8">
          <h1 className="type-h2 text-center">Регистрация</h1><p className="mt-2 text-center text-muted">Создайте аккаунт для удобного доступа к профилю.</p>
          <div className="mt-7"><RegisterForm /></div>
        </div>
      </div>
    </Section>
  );
}
