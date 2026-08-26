import { ArrowRight, Clock3, Headphones, MapPin, ShieldCheck, Truck } from "lucide-react";
import Image from "next/image";
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
  { icon: ShieldCheck, title: "Гарантия качества", text: "Только проверенные поставщики" },
  { icon: Truck, title: "Доставка и самовывоз", text: "Быстрая доставка по Алматы и области" },
  { icon: Headphones, title: "Поддержка", text: "Поможем с выбором материалов" },
] as const;

export default async function HomePage() {
  const [featuredCategories, popularProducts] = await Promise.all([
    getFeaturedCategories(),
    getPopularProducts(),
  ]);

  return (
    <>
      <section className="relative isolate min-h-[690px] overflow-hidden bg-[var(--navy-950)] text-white sm:min-h-[650px] lg:min-h-[540px]">
        <Image src="/images/home/home.png" alt="Современный дом, построенный с использованием качественных материалов" fill priority quality={92} sizes="100vw" className="-z-20 object-cover object-[68%_center] sm:object-[64%_center] lg:object-center" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(7,24,42,0.98)_0%,rgba(7,24,42,0.90)_42%,rgba(7,24,42,0.28)_72%,rgba(7,24,42,0.08)_100%)] max-lg:bg-[linear-gradient(90deg,rgba(7,24,42,0.97)_0%,rgba(7,24,42,0.82)_58%,rgba(7,24,42,0.35)_100%)]" />
        <Container className="flex min-h-[690px] flex-col justify-center py-10 sm:min-h-[650px] lg:min-h-[540px] lg:py-8">
          <div className="max-w-[38rem]">
            <Badge className="mb-4 border border-primary/35 bg-[var(--navy-950)]/60 text-primary">Remaro · Алматы</Badge>
            <h1 className="max-w-[600px] text-[2.1rem] font-bold leading-[1.08] tracking-[-0.035em] min-[430px]:text-[2.5rem] lg:max-w-[580px] lg:text-[3rem] xl:max-w-[680px]">Строительные материалы<br />для вашего проекта</h1>
            <p className="mt-4 max-w-[500px] text-base leading-7 text-white/75 lg:text-lg">Качественные материалы по выгодным ценам с доставкой и самовывозом в Алматы.</p>
            <div className="mt-6 flex flex-col gap-3 min-[430px]:flex-row">
              <Link href="/catalog" className={buttonClassName({ size: "lg", className: "w-full px-4 min-[430px]:w-auto" })}>Перейти в каталог <ArrowRight size={19} aria-hidden="true" /></Link>
              <Link href="/catalog" className="inline-flex h-13 w-full items-center justify-center rounded-md border border-white/50 bg-[var(--navy-950)]/25 px-5 font-semibold text-white backdrop-blur-sm transition hover:border-primary hover:text-primary min-[430px]:w-auto">Смотреть акции</Link>
            </div>
          </div>
          <div className="mt-8 grid max-w-[54rem] gap-4 border-t border-white/20 pt-5 sm:grid-cols-3 lg:mt-7">
            {benefits.map(({ icon: Icon, title, text }) => (
              <article key={title} className="flex min-w-0 gap-3">
                <Icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                <div><h2 className="text-sm font-bold text-white">{title}</h2><p className="mt-1 text-xs leading-5 text-white/60">{text}</p></div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <Section aria-labelledby="featured-categories-title">
        <SectionHeader
          title="Популярные категории"
          description="Начните с нужного раздела каталога"
          href="/catalog"
          linkLabel="Смотреть все категории"
          className="[&_h2]:scroll-mt-24"
        />
        <span id="featured-categories-title" className="sr-only">Популярные категории</span>
        <CategoryGrid categories={featuredCategories.slice(0, 6)} dense />
      </Section>

      <Section aria-labelledby="popular-products-title" className="bg-surface">
        <SectionHeader
          title="Популярные товары"
          description="То, что часто выбирают для ремонта и строительства"
          href="/catalog"
          linkLabel="Смотреть все товары"
        />
        <span id="popular-products-title" className="sr-only">Популярные товары</span>
        <ProductGrid products={popularProducts.slice(0, 10)} dense />
      </Section>

      <Section className="pt-0">
        <div className="grid overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface shadow-[var(--shadow-sm)] lg:grid-cols-2">
          <div className="p-6 sm:p-9"><span className="grid size-11 place-items-center rounded-md bg-secondary text-[var(--navy-900)]"><Truck /></span><h2 className="type-h2 mt-5">Доставка по Алматы</h2><p className="mt-3 text-muted">Доставим заказ по указанному адресу. Стоимость — 2 000 ₸, ориентировочный срок — 1–2 дня.</p></div>
          <div className="border-t border-border bg-[var(--navy-900)] p-6 text-white sm:p-9 lg:border-l lg:border-t-0"><div className="flex gap-3 text-primary"><MapPin /><Clock3 /></div><h2 className="type-h2 mt-5">Самовывоз</h2><p className="mt-3 text-white/65">Получение в Алматы после подтверждения заказа. Самовывоз бесплатный.</p></div>
        </div>
      </Section>

      <Section className="pt-0"><div className="flex flex-col items-start justify-between gap-6 rounded-[var(--radius-xl)] bg-[var(--navy-900)] px-6 py-8 text-white sm:px-9 lg:flex-row lg:items-center"><div><h2 className="type-h2">Материалы для следующего этапа проекта</h2><p className="mt-2 max-w-2xl text-sm text-white/65 sm:text-base">Соберите заказ в каталоге — оформление займёт несколько минут.</p></div><Link href="/catalog" className={buttonClassName({ size: "lg", className: "shrink-0" })}>Открыть каталог <ArrowRight size={18} /></Link></div></Section>
    </>
  );
}
