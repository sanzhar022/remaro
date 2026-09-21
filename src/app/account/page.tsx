import type { Metadata } from "next";
import { CalendarDays, Package } from "lucide-react";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/account/profile-form";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Личный кабинет", description: "Профиль покупателя Remaro." };

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user,ordersCount] = await Promise.all([prisma.user.findUnique({where:{id:session.user.id},select:{firstName:true,lastName:true,email:true,phone:true,createdAt:true}}),prisma.order.count({where:{userId:session.user.id}})]);
  if (!user) redirect("/login");

  return (
    <>
      <header className="mb-8"><h1 className="type-h1">Личный кабинет</h1><p className="mt-3 text-lg text-muted">Здравствуйте, {user.firstName || "покупатель"}!</p></header>
      <div className="mb-6 grid gap-4 sm:grid-cols-2"><Summary icon={Package} label="Заказов в аккаунте" value={String(ordersCount)}/><Summary icon={CalendarDays} label="Покупатель с" value={new Intl.DateTimeFormat("ru-KZ",{dateStyle:"long"}).format(user.createdAt)}/></div>
      <ProfileForm firstName={user.firstName} lastName={user.lastName} email={user.email} phone={user.phone}/>
      <section className="mt-6 rounded-lg border border-border bg-surface p-5"><h2 className="type-h3">Безопасность аккаунта</h2><p className="mt-2 text-sm text-muted">Изменение пароля требует отдельного защищённого flow с повторным подтверждением личности и поэтому сейчас недоступно в кабинете.</p></section>
    </>
  );
}

function Summary({icon:Icon,label,value}:{icon:typeof Package;label:string;value:string}){return <div className="flex items-center gap-4 rounded-lg border border-border bg-surface p-5"><span className="grid size-11 shrink-0 place-items-center rounded-md bg-secondary text-primary"><Icon size={21} aria-hidden="true"/></span><div><p className="text-sm text-muted">{label}</p><p className="mt-1 font-bold">{value}</p></div></div>}
