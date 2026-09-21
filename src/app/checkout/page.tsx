import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutContent } from "@/components/checkout/checkout-content";
import { Section } from "@/components/ui/section";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Оформление заказа",
  description: "Оформление заказа в интернет-магазине Remaro.",
};

export default async function CheckoutPage() {
  const session=await auth();
  const user=session?.user?.id?await prisma.user.findUnique({where:{id:session.user.id},select:{firstName:true,lastName:true,phone:true,email:true}}):null;
  return (
    <Section>
      <nav aria-label="Хлебные крошки" className="type-small mb-6 flex items-center gap-2 text-muted">
        <Link href="/" className="hover:text-primary">Главная</Link><span aria-hidden="true">/</span><Link href="/cart" className="hover:text-primary">Корзина</Link><span aria-hidden="true">/</span><span aria-current="page" className="text-foreground">Оформление</span>
      </nav>
      <h1 className="type-h1 mb-10">Оформление заказа</h1>
      <CheckoutContent initialValues={user?{firstName:user.firstName??"",lastName:user.lastName??"",phone:user.phone??"",email:user.email}:undefined} />
    </Section>
  );
}
