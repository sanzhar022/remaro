"""Deterministic cleanup of source values. No network and no database writes."""
import hashlib
import json
import re
import sys
from collections import defaultdict

def text(v):
    return "" if v is None else str(v).strip()

def norm(v):
    return re.sub(r"\s+", " ", text(v).lower().replace("ё", "е")).strip()

def digest(v):
    return hashlib.sha256(json.dumps(v, ensure_ascii=False, sort_keys=True).encode()).hexdigest()[:16].upper()

def slug(v):
    ru = "абвгдеёжзийклмнопрстуфхцчшщъыьэюя"
    en = ["a","b","v","g","d","e","e","zh","z","i","y","k","l","m","n","o","p","r","s","t","u","f","kh","ts","ch","sh","shch","","y","","e","yu","ya"]
    value = "".join(dict(zip(ru,en)).get(c,c) for c in text(v).lower())
    return re.sub(r"[^a-z0-9]+", "-", value).strip("-")

def number(v):
    if isinstance(v, bool):
        return None
    s = text(v)
    if not re.fullmatch(r"(?:\d+|\d{1,3}(?:[ \u00a0\u202f]\d{3})+)(?:[.,]\d+)?", s):
        return None
    n = float(re.sub(r"[ \u00a0\u202f]", "", s).replace(",", "."))
    return int(n) if n.is_integer() else n

def missing(v):
    return norm(v) in ("", "не указан", "не указано", "нет данных", "n/a", "-", "—", "?")

def recover_shift(values):
    v = list(values)
    # This layout has extra business group and supplier-name fields.
    # Require ALL observed anchors. Unknown fields must remain empty.
    if not (text(v[0]) == "Окна" and re.match(r"10\.\d+\s", text(v[1]))
            and text(v[4]).lower() == text(v[5]).lower()
            and re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._/-]*", text(v[5]))
            and text(v[6]) == text(v[23])
            and number(v[6]) is None and text(v[6])
            and re.fullmatch(r"м\.п\.|шт\.|уп\.|рулон", text(v[9]))
            and text(v[22]).startswith(("https://", "http://"))
            and all(not text(v[i]) for i in [10,11,12,13,14,16,18,19,20])
            and (not text(v[8]) or number(v[8]) is not None)):
        return None
    out = [None] * 26
    for dest, src in {0:0,1:1,2:3,3:5,4:4,5:6,6:8,8:9,14:15,16:17,17:21,21:22,22:7,24:24,25:25}.items():
        out[dest] = v[src]
    return out

def semantic(category, sub, cats, names):
    c, s = norm(category), norm(sub)
    s = re.sub(r"^\d+(?:\.\d+)*[.)]?\s+", "", s)
    exact = {
        "шпаклевки": ("putty","HIGH","Множественное число существующей категории."),
        "плиточный клей": ("tile-adhesive","HIGH","Синоним: клей для плитки."),
        "минеральная вата": ("mineral-wool","HIGH","Точное название; в БД другая родительская ветка."),
        "рулонная гидроизоляция": ("waterproofing","HIGH","Подтип существующей гидроизоляции; рулонный формат сохранён."),
        "газобетонный блок": ("aerated-concrete-blocks","HIGH","Газобетонные блоки соответствуют категории Газоблоки."),
        "труба сантехническая": ("polypropylene-pipes","HIGH","В единственном товаре явно указана труба ПП."),
        "фитинги для труб": ("pipe-fittings","HIGH","Подтип существующей категории Фитинги."),
        "канализационные фитинги": ("pipe-fittings","HIGH","Канализационные соединительные детали — фитинги."),
        "фитинги для канализации": ("pipe-fittings","HIGH","Канализационные соединительные детали — фитинги."),
        "пресс-фитинги": ("pipe-fittings","HIGH","Способ соединения уточняет существующую категорию."),
        "инсталляция": ("installations","HIGH","Единственное число существующей категории."),
        "запорная арматура": ("ball-valves","HIGH","Единственный товар явно является шаровым краном."),
        "герметики": ("silicone-sealants","HIGH","Единственный товар: Силикон белый."),
        "трубы пп": ("polypropylene-pipes","HIGH","ПП — полипропилен, явно указанный в товаре."),
        "керамогранит": ("porcelain-stoneware","HIGH","Точное название существующей категории в ветке напольных покрытий."),
        "утюг сантехнический": ("welding-equipment","HIGH","Название товара: аппарат для сварки пластиковых труб."),
        "бамбуковые панели": ("wall-panels","HIGH","Стеновые панели; материал остаётся в исходном названии."),
        "крепеж для труб": ("clamps-fasteners","MEDIUM","Группа содержит и хомут, и клипсы; общий mapping требует проверки."),
        "канализационные крепления": ("fasteners","MEDIUM","Крепление известно, конструкция недостаточно уточнена."),
        "расходные материалы": ("construction-tapes","MEDIUM","ФУМ-лента уплотнительная; проверить принятую ветку сантехнических расходников."),
        "полотенцесушители": ("heating","LOW","В БД отсутствует специализированная категория полотенцесушителей."),
        "плиткорез": ("tools","LOW","Нет категории плиткорезов; источник смешивает инструмент и насадку."),
        "зажимы": ("tools","LOW","В группе ключ СВП и опрессовочный аппарат — разные классы."),
        "высотное оборудование": ("tools","LOW","Нет специализированной категории лестниц и стремянок."),
        "специальные составы": ("tile-grout","MEDIUM","PREMIX EXTRAHARD: назначение следует подтвердить по товарным данным."),
    }
    result = exact.get(s)
    if result is None:
        if s.startswith("смесители для раковины/кухни"):
            result = ("kitchen-faucets","MEDIUM","Универсальное назначение; выбор одной ветки требует review.")
        elif s.startswith("смесители для раковины"):
            result = ("bathroom-faucets","MEDIUM","В БД нет отдельной категории смесителей для раковины; ванна и раковина не тождественны.")
        elif s.startswith("смесители для кухни"):
            result = ("kitchen-faucets","HIGH","Кухонные смесители; форма излива остаётся характеристикой.")
        elif s.startswith("смесители для ванны"):
            result = ("bathroom-faucets","HIGH","Смесители для ванны соответствуют существующей категории.")
        elif s.startswith("раковины"):
            result = ("sinks","HIGH","Раковины разных способов установки относятся к Раковины и умывальники.")
        elif s.startswith("унитазы"):
            result = ("toilets","HIGH","Унитазы, включая комплекты и модели с биде, сохранены целыми товарами.")
        elif s.startswith("плинтус"):
            result = ("skirting-boards","HIGH","Напольные плинтусы; материал уточняет товар, не требует новой категории.")
        elif c == "3d-панели" or s == "3d-панели":
            result = ("3d-panels","HIGH","Существующая категория 3D-панели.")
        elif s == "пвх-панели":
            result = ("pvc-panels","HIGH","Точное название, исходный родитель был бизнес-группой.")
        elif c == "потолочные панели":
            result = ("ceiling-panels","HIGH","Потолочные панели; изготовитель, акустика и кромка остаются в товаре.")
        elif c == "потолочная плитка":
            result = ("ceiling-tiles","HIGH","Пенополистирольная потолочная плитка — подтип существующей категории.")
        elif c == "затирки":
            result = ("tile-grout","HIGH","Тип связующего уточняет существующую категорию Затирки.")
        elif c == "клей для обоев":
            result = ("wallpaper-adhesive","HIGH","Все товары — обойный клей; назначение по типу обоев сохранено.")
        elif c == "фотообои" or s == "фотообои":
            result = ("photo-wallpaper","HIGH","Тематика изображения не меняет категорию Фотообои.")
        elif c == "обои":
            result = ("wallpaper","HIGH","Виниловые обои на флизелиновой основе входят в Обои.")
        elif c == "молдинги":
            result = ("mouldings","HIGH","Материал, размер и скидка не меняют категорию Молдинги.")
        elif c == "декоративные карнизы":
            result = ("decorative-cornices","HIGH","Карнизы разных материалов входят в существующую категорию.")
        elif c == "люстры":
            result = ("chandeliers","HIGH","Во всех исходных названиях явно указана люстра.") if all("люстр" in norm(n) for n in names) else ("chandeliers","MEDIUM","Источник включает подвесные светильники наряду с люстрами; требуется построчная проверка.")
    if result is None:
        return {"slug":None,"confidence":"LOW","reason":"Нет однозначного соответствия; ручная проверка."}
    target, confidence, reason = result
    if target not in cats:
        return {"slug":None,"confidence":"LOW","reason":"Предложенный slug отсутствует в текущем снимке БД: "+target}
    return {"slug":target,"confidence":confidence,"reason":reason}

def supplier_article(record):
    match = re.search(r"(?:^|;)\s*(?:Артикул поставщика|Артикул)\s*:\s*([^;]+)", text(record["values"][17]), re.I)
    return norm(match.group(1)) if match and not missing(match.group(1)) else None

def distinct_supplier_articles(group):
    codes = [supplier_article(r) for r in group]
    return all(codes) and len(set(codes)) == len(codes)

def clean(payload):
    cats = {c["slug"]:c for c in payload["categories"]}
    by_id = {c["id"]:c for c in payload["categories"]}
    base = {(text(m["excelCategory"]),text(m["excelSubcategory"])):m for m in payload["baselineMappings"]}
    source = payload["rows"]
    pairs = defaultdict(list)
    for row in source:
        pairs[(text(row["values"][0]),text(row["values"][1]))].append(row)
    mappings = []
    mapping_by_pair = {}
    new_candidates = []
    for pair, group in pairs.items():
        old = base.get(pair,{})
        exact = old.get("candidates",[]) if old.get("status") == "MATCHED" else []
        # Baseline comes from fresh TS analyze, never from an old file.
        if len(exact) == 1:
            m = {"slug":exact[0]["slug"],"confidence":"HIGH","reason":"Точное нормализованное соответствие в актуальной иерархии PostgreSQL."}
        else:
            m = semantic(*pair,cats,[text(r["values"][5]) for r in group])
        m.update({"excelCategory":pair[0],"excelSubcategory":pair[1],"productCount":len(group),"originalStatus":old.get("status","NOT FOUND")})
        m["dbCategory"] = cats.get(m["slug"])
        mappings.append(m)
        mapping_by_pair[pair] = m
    for name, target, parent, pair in [
        ("Полотенцесушители","heated-towel-rails","heating",("Сантехника","Полотенцесушители")),
        ("Плиткорезы и комплектующие","tile-cutters","tools",("Оборудование","Плиткорез")),
        ("Лестницы и стремянки","ladders","tools",("Оборудование","Высотное оборудование")),
    ]:
        if pair in pairs and target not in cats:
            new_candidates.append({"status":"NEW_CATEGORY_CANDIDATE","name":name,"slug":target,"parent":cats.get(parent),"productCount":len(pairs[pair]),"reason":mapping_by_pair[pair]["reason"]})
    records, demos, duplicate_audit = [], [], []
    seen = {}
    for source_row in source:
        original = source_row["values"]
        if source_row["number"] in payload["demoRows"]:
            demos.append({"sourceRows":[source_row["number"]],"values":original,"flags":["DEMO_ROW"]})
            continue
        key = json.dumps(original,ensure_ascii=False,sort_keys=True)
        if key in seen:
            seen[key]["sourceRows"].append(source_row["number"])
            duplicate_audit.append({"classification":"EXACT_DUPLICATE","sourceRow":source_row["number"],"retainedSourceRow":seen[key]["sourceRows"][0],"reason":"Все 26 исходных значений совпадают; второй товар не создаётся."})
            continue
        v = [x.strip() if isinstance(x,str) else x for x in original]
        r = {"sourceRows":[source_row["number"]],"original":original,"values":v,"flags":[],"manualReasons":[],"formulaColumns":source_row["formulaColumns"]}
        seen[key]=r
        records.append(r)
        if 992 <= source_row["number"] <= 1092:
            recovered = recover_shift(v)
            if recovered is None:
                r["manualReasons"].append("UNRESOLVED_COLUMN_SHIFT")
            else:
                v = recovered
                r["values"] = v
                r["flags"].append("COLUMN_SHIFT_FIXED")
                r["recoveredBusinessGroup"] = original[2]
        if source_row["formulaColumns"]:
            r["manualReasons"].append("FORMULA_CELL")
        m = mapping_by_pair[(text(original[0]),text(original[1]))]
        r["categoryMapping"] = m
        # Resolve mixed chandelier business group at row level only from explicit name.
        if norm(original[0]) == "люстры" and "люстр" in norm(v[5]):
            m = {**m,"slug":"chandeliers","confidence":"HIGH","reason":"В названии конкретного товара явно указана люстра.","dbCategory":cats.get("chandeliers")}
            r["categoryMapping"]=m
        if m["confidence"] == "HIGH" and m["dbCategory"]:
            target = m["dbCategory"]
            parent = by_id.get(target["parentId"])
            v[0], v[1] = (parent["name"],target["name"]) if parent else (target["name"],None)
        else:
            r["manualReasons"].append("CATEGORY_REVIEW")
        if missing(v[2]):
            v[2] = None
            r["manualReasons"].append("MISSING_BRAND")
        price = number(v[6])
        if price is None:
            if not missing(v[6]):
                r["manualReasons"].append("INVALID_SOURCE_PRICE")
            v[6]=None
            r["flags"].append("MISSING_PRICE")
        elif price > 2147483647 or not isinstance(price,int):
            r["manualReasons"].append("PRICE_REQUIRES_MODEL_DECISION")
        else:
            v[6]=price
        old = number(v[7])
        if text(v[7]) and (old is None or price is None or old<=price or not isinstance(old,int) or old>2147483647):
            r["manualReasons"].append("OLD_PRICE_REVIEW")
        elif old is not None:
            v[7]=old
        stock = number(v[9])
        if stock is None:
            if not missing(v[9]):
                r["manualReasons"].append("INVALID_SOURCE_STOCK")
            v[9]=0
            v[10]="Нет"
            r["flags"].append("STOCK_NOT_PROVIDED")
        elif not isinstance(stock,int) or stock>2147483647:
            r["manualReasons"].append("INVALID_SOURCE_STOCK")
        else:
            v[9]=stock
            v[10]="Да" if stock>0 else "Нет"
            r["flags"].append("STOCK_PROVIDED")
        # Preserve every nonempty specification value. Free text is retained in description.
        specs, fragments = {}, []
        for fragment in text(v[17]).split(";"):
            fragment = fragment.strip()
            if not fragment:
                continue
            if ":" not in fragment:
                fragments.append(fragment)
                continue
            k,val = (s.strip() for s in fragment.split(":",1))
            if not k or not val:
                if k or val:
                    fragments.append(fragment)
                continue
            nk = norm(k)
            if nk in specs:
                if specs[nk][1] != val:
                    r["manualReasons"].append("CONFLICTING_SPECIFICATION: "+k)
                    fragments.append(fragment)
            else:
                specs[nk]=(k,val)
        v[17]="; ".join(k+": "+val for k,val in specs.values()) or None
        if fragments:
            r["unstructuredSpecifications"]=fragments
            v[14]=(text(v[14])+"\nДополнительные сведения из исходных характеристик: "+"; ".join(fragments)).strip()
        if all(missing(v[i]) for i in [18,19,20]):
            r["flags"].append("IMAGE_PENDING")
        r["flags"] = sorted(set(r["flags"]))
    # Identity analysis is performed after recovering the alternate column layout.
    groups=defaultdict(list)
    for r in records:
        v=r["values"]
        groups[text(v[3])].append(r)
    reserved={p["sku"] for p in payload["products"]}
    reserved.update(text(r["values"][3]) for r in records if not missing(r["values"][3]))
    for sku, group in sorted(groups.items()):
        if len(group)==1 and not missing(sku):
            if sku in {p["sku"] for p in payload["products"]}:
                group[0]["manualReasons"].append("EXISTING_DB_SKU")
            continue
        # Same brand and name may be one product with conflicting data: never split automatically.
        identity_groups=defaultdict(list)
        for r in group:
            identity_groups[(norm(r["values"][2]),norm(r["values"][5]))].append(r)
        for r in group:
            v=r["values"]
            identity=[norm(v[i]) for i in [0,1,2,5,8,15,16,17]]
            identity_group=identity_groups[(norm(v[2]),norm(v[5]))]
            ambiguous = len(identity_group)>1 and not distinct_supplier_articles(identity_group)
            if ambiguous:
                r["manualReasons"].append("DUPLICATE_IDENTITY_REVIEW")
            new_sku="REM-"+digest(identity)
            if new_sku in reserved:
                # Only a review record can need a provenance disambiguator.
                r["manualReasons"].append("GENERATED_SKU_COLLISION")
                new_sku="REM-"+digest([identity,r["sourceRows"]])
            reserved.add(new_sku)
            v[3]=new_sku
            classification = "MISSING_OR_PLACEHOLDER_SKU" if missing(sku) else "AMBIGUOUS_IDENTITY" if ambiguous else "DISTINCT_PRODUCTS_OR_VARIANTS"
            duplicate_audit.append({"sourceRows":r["sourceRows"],"oldSku":sku,"newSku":new_sku,"classification":classification,"identity":identity,
                                    "reason":"Стабильный SHA256 от товарной идентичности; сравнивались бренд, название, размер, назначение и характеристики."})
    # Detect same name/brand with different SKUs diagnostically, do not create duplicates.
    identities=defaultdict(list)
    for r in records:
        identities[(norm(r["values"][2]),norm(r["values"][5]))].append(r)
    for identity, group in identities.items():
        if len(group)>1:
            if distinct_supplier_articles(group):
                duplicate_audit.append({"classification":"DISTINCT_SUPPLIER_ARTICLES","sourceRows":[r["sourceRows"] for r in group],
                                        "supplierArticles":[supplier_article(r) for r in group],
                                        "reason":"Одинаковое общее название, но разные явные артикулы поставщика в исходных характеристиках."})
            else:
                for r in group:
                    r["manualReasons"].append("SAME_NAME_IDENTITY_REVIEW")
    db_slugs={p["slug"] for p in payload["products"]}
    slug_groups=defaultdict(list)
    for r in records:
        current=text(r["values"][4])
        candidate=current if re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*",current) else slug(r["values"][5])
        slug_groups[candidate].append(r)
    reserved_slugs=set(db_slugs)
    reserved_slugs.update(k for k,g in slug_groups.items() if k and len(g)==1 and k not in db_slugs)
    for candidate, group in sorted(slug_groups.items()):
        for r in group:
            new_slug=candidate
            if not candidate or len(group)>1 or candidate in db_slugs:
                new_slug=(slug(r["values"][5]) or "product")+"-"+slug(r["values"][3])
                if new_slug in reserved_slugs:
                    new_slug += "-"+digest(r["sourceRows"]).lower()
                    r["manualReasons"].append("SLUG_IDENTITY_REVIEW")
                reserved_slugs.add(new_slug)
            r["values"][4]=new_slug
    for r in records:
        r["manualReasons"]=sorted(set(r["manualReasons"]))
    return {"records":records,"excludedDemo":demos,"duplicateAudit":duplicate_audit,"categoryMappings":mappings,
            "newCategoryCandidates":new_candidates,"originalRows":len(source)}

if __name__ == "__main__":
    print(json.dumps(clean(json.load(sys.stdin)),ensure_ascii=True))
