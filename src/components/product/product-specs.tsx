import type { ProductSpecification } from "@/types/product";

export interface ProductSpecsProps {
  brand: string;
  specifications: readonly ProductSpecification[];
}

export function ProductSpecs({ brand, specifications }: ProductSpecsProps) {
  const rows: ProductSpecification[] = [
    { name: "Бренд", value: brand },
    ...specifications.filter((item) => item.name.trim().toLocaleLowerCase("ru") !== "бренд" && item.name.trim() && item.value.trim()),
  ];

  return (
    <section aria-labelledby="product-specs-title" className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-sm)] sm:p-8">
      <h2 id="product-specs-title" className="type-h2">Характеристики</h2>
      <dl className="mt-6 divide-y divide-border">
        {rows.map((specification) => (
          <div key={`${specification.name}-${specification.value}`} className="grid min-w-0 gap-1 py-3 sm:grid-cols-2 sm:gap-6">
            <dt className="break-words text-muted">{specification.name}</dt>
            <dd className="break-words font-semibold text-foreground sm:text-right">{specification.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
