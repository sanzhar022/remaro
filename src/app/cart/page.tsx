import type { Metadata } from "next";
import Link from "next/link";
import { CartContent } from "@/components/cart/cart-content";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Корзина",
  description: "Товары, добавленные в корзину Remaro.",
};

export default function CartPage() {
  return (
    <Section>
      <nav aria-label="Хлебные крошки" className="type-small mb-6 flex items-center gap-2 text-muted">
        <Link href="/" className="hover:text-primary">Главная</Link><span aria-hidden="true">/</span><span aria-current="page" className="text-foreground">Корзина</span>
      </nav>
      <h1 className="type-h1 mb-10">Корзина</h1>
      <CartContent />
    </Section>
  );
}
