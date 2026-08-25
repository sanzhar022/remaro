import { CategoryCard } from "@/components/catalog/category-card";
import type { Category } from "@/types/category";

export interface CategoryGridProps {
  categories: readonly Category[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 min-[430px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {categories.map((category) => <CategoryCard key={category.id} category={category} />)}
    </div>
  );
}
