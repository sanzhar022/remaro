import { Instagram, MessageCircle } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { BrandLogo } from "@/components/layout/brand-logo";
import { getMapUrl, getSiteSettings, getWhatsAppUrl } from "@/lib/site-settings";

export async function Footer() {
  const settings = await getSiteSettings(); const whatsappUrl = getWhatsAppUrl(settings.whatsapp); const mapUrl = getMapUrl(settings);
  return <footer className="mt-auto border-t border-white/10 bg-[var(--navy-950)] py-12 text-white"><Container className="grid gap-9 sm:grid-cols-2 lg:grid-cols-4"><div><BrandLogo /><p className="mt-3 font-semibold">{settings.companyName}</p>{settings.shortDescription && <p className="mt-3 max-w-sm text-sm leading-6 text-white/65">{settings.shortDescription}</p>}</div>
    <nav aria-label="Покупателям"><p className="mb-3 font-semibold text-primary">Покупателям</p><div className="flex flex-col gap-2 text-sm text-white/70"><Link href="/catalog">Каталог</Link><Link href="/delivery">Доставка и оплата</Link><Link href="/contacts">Контакты</Link><Link href="/cart">Корзина</Link></div></nav>
    <nav aria-label="Компания"><p className="mb-3 font-semibold text-primary">Компания</p><div className="flex flex-col gap-2 text-sm text-white/70"><Link href="/about">О компании</Link><Link href="/contacts">Контакты</Link>{settings.instagramUrl && <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2"><Instagram size={16} />Instagram</a>}{settings.tiktokUrl && <a href={settings.tiktokUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2"><MessageCircle size={16} />TikTok</a>}</div></nav>
    <div><p className="mb-3 font-semibold text-primary">Связаться</p><div className="space-y-2 text-sm leading-6 text-white/65">{(settings.city || settings.address) && (mapUrl ? <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="block hover:text-white">{[settings.city, settings.address].filter(Boolean).join(", ")}</a> : <p>{[settings.city, settings.address].filter(Boolean).join(", ")}</p>)}{settings.phone && <a href={`tel:${settings.phone.replace(/[^+\d]/g, "")}`} className="block hover:text-white">{settings.phone}</a>}{settings.email && <a href={`mailto:${settings.email}`} className="block hover:text-white">{settings.email}</a>}{whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block hover:text-white">WhatsApp</a>}{settings.workingHours && <p>{settings.workingHours}</p>}</div></div>
  </Container><Container className="mt-10 border-t border-white/10 pt-6 text-xs text-white/45">© {new Date().getFullYear()} {settings.companyName}. Все права защищены.</Container></footer>;
}
