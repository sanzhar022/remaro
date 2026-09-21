# REMARO — PRODUCT DATA CLEANUP

CLEANED PRODUCT DATA: READY FOR REVIEW

CLEANED FILE: C:\Users\yerty\OneDrive\Desktop\remaro\reports\product-import\Remaro_products_cleaned.xlsx

| Показатель | Результат |
| --- | ---: |
| Original rows | 1091 |
| Demo excluded | 7 |
| Exact duplicate copies consolidated | 105 |
| Unique products | 979 |
| Column shifts fixed / unresolved | 101 / 0 |
| Unique SKU / duplicate remaining | 979 / 0 |
| Unique slug / duplicate remaining | 979 / 0 |
| Prices available / missing real prices | 734 / 245 |
| Stock provided / STOCK_NOT_PROVIDED | 1 / 978 |
| Categories automatically matched / review, pairs | 100 / 16 |
| Previously NOT FOUND resolved HIGH / total | 78 / 94 |
| Categories automatically matched / review, products | 863 / 116 |
| New category candidates | 3 |
| IMAGE_PENDING | 961 |

## Повторный dry-run существующего импортера

| Показатель | READY | MISSING_PRICE | MANUAL_REVIEW | Все товары |
| --- | ---: | ---: | ---: | ---: |
| TOTAL | 538 | 210 | 231 | 979 |
| READY TO CREATE | 538 | 0 | 0 | 538 |
| BLOCKED | 0 | 210 | 231 | 441 |
| MISSING PRICE | 0 | 210 | 35 | 245 |
| DUPLICATE SKU | 0 | 0 | 0 | 0 |
| DUPLICATE SLUG | 0 | 0 | 0 | 0 |
| INVALID PRICE | 0 | 0 | 0 | 0 |
| INVALID STOCK | 0 | 0 | 0 | 0 |
| COLUMN SHIFT | 0 | 0 | 0 | 0 |
| CATEGORY NOT FOUND, пары | 0 | 0 | 16 | 16 |
| MANUAL REVIEW | 0 | 0 | 231 | 231 |
| IMAGE PENDING | 528 | 210 | 223 | 961 |
| DB SKU / slug conflicts | 0 | 0 | 0 | 0 |

245 отсутствующих цен включают 35 товаров на MANUAL_REVIEW. Цена не подменена нулём.
Все 538 READY имеют импортный stock=0 с STOCK_NOT_PROVIDED: сайт будет считать их недоступными для покупки.
Неизвестный фактический остаток не подтверждён как нулевой; происхождение сохранено в комментариях Excel и аудите.

Все 1091 исходных номера сохранены: 979 записей + 105 точных повторов + 7 демо.
Полные исходные значения и решения: cleanup-audit.json. Список требующих цены: missing-prices.json.
Сопоставление всех 116 пар с confidence и причинами: semantic-category-mapping.md.

Новые категории только предложены: Полотенцесушители (heated-towel-rails → Отопление, 1 товар),
Плиткорезы и комплектующие (tile-cutters → Инструменты, 2 товара),
Лестницы и стремянки (ladders → Инструменты, 1 товар).

## Quality

- Cleanup tests: PASS, 6/6.
- Importer tests: PASS, 8/8.
- npm run lint: PASS.
- npx tsc --noEmit: PASS.
- npm run build: PASS, 431 pages.
- git diff --check: PASS.
- Deterministic cleanup rerun: PASS.
- Original XLSX SHA256 unchanged: PASS.

Добавлены clean-products.ts, clean-products.py, write-cleaned-products.py, test-clean-products.py и PRODUCT-CLEANUP-RUNBOOK.md.
Обновлены npm-команда products:clean, обработка маркеров ручной проверки в импортере и тесты.
Созданы очищенный Excel, аудит, category mapping, список отсутствующих цен и три отдельных dry-run отчёта.

DATABASE CHANGES: NONE

--apply, seed, commit/push не выполнялись. Категории и production PostgreSQL не изменялись.