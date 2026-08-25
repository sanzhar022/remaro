import Link from "next/link";
import { Container } from "@/components/ui/container";
import { BrandLogo } from "@/components/layout/brand-logo";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-[var(--navy-950)] py-12 text-white">
      <Container className="grid gap-9 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <BrandLogo />
          <p className="mt-4 max-w-sm text-sm leading-6 text-white/65">Строительные и отделочные материалы для вашего проекта в Алматы.</p>
        </div>
        <nav aria-label="Каталог">
          <p className="mb-3 font-semibold text-primary">Каталог</p>
          <div className="flex flex-col gap-2 text-sm text-white/65"><Link href="/catalog">Все категории</Link><Link href="/search">Поиск товаров</Link></div>
        </nav>
        <nav aria-label="Покупателям">
          <p className="mb-3 font-semibold">Покупателям</p>
          <div className="flex flex-col gap-2 text-sm text-white/70">
            <Link href="/catalog" className="hover:text-white">Каталог</Link>
            <Link href="/favorites" className="hover:text-white">Избранное</Link>
            <Link href="/cart" className="hover:text-white">Корзина</Link>
          </div>
        </nav>
        <div>
          <p className="mb-3 font-semibold text-primary">Контакты</p>
          <p className="text-sm leading-6 text-white/65">Алматы, Казахстан<br />Ежедневно с 09:00 до 20:00</p>
        </div>
      </Container>
      <Container className="mt-10 border-t border-white/10 pt-6 text-xs text-white/45">© {new Date().getFullYear()} Remaro Group. Все права защищены.</Container>
    </footer>
  );
}
