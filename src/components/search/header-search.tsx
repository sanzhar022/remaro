"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";

export function HeaderSearch() {
  const router = useRouter();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = String(new FormData(event.currentTarget).get("q") ?? "").trim();
    if (query) router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <form role="search" onSubmit={submit} className="flex w-full">
      <label htmlFor="site-search" className="sr-only">Поиск товаров</label>
      <Input id="site-search" name="q" type="search" placeholder="Поиск по каталогу" className="min-w-0 rounded-r-none border-white/10 bg-white text-foreground shadow-none focus:relative focus:z-10" />
      <IconButton type="submit" aria-label="Найти" title="Найти" className="rounded-l-none border-primary bg-primary text-[var(--navy-950)] hover:bg-primary-hover"><Search size={20} aria-hidden="true" /></IconButton>
    </form>
  );
}
