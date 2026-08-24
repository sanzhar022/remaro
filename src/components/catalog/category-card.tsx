import {
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

export interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const Icon = categoryIcons[category.slug] ?? Blocks;

  return (
    <Link href={`/category/${category.slug}`} className="group flex min-w-0 flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-sm)] transition duration-200 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[var(--shadow-md)]">
      <div className="relative grid aspect-[16/9] place-items-center overflow-hidden bg-secondary text-primary sm:aspect-[5/3]">
        {category.image ? <Image src={category.image} alt={category.name} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 100vw" className="object-cover transition-transform duration-200 group-hover:scale-105"/> : <Icon className="size-12 transition-transform duration-200 group-hover:scale-105" strokeWidth={1.5} aria-hidden="true" />}
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="type-h3 group-hover:text-primary">{category.name}</h3>
        {category.description && <p className="type-small mt-2 line-clamp-2 text-muted">{category.description}</p>}
      </div>
    </Link>
  );
}
