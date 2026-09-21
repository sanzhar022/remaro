import type { Metadata } from "next";
import { Clock3, Instagram, Mail, MapPin, MessageCircle, Music2, Navigation, Phone, Store } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { buttonClassName } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { getMapUrl, getSiteSettings, getWhatsAppUrl } from "@/lib/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return { title: { absolute: "Контакты | REMARO" }, description: `Контактная информация ${settings.companyName}: телефон, WhatsApp, адрес и режим работы.` };
}

export default async function ContactsPage() {
  const settings = await getSiteSettings();
  const whatsappUrl = getWhatsAppUrl(settings.whatsapp);
  const mapUrl = getMapUrl(settings);
  const phoneUrl = settings.phone ? `tel:${settings.phone.replace(/[^+\d]/g, "")}` : null;
  const fullAddress = [settings.address, settings.city].filter(Boolean).join(", ");
  const contacts = [
    { label: "Телефон", value: settings.phone, href: phoneUrl, icon: Phone, external: false },
    { label: "WhatsApp", value: settings.whatsapp, href: whatsappUrl, icon: MessageCircle, external: true },
    { label: "Email", value: settings.email, href: settings.email ? `mailto:${settings.email}` : null, icon: Mail, external: false },
    { label: "Адрес", value: fullAddress || null, href: mapUrl, icon: MapPin, external: true },
    { label: "Режим работы", value: settings.workingHours, href: null, icon: Clock3, external: false },
  ].filter(({ value }) => Boolean(value));
  const socials = [
    { label: "Instagram", href: settings.instagramUrl, icon: Instagram },
    { label: "TikTok", href: settings.tiktokUrl, icon: Music2 },
    { label: "WhatsApp", href: whatsappUrl, icon: MessageCircle },
  ].filter(({ href }) => Boolean(href));
  const heroDescription = [settings.companyName, settings.shortDescription].filter(Boolean).join(" — ");

  return <>
    <section className="relative overflow-hidden bg-[var(--navy-950)] py-14 text-white sm:py-20 lg:py-24"><div className="absolute -left-24 bottom-0 size-72 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" /><Container className="relative"><p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">{settings.companyName}</p><h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-6xl">Контакты</h1>{heroDescription && <p className="mt-5 max-w-3xl text-base leading-7 text-white/72 sm:text-lg">{heroDescription}</p>}<div className="mt-8 flex flex-col gap-3 min-[430px]:flex-row">{whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={buttonClassName({ size: "lg", className: "w-full min-[430px]:w-auto" })}><MessageCircle size={20} aria-hidden="true" />Написать в WhatsApp</a>}{phoneUrl && <a href={phoneUrl} className={buttonClassName({ variant: "outline", size: "lg", className: "w-full border-white/30 bg-transparent text-white hover:bg-white/10 min-[430px]:w-auto" })}><Phone size={20} aria-hidden="true" />Позвонить</a>}</div></Container></section>

    <Section aria-labelledby="contact-options-title"><Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Контакты" }]} /><div className="mb-7"><p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">На связи</p><h2 id="contact-options-title" className="type-h2 mt-2">Как с нами связаться</h2></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{contacts.map(({ label, value, href, icon: Icon, external }) => <article key={label} className="min-w-0 rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-sm)] sm:p-6"><span className="grid size-12 place-items-center rounded-[var(--radius-md)] bg-secondary text-[var(--navy-900)]"><Icon size={23} aria-hidden="true" /></span><h3 className="type-h3 mt-5">{label}</h3>{href ? <a className="mt-2 block break-words text-sm leading-6 text-muted transition hover:text-primary hover:underline" href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}>{value}</a> : <p className="mt-2 break-words text-sm leading-6 text-muted">{value}</p>}</article>)}{!contacts.length && <p className="rounded-lg border border-border bg-surface p-6 text-sm text-muted sm:col-span-2 lg:col-span-3">Контактные данные пока не опубликованы.</p>}</div></Section>

    {socials.length > 0 && <Section className="bg-surface" aria-labelledby="social-title"><div className="rounded-[var(--radius-xl)] border border-border bg-secondary/50 p-6 sm:p-9"><h2 id="social-title" className="type-h2">Мы в социальных сетях</h2><p className="mt-2 text-muted">Выберите удобный способ связи с {settings.companyName}.</p><div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">{socials.map(({ label, href, icon: Icon }) => <a key={label} href={href!} target="_blank" rel="noopener noreferrer" aria-label={`${label} — открыть в новой вкладке`} className={buttonClassName({ variant: "outline", size: "lg", className: "w-full gap-2 bg-surface sm:w-auto" })}><Icon size={20} aria-hidden="true" />{label}</a>)}</div></div></Section>}

    {(mapUrl || fullAddress) && <Section aria-labelledby="location-title"><div className="grid overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface shadow-[var(--shadow-sm)] lg:grid-cols-[0.8fr_1.2fr]"><div className="bg-[var(--navy-900)] p-7 text-white sm:p-10"><Store className="text-primary" size={34} aria-hidden="true" /><p className="mt-6 text-sm font-bold uppercase tracking-[0.16em] text-primary">Магазин</p><h2 id="location-title" className="type-h2 mt-2">{settings.companyName}</h2>{settings.address && <p className="mt-5 leading-7 text-white/80">{settings.address}</p>}{settings.city && <p className="mt-1 text-white/60">{settings.city}</p>}{mapUrl && <a href={mapUrl} target="_blank" rel="noopener noreferrer" className={`${buttonClassName({ size: "lg" })} mt-7 w-full sm:w-auto`}><Navigation size={19} aria-hidden="true" />Открыть на карте</a>}</div><div className="relative grid min-h-72 place-items-center overflow-hidden bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.18),transparent_55%),linear-gradient(135deg,#f3f4f6,#e5e7eb)] p-8 text-center"><div className="absolute inset-0 opacity-35 [background-image:linear-gradient(#cbd5e1_1px,transparent_1px),linear-gradient(90deg,#cbd5e1_1px,transparent_1px)] [background-size:32px_32px]" aria-hidden="true" /><div className="relative"><span className="mx-auto grid size-20 place-items-center rounded-full bg-primary text-[var(--navy-950)] shadow-xl"><MapPin size={38} aria-hidden="true" /></span><p className="mt-5 max-w-md font-semibold text-[var(--navy-900)]">{fullAddress || "Местоположение магазина"}</p><p className="mt-2 text-sm text-muted">Точка на карте формируется из актуальных настроек сайта.</p></div></div></div></Section>}
  </>;
}
