export interface ProductDescriptionProps {
  description?: string;
  productName: string;
}

export function ProductDescription({ description, productName }: ProductDescriptionProps) {
  return (
    <section aria-labelledby="product-description-title" className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-sm)] sm:p-8">
      <h2 id="product-description-title" className="type-h2">Описание</h2>
      <p className="mt-5 max-w-4xl leading-7 text-muted">
        {description ?? `${productName} — практичный выбор для строительных и ремонтных работ. Подробная информация о товаре будет дополнена.`}
      </p>
    </section>
  );
}
