import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

export interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  href?: string;
  className?: string;
}

export function SectionHeader({ title, description, action, href, className = "" }: SectionHeaderProps) {
  return (
    <div className={`mb-7 flex items-end justify-between gap-5 sm:mb-9 ${className}`}>
      <div>
        <h2 className="type-h2">{title}</h2>
        {description && <p className="mt-2 max-w-2xl text-muted">{description}</p>}
      </div>
      {action ?? (href && <Link href={href} className="hidden shrink-0 items-center gap-2 font-semibold text-primary hover:text-primary-hover sm:flex">Смотреть все <ArrowRight size={18} aria-hidden="true" /></Link>)}
    </div>
  );
}
