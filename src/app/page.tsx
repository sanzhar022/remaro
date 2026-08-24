import { ArrowRight, CreditCard, Headphones, ShieldCheck, Truck } from "lucide-react";
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
      <section className="pt-5 sm:pt-8 lg:pt-10">
        <Container>
          <div className="relative isolate overflow-hidden rounded-[var(--radius-xl)] bg-secondary px-5 py-12 shadow-[var(--shadow-sm)] sm:px-10 sm:py-16 lg:min-h-[520px] lg:px-16 lg:py-20">
            <div className="relative z-10 max-w-3xl">
              <Badge className="mb-5 bg-surface/80">Всё для строительства и ремонта</Badge>
              <h1 className="type-h1 max-w-3xl">Стройматериалы для ваших проектов</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg">Тысячи товаров для строительства, ремонта и обустройства дома с доставкой по Алматы.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="#" className={buttonClassName({ size: "lg" })}>Перейти в каталог <ArrowRight size={19} aria-hidden="true" /></Link>
                <Link href="#" className={buttonClassName({ variant: "outline", size: "lg", className: "bg-surface/70" })}>Популярные товары</Link>
              </div>
            </div>
            <div className="absolute -bottom-28 -right-24 -z-10 h-72 w-72 rounded-full bg-primary/12 sm:h-[440px] sm:w-[440px]" aria-hidden="true" />
            <div className="absolute -right-8 top-10 -z-10 hidden h-64 w-64 rotate-12 rounded-[3rem] border-[48px] border-surface/55 lg:block" aria-hidden="true" />
            <div className="absolute bottom-16 right-64 -z-10 hidden size-24 rounded-full bg-success/10 xl:block" aria-hidden="true" />
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
              <span className="mb-5 grid size-12 place-items-center rounded-[var(--radius-md)] bg-secondary text-primary"><Icon size={23} aria-hidden="true" /></span>
              <h3 className="type-h3">{title}</h3>
              <p className="type-small mt-2 text-muted">{text}</p>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
