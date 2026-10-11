import type { Metadata } from "next";
import Link from "next/link";
import { CreditCard, PackageCheck, Store, Truck } from "lucide-react";
import { InfoHero } from "@/components/content/info-hero";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { buttonClassName } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { companyInfo } from "@/lib/company-info";
import { paymentsEnabled } from "@/lib/payment-service";

export const metadata: Metadata = {
  title: "Доставка и оплата",
  description: "Способы доставки, самовывоза и оплаты заказов Remaro в Алматы.",
  alternates: { canonical: "/delivery" },
};

const deliveryOptions = [
  { icon: Truck, title: `Доставка по городу ${companyInfo.delivery.area}`, text: `${companyInfo.delivery.priceText} ${companyInfo.delivery.etaText}` },
  { icon: Store, title: "Самовывоз", text: companyInfo.pickup.detailsText },
  { icon: PackageCheck, title: "Получение заказа", text: "Перед передачей товаров заказ подтверждается, а детали получения согласовываются с покупателем." },
];

export default function DeliveryPage() {
  const onlinePaymentEnabled = paymentsEnabled();
  return (
    <>
      <InfoHero eyebrow="Получение заказа" title="Доставка и оплата" description="Заранее рассказываем, как формируется получение заказа. Финальные условия подтверждаются до передачи товаров." />
      <Container className="py-12 sm:py-16">
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Доставка и оплата" }]} />
        <section aria-labelledby="delivery-options-title"><h2 id="delivery-options-title" className="type-h2">Способы получения</h2><div className="mt-6 grid gap-4 lg:grid-cols-3">{deliveryOptions.map(({ icon: Icon, title, text }) => <article key={title} className="rounded-[var(--radius-lg)] border border-border bg-surface p-6 shadow-[var(--shadow-sm)]"><Icon className="text-primary" size={29} aria-hidden="true" /><h3 className="type-h3 mt-5">{title}</h3><p className="mt-3 text-sm leading-6 text-muted">{text}</p></article>)}</div></section>

        <section className="mt-14" aria-labelledby="payment-options-title">
          <h2 id="payment-options-title" className="type-h2">Оплата</h2>
          <article className="mt-6 rounded-[var(--radius-lg)] bg-secondary p-6 sm:p-8">
            <CreditCard className="text-[var(--navy-900)]" size={27} aria-hidden="true" />
            <h3 className="mt-4 font-bold">Способ оплаты</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{onlinePaymentEnabled ? "Доступные способы оплаты отображаются при оформлении заказа." : companyInfo.payment.detailsText}</p>
          </article>
        </section>

        <section className="mt-14 rounded-[var(--radius-lg)] border border-border bg-surface p-6 sm:p-8" aria-labelledby="important-title">
          <h2 id="important-title" className="type-h2">Важная информация</h2>
          <p className="mt-3 max-w-3xl leading-7 text-muted">Стоимость, срок и точные условия получения фиксируются при подтверждении заказа. Не отправляйтесь за заказом на самовывоз до подтверждения его готовности.</p>
        </section>

        <section className="mt-14 rounded-[var(--radius-lg)] bg-[var(--navy-900)] p-7 text-white sm:p-10" aria-labelledby="order-steps-title">
          <h2 id="order-steps-title" className="type-h2">Как получить заказ</h2>
          <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {["Выберите товары", "Оформите заказ", "Менеджер подтвердит заказ", "Получите заказ"].map((step, index) => <li key={step} className="flex gap-4"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary font-extrabold text-[var(--navy-950)]">{index + 1}</span><span className="pt-2 text-sm font-semibold leading-5">{step}</span></li>)}
          </ol>
          <div className="mt-9 flex flex-wrap gap-3"><Link href="/catalog" className={buttonClassName()}>Перейти в каталог</Link><Link href="/contacts" className={buttonClassName({ variant: "outline", className: "border-white/25 bg-transparent text-white hover:bg-white/10" })}><PackageCheck size={18} />Контакты</Link></div>
        </section>
      </Container>
    </>
  );
}
