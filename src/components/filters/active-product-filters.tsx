"use client";

import { X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { formatPrice } from "@/lib/format";

const removableKeys = ["search", "brand", "minPrice", "maxPrice", "inStock", "rating"] as const;

export function ActiveProductFilters() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const brands = searchParams.getAll("brand");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const search = searchParams.get("search");
  const chips = [
    ...(search ? [{ key: "search", value: search, label: `Поиск: ${search}` }] : []),
    ...brands.map((brand) => ({ key: "brand", value: brand, label: brand })),
    ...(minPrice || maxPrice ? [{ key: "price", value: "", label: `${minPrice ? formatPrice(Number(minPrice)) : "от минимума"} – ${maxPrice ? formatPrice(Number(maxPrice)) : "до максимума"}` }] : []),
    ...(searchParams.get("inStock") === "true" ? [{ key: "inStock", value: "true", label: "В наличии" }] : []),
  ];

  if (chips.length === 0) return null;

  const navigate = (next: URLSearchParams) => {
    const query = next.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const remove = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (key === "brand") {
      const remaining = next.getAll("brand").filter((brand) => brand !== value);
      next.delete("brand");
      remaining.forEach((brand) => next.append("brand", brand));
    } else if (key === "price") {
      next.delete("minPrice");
      next.delete("maxPrice");
    } else {
      next.delete(key);
    }
    navigate(next);
  };

  const clear = () => {
    const next = new URLSearchParams(searchParams.toString());
    removableKeys.forEach((key) => next.delete(key));
    navigate(next);
  };

  return (
    <div aria-label="Активные фильтры" className="mb-5 flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button key={`${chip.key}-${chip.value}`} type="button" onClick={() => remove(chip.key, chip.value)} className="inline-flex min-h-11 max-w-full items-center gap-1.5 rounded-full border border-primary/35 bg-[#fffaf0] px-3 text-xs font-semibold text-[var(--navy-900)] hover:border-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/20">
          <span className="truncate">{chip.label}</span><X size={14} aria-hidden="true" />
        </button>
      ))}
      <button type="button" onClick={clear} className="min-h-11 px-2 text-xs font-semibold text-muted underline decoration-border underline-offset-4 hover:text-foreground">Сбросить всё</button>
    </div>
  );
}
