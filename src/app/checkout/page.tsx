import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutContent } from "@/components/checkout/checkout-content";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Оформление заказа",
  description: "Оформление заказа в интернет-магазине Remaro.",
};

export default function CheckoutPage() {
  return (
    <Section>
      <nav aria-label="Хлебные крошки" className="type-small mb-6 flex items-center gap-2 text-muted">
        <Link href="/" className="hover:text-primary">Главная</Link><span aria-hidden="true">/</span><Link href="/cart" className="hover:text-primary">Корзина</Link><span aria-hidden="true">/</span><span aria-current="page" className="text-foreground">Оформление</span>
      </nav>
      <h1 className="type-h1 mb-10">Оформление заказа</h1>
      <CheckoutContent />
    </Section>
  );
}
