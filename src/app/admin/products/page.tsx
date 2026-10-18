import Image from "next/image";
import Link from "next/link";
import { AdminPagination } from "@/components/admin/pagination";
import { buttonClassName } from "@/components/ui/button";
import { getAdminProductOptions, getAdminProducts, type AdminProductFilters } from "@/lib/admin-products";
import { formatPrice } from "@/lib/format";

type Query = { search?: string; category?: string; brand?: string; stock?: string; image?: string; sort?: string; page?: string };
const stocks = new Set(["in", "out"]), images = new Set(["missing"]), sorts = new Set(["newest", "name", "price-asc", "price-desc", "stock-asc", "stock-desc"]);

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Query> }) {
  const query = await searchParams;
  const page = Math.max(1, Number.parseInt(query.page ?? "1", 10) || 1);
  const filters: AdminProductFilters = {
    search: query.search?.trim(), category: query.category, brand: query.brand,
    stock: stocks.has(query.stock ?? "") ? query.stock as AdminProductFilters["stock"] : undefined,
    image: images.has(query.image ?? "") ? "missing" : undefined,
    sort: sorts.has(query.sort ?? "") ? query.sort as AdminProductFilters["sort"] : "newest",
  };
  const [{ items: products, total }, options] = await Promise.all([getAdminProducts(filters, page), getAdminProductOptions()]);
  const params = { search: filters.search, category: filters.category, brand: filters.brand, stock: filters.stock, image: filters.image, sort: filters.sort };
  return <>
    <div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="type-h1">Товары</h1><p className="mt-1 text-sm text-muted">Найдено: {total}</p></div><Link href="/admin/products/new" className={buttonClassName()}>Создать товар</Link></div>
    <form className="mt-6 grid gap-3 rounded-[var(--radius-lg)] border border-border bg-surface p-4 md:grid-cols-2 xl:grid-cols-6">
      <label className="xl:col-span-2"><span className="sr-only">Поиск</span><input name="search" defaultValue={filters.search} placeholder="Название, SKU или бренд" className="h-11 w-full rounded-md border border-border px-3" /></label>
      <Filter name="category" value={filters.category} label="Все категории" options={options.categories.map(c=>({value:c.id,label:c.name}))} />
      <Filter name="brand" value={filters.brand} label="Все бренды" options={options.brands.map(brand=>({value:brand,label:brand}))} />
      <Filter name="stock" value={filters.stock} label="Любой остаток" options={[{value:"in",label:"В наличии"},{value:"out",label:"Нет в наличии"}]} />
      <Filter name="sort" value={filters.sort} label="Сортировка" options={[{value:"newest",label:"Сначала новые"},{value:"name",label:"Название А–Я"},{value:"price-asc",label:"Цена ↑"},{value:"price-desc",label:"Цена ↓"},{value:"stock-asc",label:"Остаток ↑"},{value:"stock-desc",label:"Остаток ↓"}]} />
      <label className="flex min-h-11 items-center gap-2 text-sm font-medium"><input type="checkbox" name="image" value="missing" defaultChecked={filters.image === "missing"} />Без изображения</label>
      <div className="flex gap-2 xl:col-span-5"><button className={buttonClassName()}>Применить</button><Link href="/admin/products" className={buttonClassName({variant:"outline"})}>Сбросить</Link></div>
    </form>
    <div className="mt-6 grid gap-3 md:hidden">{products.map(product=><ProductCard key={product.id} product={product} />)}</div>
    <div className="mt-6 hidden overflow-x-auto rounded-lg border border-border bg-surface md:block"><table className="w-full min-w-[62rem] text-left text-sm"><thead><tr className="border-b border-border bg-secondary"><th className="p-3">Фото</th><th>Название</th><th>Артикул</th><th>Категория</th><th>Бренд</th><th>Цена</th><th>Остаток</th><th>Статус</th><th>Действия</th></tr></thead><tbody>{products.map(product=><tr key={product.id} className="border-b border-border last:border-0"><td className="p-3"><ProductImage product={product} /></td><td className="max-w-64 font-semibold">{product.name}</td><td>{product.sku}</td><td>{product.category.name}</td><td>{product.brand}</td><td>{formatPrice(product.price)}</td><td>{product.stock} {product.unit}</td><td><StockStatus stock={product.stock} /></td><td><ProductActions id={product.id} slug={product.slug} /></td></tr>)}</tbody></table></div>
    {!products.length && <p className="mt-6 rounded-lg border border-border bg-surface p-8 text-center text-muted">Товары по заданным условиям не найдены.</p>}
    <AdminPagination page={page} totalPages={Math.max(1, Math.ceil(total / 25))} params={params} />
  </>;
}

function Filter({name,value,label,options}:{name:string;value?:string;label:string;options:Array<{value:string;label:string}>}) { return <label><span className="sr-only">{label}</span><select name={name} defaultValue={value ?? ""} className="h-11 w-full rounded-md border border-border bg-white px-3"><option value="">{label}</option>{options.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</select></label>; }
type Row = Awaited<ReturnType<typeof getAdminProducts>>["items"][number];
function ProductImage({product}:{product:Row}) { const image=product.images[0]; return <div className="relative size-12 overflow-hidden rounded-md bg-secondary">{image ? <Image src={image.url} alt={image.alt ?? product.name} fill sizes="48px" unoptimized className="object-contain" /> : <span className="grid h-full place-items-center text-[10px] text-muted">Нет фото</span>}</div>; }
function StockStatus({stock}:{stock:number}) { return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${stock>0?"bg-green-50 text-success":"bg-red-50 text-destructive"}`}>{stock>0?"В наличии":"Нет в наличии"}</span>; }
function ProductActions({id,slug}:{id:string;slug:string}) { return <div className="flex flex-wrap gap-3"><Link className="font-semibold text-primary underline" href={`/admin/products/${id}/edit`}>Редактировать</Link><Link className="font-semibold underline" href={`/product/${slug}`} target="_blank" rel="noreferrer">На сайте</Link></div>; }
function ProductCard({product}:{product:Row}) { return <article className="rounded-lg border border-border bg-surface p-4"><div className="flex gap-3"><ProductImage product={product}/><div className="min-w-0"><h2 className="font-bold">{product.name}</h2><p className="text-sm text-muted">{product.sku} · {product.category.name}</p></div></div><dl className="mt-3 grid grid-cols-2 gap-2 text-sm"><div><dt className="text-muted">Цена</dt><dd className="font-semibold">{formatPrice(product.price)}</dd></div><div><dt className="text-muted">Остаток</dt><dd>{product.stock} {product.unit}</dd></div></dl><div className="mt-4"><ProductActions id={product.id} slug={product.slug}/></div></article>; }
