import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: readonly BreadcrumbItem[] }) {
  return (
    <nav aria-label="Хлебные крошки" className="type-small mb-6">
      <ol className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-muted">
        {items.map((item, index) => {
          const current = index === items.length - 1;
          return (
            <li key={`${item.href ?? "current"}-${item.label}`} className="flex min-w-0 items-center gap-2">
              {index > 0 && <span aria-hidden="true">/</span>}
              {item.href && !current ? (
                <Link href={item.href} className="rounded-sm hover:text-primary focus-visible:text-primary">{item.label}</Link>
              ) : (
                <span aria-current={current ? "page" : undefined} className={current ? "max-w-full break-words text-foreground" : undefined}>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
