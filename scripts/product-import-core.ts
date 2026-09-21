import { createHash } from "node:crypto";

export type Category = { id: string; name: string; slug: string; parentId: string | null };
export type Existing = { id: string; sku: string; slug: string; name: string; brand: string; price: number; oldPrice: number | null; stock: number; unit: string; categoryId: string; description: string | null };
export type SourceRow = { number: number; values: unknown[]; formulaColumns: number[] };
export const headers = ["Категория","Подкатегория","Бренд","Артикул","URL-имя (slug)","Название товара","Цена, ₸","Старая цена, ₸","Единица продажи","Остаток, шт.","В наличии","Рейтинг","Популярный","Хит продаж","Описание","Вес / объём","Тип / назначение","Характеристики","Фото 1 (главное)","Фото 2","Фото 3","Ссылка на источник","Магазин / конкурент","Цена конкурента, ₸","Дата проверки","Примечание"];
export const str = (v: unknown) => v == null ? "" : String(v).trim();
export const norm = (v: string) => v.normalize("NFKC").toLowerCase().replace(/ё/g,"е").replace(/^\d+(?:\.\d+)*[.)]?\s+/, "").replace(/\s+/g," ").trim();
export function slugify(value: string) {
  const ru = "абвгдеёжзийклмнопрстуфхцчшщъыьэюя";
  const en = ["a","b","v","g","d","e","e","zh","z","i","y","k","l","m","n","o","p","r","s","t","u","f","kh","ts","ch","sh","shch","","y","","e","yu","ya"];
  return value.toLowerCase().split("").map(c => ru.includes(c) ? en[ru.indexOf(c)] : c).join("").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
}
export function numeric(value: unknown): number | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const text = str(value);
  if (!/^(?:\d+|\d{1,3}(?:[ \u00a0\u202f]\d{3})+)(?:[.,]\d+)?$/.test(text)) return null;
  const n = Number(text.replace(/[ \u00a0\u202f]/g,"").replace(",","."));
  return Number.isFinite(n) && n >= 0 ? n : null;
}
const int = (v: unknown) => { const n = numeric(v); return n !== null && Number.isInteger(n) && n <= 2147483647 ? n : null; };
export function mapCategory(category: string, subcategory: string, categories: Category[]) {
  const parents = categories.filter(c => norm(c.name) === norm(category));
  const descendant = (c: Category, id: string) => {
    const seen = new Set<string>();
    let parent = c.parentId;
    while (parent && !seen.has(parent)) {
      if (parent === id) return true;
      seen.add(parent); parent = categories.find(p => p.id === parent)?.parentId ?? null;
    }
    return false;
  };
  const candidates = subcategory
    ? categories.filter(c => norm(c.name) === norm(subcategory) && parents.some(p => c.id === p.id || descendant(c,p.id)))
    : parents;
  return { status: candidates.length === 1 ? "MATCHED" : candidates.length > 1 ? "AMBIGUOUS" : "NOT FOUND",
    candidates, suggestions: candidates.length ? [] : categories.filter(c => norm(c.name) === norm(subcategory || category)) };
}
export function analyze(source: SourceRow[], categories: Category[], products: Existing[]) {
  const frequency = (index: number) => {
    const result = new Map<string, number>();
    for (const r of source) { const key = str(r.values[index]); if (key) result.set(key,(result.get(key) ?? 0)+1); }
    return result;
  };
  const skus = frequency(3), slugs = frequency(4);
  const proposedSlugs = new Map<string, number>();
  for (const r of source) { const s = slugify(str(r.values[4]) || str(r.values[5])); if(s) proposedSlugs.set(s,(proposedSlugs.get(s) ?? 0)+1); }
  return source.map(row => {
    const v = row.values.map(str);
    const issues: string[] = [], warnings: string[] = [];
    const mapping = mapCategory(v[0],v[1],categories);
    const price = int(row.values[6]), old = int(row.values[7]), stock = int(row.values[9]);
    const proposedSlug = slugify(v[4] || v[5]);
    const proposedSku = "REM-" + createHash("sha256").update(JSON.stringify([norm(v[0]),norm(v[1]),norm(v[2]),norm(v[5])])).digest("hex").slice(0,16).toUpperCase();
    if (v[25].includes("[REMARO:MANUAL_REVIEW]")) issues.push("MANUAL REVIEW");
    if (v[25].includes("[REMARO:STOCK_NOT_PROVIDED]")) warnings.push("STOCK_NOT_PROVIDED");
    if (v[25].includes("[REMARO:IMAGE_PENDING]")) warnings.push("IMAGE_PENDING");
    if (!v[5]) issues.push("MISSING NAME");
    if (!v[2]) issues.push("MISSING BRAND");
    if (!v[8] || numeric(row.values[8]) !== null) issues.push("INVALID UNIT");
    if (!v[3]) issues.push("MISSING SKU");
    if ((skus.get(v[3]) ?? 0)>1) issues.push("DUPLICATE SKU");
    if (!v[4]) issues.push("MISSING SLUG");
    else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v[4])) issues.push("INVALID SLUG");
    if ((slugs.get(v[4]) ?? 0)>1) issues.push("DUPLICATE SLUG");
    if ((proposedSlugs.get(proposedSlug) ?? 0)>1) warnings.push("PROPOSED SLUG COLLISION");
    if (price === null) issues.push(v[6] ? "INVALID PRICE" : "MISSING PRICE");
    if (stock === null) issues.push(v[9] ? "INVALID STOCK" : "MISSING STOCK");
    if (v[7] && (old === null || price === null || old <= price)) warnings.push("INVALID OLD PRICE: omitted in proposal");
    if (!v[14]) warnings.push("MISSING DESCRIPTION");
    if (mapping.status !== "MATCHED") issues.push("CATEGORY " + mapping.status);
    if (row.formulaColumns.length) issues.push("FORMULA CELL");
    const shiftSignals = [
      v[6] && numeric(row.values[6]) === null,
      /^[a-z0-9][a-z0-9._/-]*\d[a-z0-9._/-]*$/i.test(v[5]),
      /^(м\.?\s?п\.?|шт\.?|м[²³23]?|уп\.?|кг)$/i.test(v[9]),
      v[7] && numeric(row.values[7]) === null,
      !!v[4] && v[4].toLowerCase() === v[5].toLowerCase()
    ].filter(Boolean).length;
    const shifted = shiftSignals >= 3;
    if (shifted) issues.push("BLOCKED_COLUMN_SHIFT");
    const photoSources = v.slice(18,21).filter(Boolean);
    if (!photoSources.length) warnings.push("MISSING PHOTO");
    for (const url of photoSources) {
      try { if (!["https:","http:"].includes(new URL(url).protocol)) throw new Error(); }
      catch { warnings.push("INVALID PHOTO URL"); }
    }
    const rating = v[11] ? numeric(row.values[11]) : 0;
    if (rating === null || rating > 5) issues.push("INVALID RATING");
    const boolean = (text: string, label: string) => {
      if (!text) return false;
      if (/^(да|true|1)$/i.test(text)) return true;
      if (/^(нет|false|0)$/i.test(text)) return false;
      issues.push("INVALID " + label); return false;
    };
    const attributes = {rating:rating ?? 0,isPopular:boolean(v[12],"POPULAR"),isHit:boolean(v[13],"HIT")};
    if(v[10]) {
      const available = boolean(v[10],"AVAILABILITY");
      if(stock !== null && available !== (stock > 0)) warnings.push("AVAILABILITY STOCK MISMATCH");
    }
    const demo = /пример/i.test(v[25]) || v.slice(18,22).some(value => {
      try { const host = new URL(value).hostname; return host === "example.com" || host.endsWith(".example.com"); } catch { return false; }
    });
    const specifications: {name: string; value: string; order: number}[] = [];
    for (const fragment of v[17].split(";").filter(s => s.trim())) {
      const colon = fragment.indexOf(":");
      const name = fragment.slice(0,colon).trim(), value = fragment.slice(colon+1).trim();
      if (colon < 1 || !name || !value) { warnings.push("INVALID SPECIFICATION"); continue; }
      if (specifications.some(s => norm(s.name) === norm(name))) { warnings.push("DUPLICATE SPECIFICATION KEY: " + name); continue; }
      specifications.push({name,value,order:specifications.length});
    }
    for (const [name,value] of [["Вес / объём",v[15]],["Тип / назначение",v[16]]]) {
      if(value && !specifications.some(s=>norm(s.name)===norm(name))) specifications.push({name,value,order:specifications.length});
    }
    const skuMatch = products.find(p => p.sku === v[3]);
    const slugMatch = products.find(p => p.slug === v[4]);
    if (skuMatch && slugMatch && skuMatch.id !== slugMatch.id) issues.push("SKU SLUG IDENTITY CONFLICT");
    if (slugMatch && !skuMatch) issues.push("DB SLUG CONFLICT");
    if (products.some(p => p.slug === proposedSlug && p.id !== skuMatch?.id)) warnings.push("PROPOSED SLUG DB CONFLICT");
    const existing = skuMatch ?? slugMatch;
    const proposal = { sku:v[3], slug:v[4], name:v[5], brand:v[2], price, oldPrice:old !== null && price !== null && old>price ? old : null,
      stock, unit:v[8], categoryId:mapping.candidates[0]?.id ?? null, description:v[14] || null };
    const changes = existing ? Object.entries(proposal).filter(([key,value]) => existing[key as keyof Existing] !== value).map(([key])=>key) : [];
    const action = demo || issues.length ? "BLOCKED" : existing ? changes.length ? "UPDATE_CANDIDATE" : "EXISTING" : "CREATE";
    const status = shifted ? "BLOCKED_COLUMN_SHIFT" : demo ? "DEMO_ROW" : issues.length ? "BLOCKED" : warnings.length ? "WARNING" : "READY";
    return {row:row.number, status, action, demo, issues, warnings, mapping, proposal, specifications, photoSources,
      proposedSku: v[3] ? null : proposedSku, proposedSlug, existingId:existing?.id ?? null,
      match:skuMatch ? "EXISTING_PRODUCT" : slugMatch ? "SLUG_MATCH" : null, changes,
      similarNames: products.filter(p => norm(p.name) === norm(v[5]) || (v[5].length>10 && norm(p.name).includes(norm(v[5])))).map(p=>({id:p.id,name:p.name})),
      attributes,
      source: Object.fromEntries(headers.map((header,i)=>[header,row.values[i] ?? null])) };
  });
}
