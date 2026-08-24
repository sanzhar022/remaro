import type { Category } from "@/types/category";

// Seed-only catalog data. Runtime catalog queries use PostgreSQL through Prisma.
export const categories: readonly Category[] = [
  { id: "building-materials", name: "Строительные материалы", slug: "building-materials", description: "Материалы для возведения, утепления и защиты конструкций", parentId: null, icon: "blocks", order: 1, featured: true },
  { id: "tools", name: "Инструменты", slug: "tools", description: "Ручной и электроинструмент для профессиональных задач", parentId: null, icon: "hammer", order: 2, featured: true },
  { id: "electrical", name: "Электрика", slug: "electrical", description: "Кабели, розетки и оборудование для электромонтажа", parentId: null, icon: "plug", order: 3, featured: true },
  { id: "plumbing", name: "Сантехника", slug: "plumbing", description: "Всё для водоснабжения, отопления и ванной комнаты", parentId: null, icon: "faucet", order: 4, featured: true },
  { id: "finishing-materials", name: "Отделочные материалы", slug: "finishing-materials", description: "Решения для чистовой отделки стен и потолков", parentId: null, icon: "paint-roller", order: 5, featured: true },
  { id: "flooring", name: "Напольные покрытия", slug: "flooring", description: "Практичные покрытия для дома и коммерческих помещений", parentId: null, icon: "layout-grid", order: 6, featured: true },
  { id: "paints", name: "Краски и лакокрасочные материалы", slug: "paints-and-varnishes", description: "Краски, лаки, грунтовки и малярные материалы", parentId: null, icon: "paint-bucket", order: 7, featured: true },
  { id: "fasteners", name: "Крепёж", slug: "fasteners", description: "Надёжный крепёж для любых строительных работ", parentId: null, icon: "wrench", order: 8, featured: true },
  { id: "doors", name: "Двери", slug: "doors", description: "Входные и межкомнатные двери и комплектующие", parentId: null, icon: "door-open", order: 9 },
  { id: "windows", name: "Окна", slug: "windows", description: "Оконные решения и необходимые комплектующие", parentId: null, icon: "panels-top-left", order: 10 },
  { id: "lighting", name: "Освещение", slug: "lighting", description: "Светильники и лампы для дома и участка", parentId: null, icon: "lightbulb", order: 11 },
  { id: "garden", name: "Сад и дача", slug: "garden-and-cottage", description: "Товары для участка, сада и загородного отдыха", parentId: null, icon: "tree-pine", order: 12 },

  { id: "dry-mixes", name: "Сухие смеси", slug: "dry-mixes", description: "Смеси для кладки, выравнивания и отделочных работ", parentId: "building-materials", icon: "package", order: 1 },
  { id: "wall-materials", name: "Стеновые материалы", slug: "wall-materials", description: "Блоки и материалы для возведения стен", parentId: "building-materials", icon: "brick-wall", order: 2 },
  { id: "sheet-materials", name: "Листовые материалы", slug: "sheet-materials", description: "Листы для черновой отделки и строительства", parentId: "building-materials", icon: "layers", order: 3 },
  { id: "insulation", name: "Изоляция", slug: "insulation", description: "Материалы для защиты дома от холода, влаги и шума", parentId: "building-materials", icon: "shield", order: 4 },
  { id: "roofing", name: "Кровля", slug: "roofing", description: "Материалы для надёжной и долговечной крыши", parentId: "building-materials", icon: "house", order: 5 },
  { id: "rolled-metal", name: "Металлопрокат", slug: "rolled-metal", description: "Металлические изделия для строительства", parentId: "building-materials", icon: "anvil", order: 6 },

  { id: "cement", name: "Цемент", slug: "cement", parentId: "dry-mixes", icon: "package", order: 1 },
  { id: "plaster", name: "Штукатурка", slug: "plaster", parentId: "dry-mixes", icon: "paint-roller", order: 2 },
  { id: "putty", name: "Шпаклёвка", slug: "putty", parentId: "dry-mixes", icon: "paintbrush", order: 3 },
  { id: "tile-adhesive", name: "Клей для плитки", slug: "tile-adhesive", parentId: "dry-mixes", icon: "grid-2x2", order: 4 },
  { id: "floor-mixes", name: "Смеси для пола", slug: "floor-mixes", parentId: "dry-mixes", icon: "layers", order: 5 },

  { id: "drywall", name: "Гипсокартон", slug: "drywall", parentId: "sheet-materials", icon: "panel-top", order: 1 },
  { id: "osb", name: "OSB", slug: "osb", parentId: "sheet-materials", icon: "panel-top", order: 2 },
  { id: "plywood", name: "Фанера", slug: "plywood", parentId: "sheet-materials", icon: "panel-top", order: 3 },
  { id: "chipboard", name: "ДСП", slug: "chipboard", parentId: "sheet-materials", icon: "panel-top", order: 4 },

  { id: "thermal-insulation", name: "Теплоизоляция", slug: "thermal-insulation", parentId: "insulation", icon: "thermometer-sun", order: 1 },
  { id: "waterproofing", name: "Гидроизоляция", slug: "waterproofing", parentId: "insulation", icon: "droplets", order: 2 },
  { id: "vapor-barrier", name: "Пароизоляция", slug: "vapor-barrier", parentId: "insulation", icon: "cloud", order: 3 },
  { id: "soundproofing", name: "Звукоизоляция", slug: "soundproofing", parentId: "insulation", icon: "volume-x", order: 4 },
];
