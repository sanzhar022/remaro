import test from "node:test";
import assert from "node:assert/strict";
import {analyze,mapCategory,numeric,slugify,type Category,type Existing,type SourceRow} from "./product-import-core";

const categories: Category[] = [
  {id:"windows",name:"Окна",slug:"windows",parentId:null},
  {id:"sills",name:"Подоконники",slug:"sills",parentId:"windows"}
];
function row(overrides: Record<number,unknown> = {}, number=2): SourceRow {
  const values: unknown[] = Array(26).fill(null);
  Object.assign(values,{0:"Окна",1:"10.3 Подоконники",2:"Estera",3:"EST-1",4:"estera-1",5:"Подоконник Estera",6:100,8:"шт.",9:3,17:"Вес: 3 кг; Тип: ПВХ"},overrides);
  return {number,values,formulaColumns:[]};
}
const inspect = (r: SourceRow, products: Existing[] = []) => analyze([r],categories,products)[0];
test("strict numbers preserve missing/invalid values and accept grouped decimal strings",()=>{
  for(const value of [null,true,"","?","м.п.","по запросу","12kg","1 2","-1","Infinity"]) assert.equal(numeric(value),null);
  assert.equal(numeric("1 234,50"),1234.5);
  assert.ok(inspect(row({6:1.5})).issues.includes("INVALID PRICE"));
  assert.ok(inspect(row({9:1.5})).issues.includes("INVALID STOCK"));
  assert.ok(inspect(row({9:2147483648})).issues.includes("INVALID STOCK"));
});
test("no photo is a warning, while missing stock cannot become zero",()=>{
  assert.equal(inspect(row()).action,"CREATE");
  assert.equal(inspect(row()).status,"WARNING");
  const missing = inspect(row({9:null}));
  assert.equal(missing.proposal.stock,null);
  assert.equal(missing.action,"BLOCKED");
});
test("category numbering removed and wrong parent never silently matched",()=>{
  assert.equal(mapCategory("Окна","10.3 Подоконники",categories).status,"MATCHED");
  assert.equal(mapCategory("Двери","Подоконники",categories).status,"NOT FOUND");
  assert.equal(mapCategory("Окна","Подоконники",[...categories,{...categories[1],id:"other"}]).status,"AMBIGUOUS");
});
test("shifted columns, demos, and formulas never create",()=>{
  assert.equal(inspect(row({3:null,4:"ebb-1",5:"EBB-1",6:"Оконный отлив металлический — Белый",7:"Пластконструктор",9:"м.п."})).status,"BLOCKED_COLUMN_SHIFT");
  assert.equal(inspect(row({25:"Пример заполнения"})).status,"DEMO_ROW");
  assert.equal(inspect(row({21:"https://example.com/product"})).action,"BLOCKED");
  const formula = row(); formula.formulaColumns=[6];
  assert.equal(inspect(formula).action,"BLOCKED");
});
test("duplicate keys block all members; proposals are stable and never applied",()=>{
  const result = analyze([row(),row({},3)],categories,[]);
  assert.ok(result.every(r=>r.issues.includes("DUPLICATE SKU") && r.issues.includes("DUPLICATE SLUG")));
  const a=inspect(row({3:null,4:null}));
  assert.equal(a.proposedSku,inspect(row({3:null,4:null},100)).proposedSku);
  assert.equal(a.action,"BLOCKED");
  assert.equal(slugify("Подоконник Estera — Санлайт сатин"),"podokonnik-estera-sanlayt-satin");
});
test("exact identity precedes name; conflicting identities block",()=>{
  const existing: Existing = {id:"p1",sku:"EST-1",slug:"estera-1",name:"Подоконник Estera",brand:"Estera",price:100,oldPrice:null,stock:3,unit:"шт.",categoryId:"sills",description:null};
  assert.equal(inspect(row(),[existing]).action,"EXISTING");
  assert.equal(inspect(row({6:200}),[existing]).action,"UPDATE_CANDIDATE");
  assert.equal(inspect(row({3:"NEW",4:"new"}),[existing]).action,"CREATE");
  assert.equal(inspect(row({3:"NEW"}),[existing]).action,"BLOCKED");
  const conflict = {...existing,id:"p2",sku:"OTHER",slug:"conflict"};
  assert.ok(inspect(row({4:"conflict"}),[existing,conflict]).issues.includes("SKU SLUG IDENTITY CONFLICT"));
});
test("specifications trim and deduplicate; malformed entries warn",()=>{
  const result=inspect(row({17:" Вес : 3 кг ; Вес: 4 кг; : empty; Тип: ; broken"}));
  assert.equal(result.specifications.length,1);
  assert.deepEqual(result.specifications[0],{name:"Вес",value:"3 кг",order:0});
  assert.ok(result.warnings.some(w=>w.startsWith("DUPLICATE SPECIFICATION")));
});

test("cleanup review marker blocks an otherwise valid product; stock provenance survives",()=>{
  const result=inspect(row({25:"[REMARO:MANUAL_REVIEW] [REMARO:STOCK_NOT_PROVIDED]",9:0}));
  assert.equal(result.action,"BLOCKED");
  assert.ok(result.issues.includes("MANUAL REVIEW"));
  assert.ok(result.warnings.includes("STOCK_NOT_PROVIDED"));
});
