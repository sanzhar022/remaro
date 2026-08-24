import { CreditCard, Store, Truck } from "lucide-react";

const deliveryItems = [
  { icon: Truck, title: "Доставка", text: "Доставка по Алматы и области. Срок и стоимость рассчитываются при оформлении." },
  { icon: Store, title: "Самовывоз", text: "Самовывоз из магазина после подтверждения заказа." },
  { icon: CreditCard, title: "Оплата", text: "Оплата картой или при получении. Онлайн-оплата будет подключена позже." },
] as const;

export function ProductDelivery() {
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
    </section>
  );
}
