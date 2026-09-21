export function orderCategoryHierarchy<T extends { id: string; parentId: string | null; name: string }>(categories: T[]) {
  const children = new Map<string | null, T[]>();
  for (const category of categories) {
    const list = children.get(category.parentId) ?? [];
    list.push(category);
    children.set(category.parentId, list);
  }
  const result: Array<T & { depth: number; label: string }> = [];
  const visited = new Set<string>();
  const visit = (parentId: string | null, depth: number) => {
    for (const category of children.get(parentId) ?? []) {
      if (visited.has(category.id)) continue;
      visited.add(category.id);
      result.push({ ...category, depth, label: `${"— ".repeat(depth)}${category.name}` });
      visit(category.id, depth + 1);
    }
  };
  visit(null, 0);
  for (const category of categories) if (!visited.has(category.id)) result.push({ ...category, depth: 0, label: category.name });
  return result;
}
