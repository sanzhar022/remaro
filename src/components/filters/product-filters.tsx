"use client";

import { Filter, RotateCcw, Search } from "lucide-react";
import type { FormEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/format";

const filterKeys = ["search", "brand", "minPrice", "maxPrice", "inStock", "rating", "sort"] as const;

export interface ProductFiltersProps {
  brands: readonly string[];
  priceRange: { min: number; max: number };
  showSearch?: boolean;
}

function useFilterUrl() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const commit = (params: URLSearchParams) => {
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return { searchParams, commit };
}

function FilterFields({ brands, priceRange, showSearch, prefix }: ProductFiltersProps & { prefix: string }) {
  const { searchParams, commit } = useFilterUrl();
  const selectedBrands = searchParams.getAll("brand");

  const updateSingle = (key: string, value?: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value); else next.delete(key);
    commit(next);
  };

  const toggleBrand = (brand: string, checked: boolean) => {
    const next = new URLSearchParams(searchParams.toString());
    const values = next.getAll("brand").filter((value) => value !== brand);
    next.delete("brand");
    if (checked) values.push(brand);
    values.forEach((value) => next.append("brand", value));
    commit(next);
  };

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = String(new FormData(event.currentTarget).get("search") ?? "").trim();
    updateSingle("search", value || undefined);
  };

  const submitPrice = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next = new URLSearchParams(searchParams.toString());
    const min = String(data.get("minPrice") ?? "").trim();
    const max = String(data.get("maxPrice") ?? "").trim();
    if (min) next.set("minPrice", min); else next.delete("minPrice");
    if (max) next.set("maxPrice", max); else next.delete("maxPrice");
    commit(next);
  };

  return (
    <div className="space-y-7">
      {showSearch && (
        <form onSubmit={submitSearch}>
          <label htmlFor={`${prefix}-product-search`} className="mb-2 block font-bold">Поиск в категории</label>
          <div className="flex">
            <Input id={`${prefix}-product-search`} name="search" type="search" defaultValue={searchParams.get("search") ?? ""} placeholder="Название, бренд или артикул" className="min-w-0 rounded-r-none" />
            <Button type="submit" className="rounded-l-none px-3" aria-label="Найти товары"><Search size={18} aria-hidden="true" /></Button>
          </div>
        </form>
      )}

      <form onSubmit={submitPrice}>
        <fieldset>
          <legend className="font-bold">Цена</legend>
          <p className="type-small mt-1 text-muted">от {formatPrice(priceRange.min)} до {formatPrice(priceRange.max)}</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div><label htmlFor={`${prefix}-min-price`} className="type-small mb-1 block text-muted">От</label><Input id={`${prefix}-min-price`} name="minPrice" type="number" min="0" defaultValue={searchParams.get("minPrice") ?? ""} placeholder={String(priceRange.min)} /></div>
            <div><label htmlFor={`${prefix}-max-price`} className="type-small mb-1 block text-muted">До</label><Input id={`${prefix}-max-price`} name="maxPrice" type="number" min="0" defaultValue={searchParams.get("maxPrice") ?? ""} placeholder={String(priceRange.max)} /></div>
          </div>
          <Button type="submit" variant="outline" size="sm" className="mt-3 w-full">Применить цену</Button>
        </fieldset>
      </form>

      <fieldset>
        <legend className="font-bold">Бренд</legend>
        <div className="mt-3 max-h-52 space-y-2 overflow-y-auto pr-1">
          {brands.map((brand) => (
            <label key={brand} className="flex cursor-pointer items-start gap-2.5 text-sm">
              <input type="checkbox" checked={selectedBrands.includes(brand)} onChange={(event) => toggleBrand(brand, event.target.checked)} className="mt-0.5 size-4 accent-primary" />
              <span className="min-w-0 break-words">{brand}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="font-bold">Наличие</legend>
        <label className="mt-3 flex cursor-pointer items-center gap-2.5 text-sm">
          <input type="checkbox" checked={searchParams.get("inStock") === "true"} onChange={(event) => updateSingle("inStock", event.target.checked ? "true" : undefined)} className="size-4 accent-primary" />
          Только в наличии
        </label>
      </fieldset>

      <fieldset>
        <legend className="font-bold">Рейтинг</legend>
        <div className="mt-3 space-y-2">
          {[{ label: "Все", value: "" }, { label: "4 и выше", value: "4" }, { label: "3 и выше", value: "3" }].map(({ label, value }) => (
            <label key={label} className="flex cursor-pointer items-center gap-2.5 text-sm">
              <input type="radio" name={`${prefix}-rating`} checked={(searchParams.get("rating") ?? "") === value} onChange={() => updateSingle("rating", value || undefined)} className="size-4 accent-primary" />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <ClearFiltersButton className="w-full" />
    </div>
  );
}

export function ClearFiltersButton({ className = "" }: { className?: string }) {
  const { searchParams, commit } = useFilterUrl();
  const clear = () => {
    const next = new URLSearchParams(searchParams.toString());
    filterKeys.forEach((key) => next.delete(key));
    commit(next);
  };

  return <Button type="button" variant="ghost" size="sm" className={className} onClick={clear}><RotateCcw size={16} aria-hidden="true" />Сбросить фильтры</Button>;
}

export function ProductFilters(props: ProductFiltersProps) {
  return (
    <>
      <aside className="hidden rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-sm)] lg:block lg:sticky lg:top-5">
        <h2 className="type-h3 mb-6">Фильтры</h2>
        <FilterFields {...props} prefix="desktop" />
      </aside>
      <details className="rounded-[var(--radius-md)] border border-border bg-surface lg:hidden">
        <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 px-4 font-bold text-primary"><Filter size={18} aria-hidden="true" />Фильтры</summary>
        <div className="border-t border-border p-4"><FilterFields {...props} prefix="mobile" /></div>
      </details>
    </>
  );
}
