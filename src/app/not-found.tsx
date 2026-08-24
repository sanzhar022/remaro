import Link from "next/link";
import { buttonClassName } from "@/components/ui/button";
import { Section } from "@/components/ui/section";

export default function NotFound() {
  return <Section><div className="mx-auto max-w-2xl rounded-[var(--radius-xl)] border border-border bg-surface p-8 text-center shadow-[var(--shadow-md)]"><p className="text-7xl font-black text-primary">404</p><h1 className="type-h1 mt-5">Страница не найдена</h1><p className="mt-3 text-muted">Возможно, адрес изменился или страница больше не существует.</p><div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/" className={buttonClassName({ size: "lg" })}>На главную</Link><Link href="/catalog" className={buttonClassName({ variant: "outline", size: "lg" })}>В каталог</Link></div></div></Section>;
}
