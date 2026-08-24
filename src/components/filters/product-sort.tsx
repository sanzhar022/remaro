"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ProductSort } from "@/types/product-filters";

const options: { value: ProductSort; label: string }[] = [
  { value: "popular", label: "По популярности" },
  { value: "price-asc", label: "Сначала дешевле" },
  { value: "price-desc", label: "Сначала дороже" },
  { value: "rating", label: "По рейтингу" },
  { value: "newest", label: "Новинки" },
];

export function ProductSortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("sort") ?? "popular";

  const changeSort = (sort: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (sort === "popular") next.delete("sort"); else next.set("sort", sort);
    const query = next.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <label className="flex items-center gap-2 text-sm text-muted">
      <span className="hidden sm:inline">Сортировка:</span>
      <select value={current} onChange={(event) => changeSort(event.target.value)} className="h-11 rounded-[var(--radius-md)] border border-border bg-surface px-3 font-semibold text-foreground focus:outline-none focus:ring-3 focus:ring-primary/20">
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}
