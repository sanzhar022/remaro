import {
  ChevronDown,
  MapPin,
  Menu,
} from "lucide-react";
import Link from "next/link";
import { CartHeaderButton } from "@/components/cart/cart-header-button";
import { AccountHeaderButton } from "@/components/auth/account-header-button";
import { FavoritesHeaderButton } from "@/components/favorites/favorites-header-button";
import { HeaderSearch } from "@/components/search/header-search";
import { Button, buttonClassName } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export function Header() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="bg-[#123d2b] py-2 text-xs text-white/80">
        <Container className="flex justify-between gap-4">
          <p>Строительные материалы с доставкой по Казахстану</p>
          <p className="hidden sm:block">Для дома, ремонта и стройки</p>
        </Container>
      </div>

      <Container className="flex min-h-20 flex-wrap items-center gap-3 py-3 lg:flex-nowrap">
        <Link href="/" className="mr-auto text-2xl font-black tracking-tight text-primary" aria-label="Remaro — главная">
          REMARO<span className="text-success">.</span>
        </Link>

        <Link href="/catalog" className={buttonClassName({ className: "order-2 lg:order-none" })} aria-label="Открыть каталог">
          <Menu size={20} aria-hidden="true" />
          <span>Каталог</span>
        </Link>

        <HeaderSearch />

        <Button variant="ghost" className="order-2 hidden px-3 text-left md:inline-flex lg:order-none" aria-label="Выбрать город">
          <MapPin size={20} className="text-primary" aria-hidden="true" />
          <span><span className="block text-xs font-normal text-muted">Ваш город</span><span className="flex items-center gap-1">Алматы <ChevronDown size={14} aria-hidden="true" /></span></span>
        </Button>

        <nav aria-label="Пользовательское меню" className="order-2 flex items-center gap-1 lg:order-none">
          <FavoritesHeaderButton />
          <AccountHeaderButton />
          <CartHeaderButton />
        </nav>
      </Container>
    </header>
  );
}
