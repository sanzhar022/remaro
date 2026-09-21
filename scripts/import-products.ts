import "dotenv/config";
import { execFileSync } from "node:child_process";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { homedir } from "node:os";
import { createHash, randomUUID } from "node:crypto";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { withVerifiedPostgresTls } from "../src/lib/database-url";
import { analyze, headers, str, type Category, type Existing, type SourceRow } from "./product-import-core";

async function main() {
  const args = process.argv.slice(2);
  const options = new Map<string,string>();
  let apply = false;
  for (let i=0;i<args.length;i++) {
    if(args[i] === "--apply") { apply = true; continue; }
    if(!["--file","--sheet","--report-dir","--review-sha256","--expected-create"].includes(args[i]) || !args[i+1] || args[i+1].startsWith("--")) throw new Error("Unknown/incomplete option: " + args[i]);
    options.set(args[i],args[++i]);
  }
  const file = resolve(options.get("--file") ?? resolve(homedir(),"Downloads","Remaro_товары 0 (восстановлен).xlsx"));
  const workbookHash = createHash("sha256").update(readFileSync(file)).digest("hex");
  const workbook: {sheets: unknown[]; rows: SourceRow[]} = JSON.parse(execFileSync(process.env.PYTHON ?? "python",
    ["-X","utf8",resolve("scripts/read-products-xlsx.py"),file,options.get("--sheet") ?? "Товары"],
    {encoding:"utf8",maxBuffer:32*1024*1024}));
  const [header,...source] = workbook.rows;
  if (!header || headers.some((h,i)=>str(header.values[i]) !== h) || header.values.length !== headers.length) throw new Error("Unexpected workbook headers; no import attempted");
  if (!source.length) throw new Error("No product rows");
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required; database matching cannot be skipped");
  const client = new pg.Client({connectionString:withVerifiedPostgresTls(url),connectionTimeoutMillis:15000,statement_timeout:30000});
  let categories: Category[], products: Existing[];
  const snapshot: Record<string, unknown> = {};
  await client.connect();
  try {
    await client.query("BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY");
    categories = (await client.query<Category>('SELECT id, name, slug, "parentId" FROM "Category" ORDER BY id')).rows;
    products = (await client.query<Existing>('SELECT id, sku, slug, name, brand, price, "oldPrice", stock, unit, "categoryId", description FROM "Product" ORDER BY id')).rows;
    for (const table of ["Product","Category","ProductSpecification","ProductImage"]) {
      snapshot[table] = (await client.query('SELECT * FROM "' + table + '" ORDER BY id')).rows;
    }
    await client.query("ROLLBACK");
  } finally { await client.end(); }
  const rows = analyze(source,categories,products);
  const expected = options.has("--expected-create") ? Number(options.get("--expected-create")) : null;
  const skipped = rows.filter(r=>r.existingId).map(r=>({row:r.row,sku:r.proposal.sku,slug:r.proposal.slug,id:r.existingId,status:"SKIP_EXISTING"}));
  const invalidSpecs = rows.filter(r=>r.specifications.some(s=>!s.name.trim() || !s.value.trim()) ||
    new Set(r.specifications.map(s=>s.name.trim().toLowerCase())).size !== r.specifications.length ||
    r.warnings.some(w=>w.startsWith("INVALID SPECIFICATION") || w.startsWith("DUPLICATE SPECIFICATION")));
  const precheck = {
    "READY INPUT":rows.length,"DB SKU CONFLICTS":rows.filter(r=>r.match==="EXISTING_PRODUCT").length,
    "DB SLUG CONFLICTS":rows.filter(r=>products.some(p=>p.slug===r.proposal.slug)).length,
    "MISSING CATEGORY":rows.filter(r=>r.mapping.status!=="MATCHED").length,
    "INVALID PRICE":rows.filter(r=>r.proposal.price===null).length,
    "INVALID STOCK":rows.filter(r=>r.proposal.stock!==0).length,
    "INVALID SPECIFICATIONS":invalidSpecs.length,"IMPORTABLE":rows.filter(r=>r.action==="CREATE").length,
    "CREATE":rows.filter(r=>r.action==="CREATE").length,"SKIP_EXISTING":skipped.length,
    "BLOCKED":rows.filter(r=>r.action==="BLOCKED" && !r.existingId).length,
    "WARNINGS":rows.filter(r=>r.warnings.length).length
  };
  if(expected!==null && (!Number.isSafeInteger(expected) || expected<1)) throw new Error("Invalid expected count");

  const countIssue = (issue: string) => rows.filter(r=>r.issues.includes(issue) || r.warnings.includes(issue)).length;
  const mapping = [...new Set(rows.map(r=>JSON.stringify([r.source[headers[0]],r.source[headers[1]]])))].map(key=>{
    const group = rows.filter(r=>JSON.stringify([r.source[headers[0]],r.source[headers[1]]])===key);
    return {excelCategory:group[0].source[headers[0]],excelSubcategory:group[0].source[headers[1]],rows:group.length,...group[0].mapping};
  });
  const summary = {
    "TOTAL ROWS":rows.length, "DEMO ROWS":rows.filter(r=>r.demo).length,
    "VALID ROWS":rows.filter(r=>!r.issues.length && !r.demo).length,
    "READY TO CREATE":rows.filter(r=>r.action==="CREATE").length,
    "EXISTING PRODUCTS":rows.filter(r=>r.existingId).length,
    "UPDATE CANDIDATES":rows.filter(r=>r.action==="UPDATE_CANDIDATE").length,
    "BLOCKED":rows.filter(r=>r.issues.length && !r.demo).length,
    "MISSING SKU":countIssue("MISSING SKU"),"DUPLICATE SKU":countIssue("DUPLICATE SKU"),
    "MISSING SLUG":countIssue("MISSING SLUG"),"DUPLICATE SLUG":countIssue("DUPLICATE SLUG"),
    "DB SKU MATCHES":rows.filter(r=>r.match==="EXISTING_PRODUCT").length,
    "DB SLUG CONFLICTS":countIssue("DB SLUG CONFLICT"),"IDENTITY CONFLICTS":countIssue("SKU SLUG IDENTITY CONFLICT"),
    "MISSING PRICE":countIssue("MISSING PRICE"),"INVALID PRICE":countIssue("INVALID PRICE"),
    "MISSING STOCK":countIssue("MISSING STOCK"),"INVALID STOCK":countIssue("INVALID STOCK"),
    "WITH STOCK":rows.filter(r=>r.proposal.stock !== null).length,"WITHOUT STOCK":countIssue("MISSING STOCK"),
    "MISSING PHOTO":countIssue("MISSING PHOTO"),"MANUAL REVIEW":countIssue("MANUAL REVIEW"),"STOCK NOT PROVIDED":countIssue("STOCK_NOT_PROVIDED"),"IMAGE PENDING":countIssue("IMAGE_PENDING"),
    "CATEGORY MATCHED":mapping.filter(m=>m.status==="MATCHED").length,
    "CATEGORY NOT FOUND":mapping.filter(m=>m.status==="NOT FOUND").length,
    "CATEGORY AMBIGUOUS":mapping.filter(m=>m.status==="AMBIGUOUS").length,
    "COLUMN SHIFT ROWS":rows.filter(r=>r.status==="BLOCKED_COLUMN_SHIFT").map(r=>r.row),
  };
  // Review token binds the source, database snapshot and complete analysis.
  const reviewSha256 = createHash("sha256").update(JSON.stringify({workbookHash,categories,products,rows})).digest("hex");
  const report = {title:"REMARO PRODUCT IMPORT — DRY RUN",createdAt:new Date().toISOString(),file,workbookHash,reviewSha256,
    databaseChanges:"NONE",databaseProductCount:products.length, sheets:workbook.sheets,summary,
    policy:{missingStock:"BLOCKED; stock=0 requires separate approval",images:"Source links retained in report only; no uploads",existing:"No updates",categoryMapping:"Exact normalized name within matching parent/ancestor; suggestions require review"},
    databaseCategories:categories,categories:mapping,precheck,skipped,rows};
  const directory = resolve(options.get("--report-dir") ?? "reports/product-import");
  mkdirSync(directory,{recursive:true});
  writeFileSync(resolve(directory,apply ? "apply-precheck.json" : "dry-run.json"),JSON.stringify(report,null,2)+"\n");
  const cell = (v:unknown) => str(v).replace(/\|/g,"\\|").replace(/[\r\n]+/g," ");
  const categoryTable = ["| Excel Category | Excel Subcategory | Rows | DB category | DB slug | DB ID | Status |",
    "| --- | --- | ---: | --- | --- | --- | --- |",...mapping.map(m=>
      "| "+[m.excelCategory,m.excelSubcategory,m.rows,m.candidates.map(c=>c.name).join(", "),m.candidates.map(c=>c.slug).join(", "),m.candidates.map(c=>c.id).join(", "),m.status].map(cell).join(" | ")+" |")].join("\n");
  writeFileSync(resolve(directory,"categories.md"),categoryTable+"\n");
  writeFileSync(resolve(directory,"summary.md"),"# REMARO PRODUCT IMPORT — DRY RUN\n\n"+
    Object.entries(summary).map(([k,v])=>k+": "+(Array.isArray(v)?v.join(", "):v)).join("\n\n")+
    "\n\nDATABASE CHANGES: NONE\n\nDatabase products: "+products.length+"\n\nReview SHA256: "+reviewSha256+"\n\n"+categoryTable+"\n");
  if(!apply) writeFileSync(resolve(directory,"before-snapshot.json"),JSON.stringify(snapshot,null,2)+"\n");
  console.log(JSON.stringify(precheck,null,2));
  console.log(report.title);
  console.log(JSON.stringify({summary,databaseProductCount:products.length,databaseChanges:"NONE",reviewSha256,reports:directory},null,2));
  if (!apply) return;
  if(expected!==null && (options.get("--sheet")!=="READY" || rows.length!==expected || precheck.IMPORTABLE!==expected ||
      precheck["INVALID STOCK"] || invalidSpecs.length || rows.some(r=>!r.warnings.includes("STOCK_NOT_PROVIDED")))) {
    throw new Error("Controlled READY batch failed expected count / stock / specification check");
  }
  if(options.get("--review-sha256") !== reviewSha256) throw new Error("Apply requires --review-sha256 from an unchanged, separately approved dry-run");
  if(rows.some(r=>!r.demo && r.issues.length)) throw new Error("Apply blocked: resolve all non-demo blocked rows first");
  const creates = rows.filter(r=>r.action==="CREATE");
  if(!creates.length) return;
  const prisma = new PrismaClient({adapter:new PrismaPg({connectionString:withVerifiedPostgresTls(url)})});
  try {
    const planned = creates.map(row=>({...row,id:randomUUID()}));
    const productData = planned.map(row=>{
      const p=row.proposal;
      if(p.price===null || p.stock===null || !p.categoryId) throw new Error("Incomplete row SKU="+p.sku);
      return {...p,...row.attributes,id:row.id,price:p.price,stock:p.stock,categoryId:p.categoryId};
    });
    const specificationData = planned.flatMap(row=>row.specifications.map(s=>({...s,id:randomUUID(),productId:row.id})));
    writeFileSync(resolve(directory,"apply-plan.json"),JSON.stringify({
      workbookHash,reviewSha256,stockPolicy:"STOCK_NOT_PROVIDED",products:productData,specifications:specificationData
    },null,2)+"\n");
    await prisma.$transaction(async tx=>{
      const conflicts=await tx.product.findMany({where:{OR:[{sku:{in:productData.map(p=>p.sku)}},{slug:{in:productData.map(p=>p.slug)}}]},select:{sku:true,slug:true}});
      if(conflicts.length) throw new Error("Database identity changed; entire batch rolled back: "+JSON.stringify(conflicts));
      const currentCategories=await tx.category.findMany({select:{id:true,name:true,slug:true,parentId:true},orderBy:{id:"asc"}});
      if(JSON.stringify(currentCategories)!==JSON.stringify(categories)) throw new Error("Category snapshot changed; batch rolled back");
      try {
        await tx.product.createMany({data:productData});
        if(specificationData.length) await tx.productSpecification.createMany({data:specificationData});
      } catch(error) {
        console.error("Batch rolled back. Affected SKU list:",productData.map(p=>p.sku).join(", "));
        throw error;
      }
    },{isolationLevel:"Serializable",timeout:120000});
    console.log("COMMITTED Product: "+productData.length+"; ProductSpecification: "+specificationData.length+"; UPDATE: 0; DELETE: 0");
    writeFileSync(resolve(directory,"apply-result.json"),JSON.stringify({
      status:"COMMITTED",created:productData.length,specificationsCreated:specificationData.length,
      productIds:productData.map(p=>p.id),reviewSha256,at:new Date().toISOString()
    },null,2)+"\n");
  } finally {await prisma.$disconnect();}
}
main().catch(error=>{
  // Avoid printing connection URLs, credentials, or driver diagnostics.
  console.error("Product import failed:",error instanceof Error && !/postgres(?:ql)?:\/\//i.test(error.message) ? error.message : "Connection or processing error");
  process.exitCode=1;
});
