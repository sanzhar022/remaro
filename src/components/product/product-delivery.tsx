import { CreditCard, Store, Truck } from "lucide-react";
import Link from "next/link";
import { companyInfo } from "@/lib/company-info";
import { paymentsEnabled } from "@/lib/payment-service";

export function ProductDelivery() {
  const onlinePaymentEnabled = paymentsEnabled();
  const deliveryItems = [
    { icon: Truck, title: "Доставка", text: `${companyInfo.delivery.priceText} ${companyInfo.delivery.etaText}` },
    { icon: Store, title: "Самовывоз", text: companyInfo.pickupAddress ? `Пункт самовывоза: ${companyInfo.pickupAddress}. Выдача после подтверждения заказа.` : companyInfo.pickup.detailsText },
    { icon: CreditCard, title: "Оплата", text: onlinePaymentEnabled ? "Доступные способы оплаты отображаются при оформлении заказа." : companyInfo.payment.detailsText },
  ] as const;

  return (
    <section aria-labelledby="product-delivery-title">
      <h2 id="product-delivery-title" className="type-h2">Получение и оплата</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {deliveryItems.map(({ icon: Icon, title, text }) => (
          <article key={title} className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-sm)] sm:p-6">
            <span className="grid size-11 place-items-center rounded-[var(--radius-md)] bg-secondary text-primary"><Icon size={21} aria-hidden="true" /></span>
            <h3 className="type-h3 mt-4">{title}</h3>
            <p className="type-small mt-2 text-muted">{text}</p>
          </article>
        ))}
      </div>
      <Link href="/delivery" className="mt-5 inline-flex min-h-11 items-center font-semibold text-[var(--navy-900)] underline decoration-primary underline-offset-4 hover:text-primary">Подробнее о доставке и оплате</Link>
    </section>
  );
}
