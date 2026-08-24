import Link from "next/link";
import { Container } from "@/components/ui/container";

export function Footer() {
  return (
    <footer className="mt-auto bg-[#123d2b] py-10 text-white">
      <Container className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="text-2xl font-black">REMARO<span className="text-[#67b786]">.</span></p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-white/70">Материалы для стройки и ремонта с удобной доставкой по Казахстану.</p>
        </div>
        <nav aria-label="Разделы сайта">
          <p className="mb-3 font-semibold">Покупателям</p>
          <div className="flex flex-col gap-2 text-sm text-white/70">
            <Link href="/catalog" className="hover:text-white">Каталог</Link>
            <Link href="/favorites" className="hover:text-white">Избранное</Link>
            <Link href="/cart" className="hover:text-white">Корзина</Link>
          </div>
        </nav>
        <div>
          <p className="mb-3 font-semibold">Мы на связи</p>
          <p className="text-sm leading-6 text-white/70">Ежедневно с 09:00 до 20:00<br />Алматы, Казахстан</p>
        </div>
      </Container>
      <Container className="mt-8 border-t border-white/15 pt-6 text-xs text-white/50">© 2026 Remaro. Все права защищены.</Container>
    </footer>
  );
}
