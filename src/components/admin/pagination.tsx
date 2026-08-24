import Link from "next/link";
export function AdminPagination({ page, totalPages, query }: { page: number; totalPages: number; query?: string }) {
  if (totalPages <= 1) return null;
  const href = (next: number) => `?page=${next}${query ? `&q=${encodeURIComponent(query)}` : ""}`;
  return <nav className="mt-6 flex items-center justify-center gap-4" aria-label="Пагинация"><Link aria-disabled={page <= 1} className={page <= 1 ? "pointer-events-none text-muted" : "text-primary underline"} href={href(page - 1)}>Назад</Link><span>Страница {page} из {totalPages}</span><Link aria-disabled={page >= totalPages} className={page >= totalPages ? "pointer-events-none text-muted" : "text-primary underline"} href={href(page + 1)}>Далее</Link></nav>;
}
