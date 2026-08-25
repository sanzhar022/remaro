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
  { icon: ShieldCheck, title: "Гарантия качества", text: "Только проверенные поставщики" },
  { icon: Truck, title: "Доставка и самовывоз", text: "Быстрая доставка по Алматы и области" },
  { icon: Headphones, title: "Поддержка", text: "Поможем с выбором материалов" },
  { icon: CreditCard, title: "Выгодные условия", text: "Для частных клиентов и компаний" },
] as const;

export default async function HomePage() {
  const [featuredCategories, popularProducts] = await Promise.all([
    getFeaturedCategories(),
    getPopularProducts(),
  ]);

  return (
    <>
      <section className="bg-[var(--navy-950)] py-6 text-white sm:py-8 lg:py-10">
        <Container>
          <div className="relative isolate flex min-h-[440px] overflow-hidden rounded-[var(--radius-xl)] border border-white/10 bg-gradient-to-br from-[var(--navy-900)] via-[var(--navy-950)] to-[var(--navy-800)] px-5 py-10 sm:min-h-[500px] sm:px-10 sm:py-14 lg:min-h-[540px] lg:items-center lg:px-14 lg:py-16">
            <div className="relative z-10 max-w-[46rem]">
              <Badge className="mb-5 border border-primary/30 bg-primary/10 text-primary">Remaro · Алматы</Badge>
              <h1 className="type-h1 max-w-3xl text-[1.65rem] min-[375px]:text-[2rem] sm:text-[clamp(2rem,4vw,3.5rem)]">Строительные материалы<br className="hidden sm:block" /> для вашего проекта</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">Качественные материалы для строительства и ремонта с доставкой и самовывозом в Алматы.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/catalog" className={buttonClassName({ size: "lg", className: "w-full px-3 text-sm sm:w-auto sm:px-6 sm:text-base" })}>Перейти в каталог <ArrowRight size={19} aria-hidden="true" /></Link>
                <Link href="/search" className="inline-flex h-13 w-full items-center justify-center rounded-md border border-white/25 px-3 text-sm font-semibold text-white transition hover:border-primary hover:text-primary sm:w-auto sm:px-6 sm:text-base">Смотреть товары</Link>
              </div>
            </div>
            <div className="absolute inset-y-0 right-0 -z-10 hidden w-[44%] opacity-70 lg:block" aria-hidden="true">
              <div className="absolute bottom-16 right-14 h-56 w-72 skew-x-[-12deg] border border-primary/35" />
              <div className="absolute bottom-28 right-28 h-56 w-72 skew-x-[-12deg] border border-white/15" />
              <div className="absolute bottom-40 right-44 h-48 w-60 skew-x-[-12deg] border border-primary/20" />
              <div className="absolute bottom-16 right-14 h-px w-96 origin-right -rotate-[38deg] bg-gradient-to-l from-primary/60 to-transparent" />
              <div className="absolute right-20 top-20 h-px w-72 rotate-[28deg] bg-gradient-to-l from-white/25 to-transparent" />
            </div>
          </div>
        </Container>
      </section>

      <Section aria-labelledby="benefits-title" className="py-7 sm:py-9">
        <h2 id="benefits-title" className="sr-only">Преимущества Remaro</h2>
        <div className="grid grid-cols-1 gap-x-4 gap-y-6 min-[375px]:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-border">
          {benefits.map(({ icon: Icon, title, text }) => (
            <article key={title} className="flex min-w-0 gap-3 min-[375px]:flex-col md:flex-row lg:px-5 first:lg:pl-0 last:lg:pr-0">
              <span className="grid size-10 shrink-0 place-items-center rounded-md bg-[var(--navy-950)] text-primary"><Icon size={20} aria-hidden="true" /></span>
              <div><h3 className="text-sm font-bold sm:text-base">{title}</h3><p className="mt-1 text-xs leading-5 text-muted sm:text-sm">{text}</p></div>
            </article>
          ))}
        </div>
      </Section>

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
          href="/catalog"
        />
        <span id="popular-products-title" className="sr-only">Популярные товары</span>
        <ProductGrid products={popularProducts.slice(0, 8)} />
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
