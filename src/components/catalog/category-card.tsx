import {
  ArrowUpRight,
  Anvil,
  Blocks,
  BrickWall,
  DoorOpen,
  Droplets,
  Hammer,
  House,
  Layers,
  LayoutGrid,
  Lightbulb,
  Package,
  PaintBucket,
  PaintRoller,
  PanelsTopLeft,
  Plug,
  Shield,
  TreePine,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/types/category";
import { getCategoryImage } from "@/lib/category-images";

const categoryIcons: Record<string, LucideIcon> = {
  "building-materials": Blocks,
  tools: Hammer,
  electrical: Plug,
  plumbing: Droplets,
  "finishing-materials": PaintRoller,
  flooring: LayoutGrid,
  "paints-and-varnishes": PaintBucket,
  fasteners: Wrench,
  doors: DoorOpen,
  windows: PanelsTopLeft,
  lighting: Lightbulb,
  "garden-and-cottage": TreePine,
  "dry-mixes": Package,
  "wall-materials": BrickWall,
  "sheet-materials": Layers,
  insulation: Shield,
  roofing: House,
  "rolled-metal": Anvil,
};

const containedRootCategorySlugs = new Set([
  "roofing-and-drainage",
  "facade-materials",
  "lumber",
  "metal-products",
  "heating",
  "ventilation-and-climate",
  "construction-chemicals",
  "workwear-and-ppe",
]);

export interface CategoryCardProps {
  category: Category;
  compact?: boolean;
}

export function CategoryCard({ category, compact = false }: CategoryCardProps) {
  const Icon = categoryIcons[category.slug] ?? Blocks;
  const image = category.image ?? getCategoryImage(category.slug);
  const containImage = containedRootCategorySlugs.has(category.slug) || image?.startsWith("/images/categories/sand/") || image?.startsWith("/images/categories/toolses/") || image?.startsWith("/images/categories/elect/") || image?.startsWith("/images/categories/santex/") || image?.startsWith("/images/categories/plitka/") || image?.startsWith("/images/categories/krasky/") || image?.startsWith("/images/categories/napolniki/") || image?.startsWith("/images/categories/krepezh/") || image?.startsWith("/images/categories/door/") || false;
  const sizes = compact
    ? "(min-width: 1280px) 16vw, (min-width: 1024px) 33vw, (min-width: 430px) 50vw, 100vw"
    : "(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 430px) 50vw, 100vw";

  return (
    <Link href={`/category/${category.slug}`} className="group flex min-w-0 flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border bg-white shadow-[var(--shadow-sm)] transition duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[var(--shadow-md)]">
      <div className="relative grid aspect-[4/3] place-items-center overflow-hidden bg-secondary text-[var(--navy-900)]">
        {image ? <Image src={image} alt={category.name} fill sizes={sizes} unoptimized className={`${containImage ? "object-contain p-3 sm:p-4" : "object-cover"} object-center transition-transform duration-200 group-hover:scale-[1.03]`}/> : <Icon className="size-12 transition-transform duration-200 group-hover:scale-105" strokeWidth={1.5} aria-hidden="true" />}
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3"><h3 className="type-h3 group-hover:text-[var(--navy-800)]">{category.name}</h3><ArrowUpRight className="mt-0.5 size-5 shrink-0 text-primary transition-transform group-hover:translate-x-1 group-hover:-translate-y-0.5" aria-hidden="true" /></div>
        {category.description && <p className="type-small mt-2 line-clamp-3 text-muted">{category.description}</p>}
      </div>
    </Link>
  );
}
