import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { Section } from "@/components/ui/section";
import { auth } from "@/lib/auth";

export const metadata: Metadata = { title: "Вход", description: "Вход в личный кабинет Remaro." };

export default async function LoginPage() {
  if (await auth()) redirect("/account");
  return (
    <Section>
      <div className="mx-auto max-w-md rounded-[var(--radius-xl)] border border-border bg-surface p-5 shadow-[var(--shadow-md)] sm:p-8">
        <h1 className="type-h2 text-center">Вход</h1><p className="mt-2 text-center text-muted">Войдите, чтобы открыть личный кабинет.</p>
        <div className="mt-7"><Suspense fallback={<div className="h-72 animate-pulse rounded-[var(--radius-md)] bg-secondary" />}><LoginForm /></Suspense></div>
      </div>
    </Section>
  );
}
