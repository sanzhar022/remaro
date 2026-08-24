import type { ProductSpecification } from "@/types/product";

export interface ProductSpecsProps {
  brand: string;
  specifications: readonly ProductSpecification[];
}

export function ProductSpecs({ brand, specifications }: ProductSpecsProps) {
  const rows: ProductSpecification[] = [{ name: "Бренд", value: brand }, ...specifications];

  return (
    <section aria-labelledby="product-specs-title" className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-sm)] sm:p-8">
      <h2 id="product-specs-title" className="type-h2">Характеристики</h2>
      <dl className="mt-6 divide-y divide-border">
        {rows.map((specification, index) => (
          <div key={`${specification.name}-${index}`} className="grid gap-1 py-3 sm:grid-cols-2 sm:gap-6">
            <dt className="text-muted">{specification.name}</dt>
            <dd className="font-semibold text-foreground sm:text-right">{specification.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
