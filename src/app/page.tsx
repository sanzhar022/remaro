import { ArrowRight, Clock3, CreditCard, Headphones, MapPin, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";
import { CategoryGrid } from "@/components/catalog/category-grid";
import { ProductGrid } from "@/components/product/product-grid";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SectionHeader } from "@/components/ui/section-header";
import { getFeaturedCategories } from "@/lib/categories";
import { getPopularProducts } from "@/lib/products";

const benefits = [
  { icon: Truck, title: "Быстрая доставка", text: "Привезём материалы на ваш объект в удобное время" },
  { icon: ShieldCheck, title: "Проверенные товары", text: "Работаем с надёжными производителями" },
  { icon: CreditCard, title: "Удобная оплата", text: "Выбирайте подходящий способ оплаты заказа" },
  { icon: Headphones, title: "Поддержка покупателей", text: "Поможем подобрать материалы для вашего проекта" },
] as const;

export default async function HomePage() {
  const [featuredCategories, popularProducts] = await Promise.all([
    getFeaturedCategories(),
    getPopularProducts(),
  ]);

  return (
    <>
      <section className="bg-[var(--navy-950)] py-10 text-white sm:py-14 lg:py-16">
        <Container>
          <div className="relative isolate overflow-hidden rounded-[var(--radius-xl)] border border-white/10 bg-[var(--navy-900)] px-5 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
            <div className="relative z-10 max-w-3xl">
              <Badge className="mb-5 border border-primary/30 bg-primary/10 text-primary">Remaro · Алматы</Badge>
              <h1 className="type-h1 max-w-3xl">Строительные материалы<br className="hidden sm:block" /> для вашего проекта</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/65 sm:text-lg">Надёжные материалы для строительства и ремонта. Удобный заказ, доставка и самовывоз в Алматы.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/catalog" className={buttonClassName({ size: "lg" })}>Перейти в каталог <ArrowRight size={19} aria-hidden="true" /></Link>
                <Link href="/search" className="inline-flex h-13 items-center justify-center rounded-md border border-white/20 px-6 font-semibold text-white transition hover:border-primary hover:text-primary">Найти товар</Link>
              </div>
            </div>
            <div className="absolute -bottom-32 -right-24 -z-10 size-96 rounded-full border-[70px] border-primary/10" aria-hidden="true" />
            <div className="absolute right-24 top-10 -z-10 hidden h-40 w-px bg-gradient-to-b from-transparent via-primary/40 to-transparent lg:block" aria-hidden="true" />
          </div>
        </Container>
      </section>

      <Section aria-labelledby="featured-categories-title">
        <SectionHeader
          title="Популярные категории"
          description="Начните с нужного раздела каталога"
          href="/catalog"
          className="[&_h2]:scroll-mt-24"
        />
        <span id="featured-categories-title" className="sr-only">Популярные категории</span>
        <CategoryGrid categories={featuredCategories.slice(0, 8)} />
      </Section>

      <Section aria-labelledby="popular-products-title" className="bg-surface">
        <SectionHeader
          title="Популярные товары"
          description="То, что часто выбирают для ремонта и строительства"
        />
        <span id="popular-products-title" className="sr-only">Популярные товары</span>
        <ProductGrid products={popularProducts.slice(0, 8)} />
      </Section>

      <Section aria-labelledby="benefits-title" className="pt-5 sm:pt-8">
        <h2 id="benefits-title" className="sr-only">Преимущества Remaro</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {benefits.map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)] sm:p-6">
              <span className="mb-5 grid size-12 place-items-center rounded-[var(--radius-md)] bg-[var(--navy-950)] text-primary"><Icon size={23} aria-hidden="true" /></span>
              <h3 className="type-h3">{title}</h3>
              <p className="type-small mt-2 text-muted">{text}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <div className="grid overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface shadow-[var(--shadow-sm)] lg:grid-cols-2">
          <div className="p-6 sm:p-9"><span className="grid size-11 place-items-center rounded-md bg-secondary text-[var(--navy-900)]"><Truck /></span><h2 className="type-h2 mt-5">Доставка по Алматы</h2><p className="mt-3 text-muted">Доставим заказ по указанному адресу. Стоимость — 2 000 ₸, ориентировочный срок — 1–2 дня.</p></div>
          <div className="border-t border-border bg-[var(--navy-900)] p-6 text-white sm:p-9 lg:border-l lg:border-t-0"><div className="flex gap-3 text-primary"><MapPin /><Clock3 /></div><h2 className="type-h2 mt-5">Самовывоз</h2><p className="mt-3 text-white/65">Получение в Алматы после подтверждения заказа. Самовывоз бесплатный.</p></div>
        </div>
      </Section>

      <Section className="pt-0"><div className="rounded-[var(--radius-xl)] bg-primary px-6 py-9 text-center text-[var(--navy-950)] sm:px-10"><h2 className="type-h2">Начните с каталога Remaro</h2><p className="mx-auto mt-2 max-w-2xl text-[var(--navy-900)]/75">Выберите материалы для следующего этапа вашего проекта.</p><Link href="/catalog" className="mt-6 inline-flex h-12 items-center gap-2 rounded-md bg-[var(--navy-950)] px-6 font-semibold text-white hover:bg-[var(--navy-800)]">Открыть каталог <ArrowRight size={18} /></Link></div></Section>
    </>
  );
}
