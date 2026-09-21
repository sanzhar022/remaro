import type { Metadata } from "next";
import { ArrowRight, Blocks, Headphones, LayoutGrid, Search, ShoppingBasket } from "lucide-react";
import Link from "next/link";
import { CategoryGrid } from "@/components/catalog/category-grid";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { buttonClassName } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { getRootCategories } from "@/lib/categories";
import { getSiteSettings } from "@/lib/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return { title: { absolute: "О компании | REMARO" }, description: settings.shortDescription || "О компании REMARO." };
}

const advantages = [
  { icon: Blocks, title: "Широкий ассортимент", text: "Материалы и товары для разных этапов строительства и ремонта." },
  { icon: Search, title: "Удобный каталог", text: "Поиск товаров по категориям и характеристикам." },
  { icon: ShoppingBasket, title: "Всё в одном месте", text: "Строительные материалы, инструменты, сантехника, электрика и отделка." },
  { icon: Headphones, title: "Помощь с выбором", text: "Свяжитесь с REMARO для уточнения информации о товарах." },
] as const;

export default async function AboutPage() {
  const [settings, rootCategories] = await Promise.all([getSiteSettings(), getRootCategories()]);
  const title = settings.aboutTitle || "REMARO — всё для строительства и ремонта";
  const description = settings.aboutShortText || settings.shortDescription || "Материалы и товары для строительства, ремонта и обустройства.";
  const directions = rootCategories.slice(0, 6);

  return <>
    <section className="relative overflow-hidden bg-[var(--navy-950)] py-14 text-white sm:py-20 lg:py-24">
      <div className="absolute -right-32 -top-40 size-96 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
      <Container className="relative"><p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">О компании</p><h1 className="mt-4 max-w-4xl text-3xl font-extrabold leading-[1.08] tracking-[-0.035em] sm:text-4xl lg:text-6xl">{title}</h1><p className="mt-5 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">{description}</p><div className="mt-8 flex flex-col gap-3 min-[430px]:flex-row"><Link href="/catalog" className={buttonClassName({ size: "lg", className: "w-full min-[430px]:w-auto" })}>Перейти в каталог <ArrowRight size={19} aria-hidden="true" /></Link><Link href="/contacts" className={buttonClassName({ variant: "outline", size: "lg", className: "w-full border-white/30 bg-transparent text-white hover:bg-white/10 min-[430px]:w-auto" })}>Связаться с нами</Link></div></Container>
    </section>

    <Section><Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "О компании" }]} />{(settings.aboutShortText || settings.aboutText) && <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14"><div><p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">{settings.companyName}</p><h2 className="type-h2 mt-3">О компании</h2>{settings.aboutShortText && <p className="mt-5 text-lg font-medium leading-8 text-[var(--navy-900)]">{settings.aboutShortText}</p>}</div>{settings.aboutText && <div className="whitespace-pre-line rounded-[var(--radius-xl)] border border-border bg-surface p-6 leading-8 text-muted shadow-[var(--shadow-sm)] sm:p-8">{settings.aboutText}</div>}</div>}</Section>

    {directions.length > 0 && <Section className="bg-surface" aria-labelledby="directions-title"><div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">Каталог REMARO</p><h2 id="directions-title" className="type-h2 mt-2">Всё необходимое для строительства и ремонта</h2></div><Link href="/catalog" className="inline-flex items-center gap-2 font-semibold text-[var(--navy-900)] hover:text-primary">Все категории <ArrowRight size={18} /></Link></div><CategoryGrid categories={directions} dense /></Section>}

    <Section aria-labelledby="advantages-title"><div className="text-center"><p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">Покупать удобно</p><h2 id="advantages-title" className="type-h2 mt-2">Возможности REMARO</h2></div><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{advantages.map(({ icon: Icon, title: itemTitle, text }) => <article key={itemTitle} className="rounded-[var(--radius-lg)] border border-border bg-surface p-6 shadow-[var(--shadow-sm)]"><span className="grid size-12 place-items-center rounded-[var(--radius-md)] bg-secondary text-[var(--navy-900)]"><Icon size={24} aria-hidden="true" /></span><h3 className="type-h3 mt-5">{itemTitle}</h3><p className="mt-3 text-sm leading-6 text-muted">{text}</p></article>)}</div></Section>

    <Section className="pt-0"><div className="overflow-hidden rounded-[var(--radius-xl)] bg-[var(--navy-900)] px-6 py-9 text-white sm:px-10 sm:py-12 lg:flex lg:items-center lg:justify-between lg:gap-10"><div><LayoutGrid className="text-primary" size={32} aria-hidden="true" /><h2 className="type-h2 mt-5">Строите или делаете ремонт?</h2><p className="mt-3 max-w-2xl leading-7 text-white/70">Найдите необходимые материалы в каталоге REMARO или свяжитесь с нами для уточнения информации о товарах.</p></div><div className="mt-7 flex flex-col gap-3 min-[430px]:flex-row lg:mt-0 lg:shrink-0"><Link href="/catalog" className={buttonClassName({ size: "lg" })}>Открыть каталог</Link><Link href="/contacts" className={buttonClassName({ variant: "outline", size: "lg", className: "border-white/30 bg-transparent text-white hover:bg-white/10" })}>Связаться</Link></div></div></Section>
  </>;
}
