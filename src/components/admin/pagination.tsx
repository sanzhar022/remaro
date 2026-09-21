import Link from "next/link";
export function AdminPagination({ page, totalPages, params = {} }: { page: number; totalPages: number; params?: Record<string, string | undefined> }) {
  if (totalPages <= 1) return null;
  const href = (next: number) => { const search = new URLSearchParams(); Object.entries(params).forEach(([key,value])=>{if(value)search.set(key,value)}); search.set("page",String(next)); return `?${search}`; };
  return <nav className="mt-6 flex items-center justify-center gap-4" aria-label="Пагинация"><Link aria-disabled={page <= 1} className={page <= 1 ? "pointer-events-none text-muted" : "text-primary underline"} href={href(page - 1)}>Назад</Link><span>Страница {page} из {totalPages}</span><Link aria-disabled={page >= totalPages} className={page >= totalPages ? "pointer-events-none text-muted" : "text-primary underline"} href={href(page + 1)}>Далее</Link></nav>;
}
