import type { Metadata } from "next";
import { Package, Settings, Truck } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ProfileCard } from "@/components/account/profile-card";
import { Section } from "@/components/ui/section";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Личный кабинет", description: "Профиль покупателя Remaro." };

const sections = [
  { icon: Package, title: "Мои заказы", text: "История и подробности оформленных заказов", href: "/account/orders" },
  { icon: Truck, title: "Адреса доставки", text: "Сохранённые адреса будут доступны позже" },
  { icon: Settings, title: "Настройки профиля", text: "Редактирование данных будет добавлено позже" },
] as const;

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { firstName: true, lastName: true, email: true, phone: true, createdAt: true },
  });
  if (!user) redirect("/login");

  return (
    <Section>
      <header className="mb-8"><h1 className="type-h1">Личный кабинет</h1><p className="mt-3 text-lg text-muted">Здравствуйте, {user.firstName || "покупатель"}!</p></header>
      <ProfileCard {...user} />
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {sections.map(({ icon: Icon, title, text, ...section }) => {
          const content = <><span className="grid size-11 place-items-center rounded-[var(--radius-md)] bg-secondary text-primary"><Icon size={21} aria-hidden="true" /></span><h2 className="type-h3 mt-4">{title}</h2><p className="type-small mt-2 text-muted">{text}</p></>;
          return "href" in section
            ? <Link key={title} href={section.href} className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-sm)] transition hover:border-primary/30 hover:shadow-[var(--shadow-md)]">{content}</Link>
            : <section key={title} className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-sm)]">{content}</section>;
        })}
      </div>
    </Section>
  );
}
