import "dotenv/config";
import {execFileSync} from "node:child_process";
import {createHash} from "node:crypto";
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {resolve} from "node:path";
import {homedir} from "node:os";
import pg from "pg";
import {withVerifiedPostgresTls} from "../src/lib/database-url";
import {analyze,headers,type Category,type Existing,type SourceRow} from "./product-import-core";

type Mapping = {excelCategory:string;excelSubcategory:string;productCount:number;originalStatus:string;slug:string|null;confidence:string;reason:string;dbCategory:Category|null};
type CleanRecord = {sourceRows:number[];values:unknown[];original:unknown[];flags:string[];manualReasons:string[];formulaColumns:number[];sheet?:string;categoryMapping?:Mapping;validation?:ReturnType<typeof analyze>[number]};
type Candidate = {status:string;name:string;slug:string;parent:Category|null;productCount:number;reason:string};
type Result = {records:CleanRecord[];excludedDemo:CleanRecord[];duplicateAudit:unknown[];categoryMappings:Mapping[];newCategoryCandidates:Candidate[];originalRows:number};
const hash = (data:string|Buffer) => createHash("sha256").update(data).digest("hex");

async function main() {
  const args=process.argv.slice(2);
  if(args.length && (args.length!==2 || args[0]!=="--file")) throw new Error("Only --file is supported; cleanup never supports --apply");
  const file=resolve(args[1] ?? resolve(homedir(),"Downloads","Remaro_товары 0 (восстановлен).xlsx"));
  const dir=resolve("reports/product-import");
  const output=resolve(dir,"Remaro_products_cleaned.xlsx");
  if(file.toLowerCase()===output.toLowerCase()) throw new Error("Original and output must differ");
  const sourceSha256=hash(readFileSync(file));
  const python=process.env.PYTHON ?? "python";
  const workbook:{rows:SourceRow[]} = JSON.parse(execFileSync(python,["-X","utf8","scripts/read-products-xlsx.py",file,"Товары"],{encoding:"utf8",maxBuffer:32*1024*1024}));
  const [header,...source]=workbook.rows;
  if(header.values.length!==headers.length || headers.some((h,i)=>header.values[i]!==h)) throw new Error("Unexpected source headers");
  const url=process.env.DATABASE_URL;
  if(!url) throw new Error("DATABASE_URL required");
  const client=new pg.Client({connectionString:withVerifiedPostgresTls(url),connectionTimeoutMillis:15000,statement_timeout:30000});
  let categories:Category[],products:Existing[];
  await client.connect();
  try {
    await client.query("BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY");
    categories=(await client.query<Category>('SELECT id,name,slug,"parentId" FROM "Category" ORDER BY id')).rows;
    products=(await client.query<Existing>('SELECT id,sku,slug,name,brand,price,"oldPrice",stock,unit,"categoryId",description FROM "Product" ORDER BY id')).rows;
    await client.query("ROLLBACK");
  } finally {await client.end();}
  const baseline=analyze(source,categories,products);
  const baselineMappings=[...new Map(baseline.map(r=>[JSON.stringify([r.source[headers[0]],r.source[headers[1]]]),
    {excelCategory:r.source[headers[0]],excelSubcategory:r.source[headers[1]],...r.mapping}])).values()];
  const input={rows:source,categories,products,baselineMappings,demoRows:baseline.filter(r=>r.demo).map(r=>r.row)};
  const result:Result=JSON.parse(execFileSync(python,["-X","utf8","scripts/clean-products.py"],{input:JSON.stringify(input),encoding:"utf8",maxBuffer:32*1024*1024}));
  // Re-run the exact same transformation and compare logical output, not ZIP timestamps.
  const repeat=execFileSync(python,["-X","utf8","scripts/clean-products.py"],{input:JSON.stringify(input),encoding:"utf8",maxBuffer:32*1024*1024});
  if(JSON.stringify(JSON.parse(repeat))!==JSON.stringify(result)) throw new Error("Cleanup is not deterministic");
  const validation=analyze(result.records.map(r=>({number:r.sourceRows[0],values:r.values,formulaColumns:r.formulaColumns})),categories,products);
  for(const [i,r] of result.records.entries()) {
    const v=validation[i];
    r.validation=v;
    r.manualReasons.push(...v.issues.filter(x=>x!=="MISSING PRICE"));
    if(v.existingId) r.manualReasons.push("EXISTING_DB_PRODUCT");
    if(v.demo) r.manualReasons.push("DEMO_MARKER_REVIEW");
    r.manualReasons=[...new Set(r.manualReasons)].sort();
    r.sheet=r.manualReasons.length ? "MANUAL_REVIEW" : r.flags.includes("MISSING_PRICE") ? "MISSING_PRICE" : "READY";
    const markers=r.flags.filter(x=>["STOCK_NOT_PROVIDED","IMAGE_PENDING"].includes(x)).map(x=>"[REMARO:"+x+"]");
    if(r.sheet==="MANUAL_REVIEW") markers.push("[REMARO:MANUAL_REVIEW]");
    r.values[25]=[r.values[25],...markers].filter(Boolean).join("\n");
  }
  const skus=result.records.map(r=>String(r.values[3]));
  const slugs=result.records.map(r=>String(r.values[4]));
  if(new Set(skus).size!==skus.length || new Set(slugs).size!==slugs.length) throw new Error("Residual duplicate identifiers");
  const ready=result.records.filter(r=>r.sheet==="READY");
  if(ready.some(r=>r.validation?.action!=="CREATE")) throw new Error("Unsafe READY row");
  const allSourceRows=[...result.records.flatMap(r=>r.sourceRows),...result.excludedDemo.flatMap(r=>r.sourceRows)];
  if(allSourceRows.length!==source.length || new Set(allSourceRows).size!==source.length) throw new Error("Source row accounting failed");
  const summary={
    "Original rows":source.length,"Demo excluded":result.excludedDemo.length,
    "Exact duplicate copies consolidated":result.records.reduce((n,r)=>n+r.sourceRows.length-1,0),
    "Unique product records":result.records.length,
    "Column shifts fixed":result.records.filter(r=>r.flags.includes("COLUMN_SHIFT_FIXED")).length,
    "Column shifts unresolved":result.records.filter(r=>r.manualReasons.includes("UNRESOLVED_COLUMN_SHIFT")).length,
    "Unique SKU":new Set(skus).size,"Duplicate SKU remaining":skus.length-new Set(skus).size,
    "Unique slug":new Set(slugs).size,"Duplicate slug remaining":slugs.length-new Set(slugs).size,
    "Prices available":result.records.filter(r=>!r.flags.includes("MISSING_PRICE")).length,
    "Missing real prices":result.records.filter(r=>r.flags.includes("MISSING_PRICE")).length,
    "Stock provided":result.records.filter(r=>r.flags.includes("STOCK_PROVIDED")).length,
    "Stock not provided":result.records.filter(r=>r.flags.includes("STOCK_NOT_PROVIDED")).length,
    "Categories automatically matched (pairs)":result.categoryMappings.filter(m=>m.confidence==="HIGH").length,
    "Categories requiring review (pairs)":result.categoryMappings.filter(m=>m.confidence!=="HIGH").length,
    "Categories automatically matched (products)":result.records.filter(r=>r.categoryMapping?.confidence==="HIGH").length,
    "Categories requiring review (products)":result.records.filter(r=>r.categoryMapping?.confidence!=="HIGH").length,
    "New category candidates":result.newCategoryCandidates.length,
    "Ready for import":ready.length,
    "MISSING_PRICE sheet":result.records.filter(r=>r.sheet==="MISSING_PRICE").length,
    "Manual review":result.records.filter(r=>r.sheet==="MANUAL_REVIEW").length,
    "Image pending":result.records.filter(r=>r.flags.includes("IMAGE_PENDING")).length,
    "Database products read":products.length,
    "Deterministic rerun":"PASS","Original file unchanged":"PASS","DATABASE CHANGES":"NONE"
  };
  if(hash(readFileSync(file))!==sourceSha256) throw new Error("Original source changed during cleanup");
  const datasetSha256=hash(JSON.stringify(result));
  const report={...result,headers,summary,sourceSha256,datasetSha256,databaseSnapshot:{categories,products},file,output};
  mkdirSync(dir,{recursive:true});
  execFileSync(python,["-X","utf8","scripts/write-cleaned-products.py",output],{input:JSON.stringify(report),encoding:"utf8",maxBuffer:32*1024*1024});
  writeFileSync(resolve(dir,"cleanup-audit.json"),JSON.stringify(report,null,2)+"\n");
  writeFileSync(resolve(dir,"missing-prices.json"),JSON.stringify(result.records.filter(r=>r.flags.includes("MISSING_PRICE")).map(r=>({sourceRows:r.sourceRows,sku:r.values[3],name:r.values[5],sheet:r.sheet,manualReasons:r.manualReasons})),null,2)+"\n");
  const cell=(v:unknown)=>String(v ?? "").replace(/\|/g,"\\|").replace(/[\r\n]+/g," ");
  const table=["| Excel category | Excel subcategory | Count | Suggested DB category | DB slug | DB ID | Confidence | Reason |",
    "| --- | --- | ---: | --- | --- | --- | --- | --- |",...result.categoryMappings.map(m=>
    "| "+[m.excelCategory,m.excelSubcategory,m.productCount,m.dbCategory?.name,m.slug,m.dbCategory?.id,m.confidence,m.reason].map(cell).join(" | ")+" |")].join("\n");
  writeFileSync(resolve(dir,"semantic-category-mapping.md"),table+"\n");
  writeFileSync(resolve(dir,"cleanup-summary.md"),"# REMARO — PRODUCT DATA CLEANUP\n\n"+
    Object.entries(summary).map(([k,v])=>k+": "+v).join("\n\n")+"\n\nCLEANED FILE: "+output+
    "\n\nSKU/slug and product counts refer to unique records after exact duplicate consolidation. Original row numbers are retained in cell comments and cleanup-audit.json. Missing prices can overlap MANUAL_REVIEW. Only READY is an import candidate.\n\n"+
    "Source SHA256: "+sourceSha256+"\n\nDataset SHA256: "+datasetSha256+"\n\n"+table+"\n");
  console.log(JSON.stringify({summary,output,datasetSha256},null,2));
}
main().catch(error=>{console.error(error instanceof Error ? error.message : "Cleanup failed");process.exitCode=1;});
