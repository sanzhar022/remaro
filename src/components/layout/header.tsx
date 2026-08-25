import { MapPin, Menu } from "lucide-react";
import Link from "next/link";
import { CartHeaderButton } from "@/components/cart/cart-header-button";
import { AccountHeaderButton } from "@/components/auth/account-header-button";
import { FavoritesHeaderButton } from "@/components/favorites/favorites-header-button";
import { HeaderSearch } from "@/components/search/header-search";
import { buttonClassName } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { BrandLogo } from "@/components/layout/brand-logo";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[var(--navy-950)] text-white shadow-[0_8px_24px_rgb(7_24_42/0.16)]">
      <Container className="hidden min-h-[74px] items-center gap-3 lg:flex xl:gap-5">
        <Link href="/" aria-label="Remaro — главная" className="shrink-0 rounded-md focus-visible:ring-2 focus-visible:ring-primary"><BrandLogo /></Link>
        <Link href="/catalog" className={buttonClassName({ className: "h-12 px-5" })}><Menu size={20} aria-hidden="true" />Каталог</Link>
        <div className="min-w-0 flex-1"><HeaderSearch /></div>
        <div className="hidden items-center gap-2 px-2 text-sm xl:flex"><MapPin size={19} className="text-primary" aria-hidden="true" /><span>Алматы</span></div>
        <nav aria-label="Пользовательское меню" className="flex items-center gap-1"><FavoritesHeaderButton /><AccountHeaderButton /><CartHeaderButton /></nav>
      </Container>
      <Container className="py-2.5 lg:hidden">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <Link href="/" aria-label="Remaro — главная" className="shrink-0"><BrandLogo className="!h-[34px] !w-[146px] [&_img]:!-left-[180px] [&_img]:!-top-[60px] [&_img]:!w-[346px]" /></Link>
          <div className="flex items-center gap-1"><Link href="/catalog" aria-label="Каталог" className="grid size-11 place-items-center rounded-md border border-white/15 text-white hover:border-primary hover:text-primary"><Menu size={21} /></Link><AccountHeaderButton /><CartHeaderButton /></div>
        </div>
        <div className="mt-2.5"><HeaderSearch /></div>
      </Container>
    </header>
  );
}
