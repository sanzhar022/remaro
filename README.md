# Remaro Group

Интернет-магазин строительных и отделочных материалов для частных покупателей и бизнеса в Алматы. Проект включает публичный каталог, поиск, корзину, избранное, оформление заказов, личный кабинет и административную панель.

> README актуализирован по фактическому коду на 5 сентября 2026 года. Он описывает реализованное поведение, а не планируемые функции.

## Возможности и статус

| Область | Реализовано | Ограничения |
| --- | --- | --- |
| Каталог | Иерархия категорий из PostgreSQL, страницы категорий и товаров | На витрине нет пагинации |
| Поиск | Имя, бренд, SKU и описания; бренд, цена, наличие, рейтинг, сортировка | Фильтрация выполняется приложением после чтения выборки |
| Корзина | Zustand + `localStorage`, количества и итоговая сумма | Не синхронизируется между устройствами |
| Избранное | Локальные ID и загрузка через API | Не более 50 ID за запрос |
| Checkout | Гостевой/авторизованный заказ, серверная проверка цен и остатков | Онлайн-оплата не подключена; доставка согласуется менеджером |
| Аккаунт | Профиль, история и детали собственных заказов | Нет смены пароля, адресной книги и верификации email |
| Админ-панель | Товары, категории, изображения, заказы и статусы | Нет управления пользователями и CMS |
| SEO | Metadata, canonical, Open Graph, sitemap, robots, JSON-LD | Нужен production crawl и проверка контента |

## Стек

- Next.js 16.3.2 (App Router, Server Components, Server Actions).
- React / React DOM 19.2.8, TypeScript 5.9.3 strict.
- Tailwind CSS 4, PostCSS, Lucide React.
- PostgreSQL, Prisma ORM 7.9.1 и `@prisma/adapter-pg`.
- Auth.js / NextAuth 5 beta, Credentials provider, Prisma adapter, JWT sessions.
- Zustand 5, React Hook Form, Zod.
- Cloudinary для загружаемых изображений.
- Upstash Redis для production rate limiting.
- ESLint 9 с правилами Next.js и TypeScript.

Версии зафиксированы в `package-lock.json`; используйте `npm ci`.

## Архитектура и источники данных

```text
Браузер
  ├─ App Router pages / Server Components
  ├─ Client components (Zustand, формы)
  └─ Route Handlers / Server Actions
       ├─ Prisma → PostgreSQL
       ├─ Auth.js → JWT + данные пользователя
       ├─ Cloudinary → изображения
       └─ Upstash → rate limits
```

| Путь | Назначение |
| --- | --- |
| `src/app` | Страницы, layouts, API, sitemap и robots |
| `src/components` | Витрина, формы, аккаунт и admin UI |
| `src/lib` | Доступ к данным, auth, security, env и бизнес-логика |
| `src/data` | Canonical category definitions и development seed data |
| `src/generated/prisma` | Сгенерированный Prisma Client |
| `prisma/schema.prisma` | Схема БД |
| `prisma/migrations` | 8 версионированных миграций |
| `public/images/categories` | Локальные изображения категорий |

Runtime-категории и товары читаются только из PostgreSQL через Prisma. `src/data/catalog-categories.ts` — канонический список для отдельной sync-команды, не runtime fallback. `src/data/categories.ts` и `src/data/products.ts` используются отдельным development seed. Наличие нескольких статических источников создаёт риск расхождения: перед seed/sync всегда проверяйте целевую БД и diff.

Корзина хранится под ключом `remaro-cart`, избранное — `remaro-favorites`. Широкого Next cache для каталога нет; `cache()` применяется для request memoization карточки товара.

## Маршруты

В проекте 26 page routes и 7 API route handlers.

### Публичные страницы

| URL | Назначение |
| --- | --- |
| `/` | Главная |
| `/catalog` | Корневые категории |
| `/category/[slug]` | Категория, потомки и товары; неизвестный slug вызывает `notFound()` |
| `/product/[slug]` | Карточка товара |
| `/search` | Поиск, фильтры и сортировка |
| `/cart`, `/favorites`, `/checkout` | Покупательский сценарий |
| `/order-success/[orderNumber]` | Результат заказа с проверкой владельца/access token |
| `/login`, `/register` | Вход и регистрация |
| `/about`, `/contacts`, `/delivery` | Информационные страницы |

### Аккаунт и админ-панель

- `/account`, `/account/orders`, `/account/orders/[orderNumber]` требуют авторизации.
- `/admin` содержит сводку.
- `/admin/products`, `/new`, `/[id]/edit` управляют товарами, характеристиками и галереями.
- `/admin/categories`, `/new`, `/[id]/edit` управляют иерархией и изображениями.
- `/admin/orders`, `/[orderNumber]` управляют статусами, доставкой и tracking.
- Гость перенаправляется на вход; авторизованный не-ADMIN получает 404. Роль повторно проверяется на сервере.

### API

| Метод и URL | Назначение | Защита |
| --- | --- | --- |
| `GET /api/health` | Состояние приложения и `SELECT 1` | Только общий статус |
| `POST /api/auth/register` | Регистрация | Zod, bcrypt, origin, rate limit |
| `GET/POST /api/auth/[...nextauth]` | Auth.js | Auth.js config |
| `POST /api/orders` | Создание заказа | Zod, origin, rate limit, transaction |
| `GET /api/products?ids=...` | До 50 товаров избранного | Публичный read-only |
| `POST /api/admin/uploads` | Upload в Cloudinary | ADMIN, origin, signature/MIME, 5 МБ, rate limit |
| `DELETE/PATCH /api/admin/images` | Удаление/порядок изображений | ADMIN, origin |

Публичного API категорий нет.

## Данные каталога

Схема содержит 10 моделей: `Category`, `Product`, `ProductImage`, `ProductSpecification`, `User`, `Account`, `Session`, `VerificationToken`, `Order`, `OrderItem`. Перечисления: `UserRole`, `OrderStatus`, `DeliveryMethod`, `PaymentMethod`, `PaymentStatus`, `DeliveryStatus`.

Ключевые гарантии:

- уникальные category/product slug, SKU, order number, access token и session token;
- самоссылочная иерархия категорий;
- изображения и характеристики каскадно удаляются с товаром;
- позиции каскадно удаляются с заказом, ссылка на товар при его удалении становится `NULL`;
- удаление пользователя оставляет заказ, переводя `userId` в `NULL`;
- индексы покрывают иерархию, каталог и основные выборки заказов.

`/category/[slug]` получает категорию из PostgreSQL, строит множество ID самой категории и всех потомков. Параметры витрины: `search`, повторяемый `brand`, `minPrice`, `maxPrice`, `inStock=true`, `rating` (0–5), `sort=popular|price-asc|price-desc|rating|newest`.

Изображение категории выбирается так:

1. mapping из `src/lib/category-images.ts` (261 запись на момент аудита);
2. `Category.image` из БД/Cloudinary;
3. SVG/Lucide fallback.

Карточки используют `next/image`. У товара допускается до 8 изображений. Upload проверяет JPEG/PNG/WebP MIME и сигнатуру, непустой файл и лимит 5 МБ.

`src/data/catalog-categories.ts` содержит 371 определение. `npm run db:sync-categories` — dry run; только явный `--apply` изменяет БД.

## Заказы и оплата

Сервер повторно загружает товары, цены и остатки: клиентской сумме не доверяет. Создание идёт в `SERIALIZABLE` transaction, атомарно уменьшает остатки и повторяется при допустимых конфликтах Prisma. Гостевой заказ доступен по криптографическому access token, авторизованный пользователь — только как владелец. При отмене администратором резерв возвращается ровно один раз.

В модели есть `CARD`, `KASPI`, `CASH`, но фактически активна оплата при получении. Реальный payment provider и webhook отсутствуют; `PAYMENTS_ENABLED` сам по себе онлайн-оплату не реализует. Стоимость доставки сейчас равна нулю, срок и детали подтверждает менеджер.

## Аутентификация

- Credentials по email/паролю, bcrypt cost 12.
- JWT session с `id` и `role`; роли `USER` и `ADMIN`.
- Registration и login rate-limited.
- ADMIN назначается доверенной локальной командой:

```bash
npm run db:make-admin -- user@example.com
```

OAuth, MFA, password reset/change и email verification не реализованы.

## Безопасность

Есть server-side role checks, Zod validation, same-origin checks, серверная верификация заказа, upload validation, CSP и заголовки `nosniff`, referrer/permissions policy, frame deny. В production Upstash limiter работает fail closed; development использует in-memory fallback.

| Операция | Лимит |
| --- | --- |
| Вход по IP | 10 / 10 минут |
| Вход по аккаунту | 20 / 10 минут |
| Регистрация | 5 / час |
| Заказ | 8 / 15 минут |
| Upload | 30 / 10 минут |

`DELETE/PATCH /api/admin/images` не имеют отдельного rate limit. CSP допускает `unsafe-inline`, а development — `unsafe-eval`. Origin checks допускают отсутствие `Origin`; proxy/cookie configuration требует отдельной production-проверки.

### Критично перед production

В отслеживаемом `.env.example` обнаружены заполненные реквизиты Upstash. Значения намеренно здесь не приводятся.

1. Немедленно отозвать/ротировать соответствующий token и endpoint при необходимости.
2. Оставить в `.env.example` только пустые шаблоны.
3. Проверить Git history, forks, CI logs и артефакты.
4. Хранить реальные значения только в локальном `.env` и secret storage платформы.

## Переменные окружения

| Имя | Требование | Назначение |
| --- | --- | --- |
| `DATABASE_URL` | Обязательно | PostgreSQL connection string |
| `AUTH_SECRET` | Обязательно | Auth.js secret |
| `CLOUDINARY_CLOUD_NAME` | Обязательно | Cloudinary cloud |
| `CLOUDINARY_API_KEY` | Обязательно | Серверный API key |
| `CLOUDINARY_API_SECRET` | Обязательно | Серверный secret |
| `PAYMENTS_ENABLED` | Default `false` | Feature flag; провайдера пока нет |
| `NEXT_PUBLIC_SITE_URL` | Production | Публичный HTTPS origin для metadata |
| `UPSTASH_REDIS_REST_URL` | Production | Rate limiter URL |
| `UPSTASH_REDIS_REST_TOKEN` | Production | Rate limiter secret |

Перед копированием `.env.example` убедитесь, что он очищен. Не добавляйте `NEXT_PUBLIC_` к серверным секретам.

## Локальный запуск

Нужны поддерживаемая Node.js LTS, npm и PostgreSQL. Cloudinary требуется для upload из admin.

```bash
npm ci
npm run db:generate
npm run db:migrate
npm run dev
```

Перед командами создайте `.env` с локальными/тестовыми значениями. Откройте `http://localhost:3000`. Seed и category sync не входят в обычный запуск, потому что изменяют данные.

## Команды

| Команда | Назначение |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Сборка / production server |
| `npm run lint` | ESLint |
| `npm run db:generate` | Prisma Client |
| `npm run db:migrate` | Development migration |
| `npm run db:migrate:deploy` | Применение готовых migrations |
| `npm run db:seed` | Development seed; меняет данные |
| `npm run db:sync-categories` | Dry-run sync |
| `npm run db:sync-categories -- --apply` | Применить sync; меняет данные |
| `npm run db:studio` | Prisma Studio |
| `npm run db:make-admin -- <email>` | Назначить ADMIN существующему user |

Не запускайте `migrate dev`, `db push`, seed или sync `--apply` в production build.

## Развёртывание

Проект совместим со стандартным Next.js/Vercel deployment, но CI/CD workflow и `vercel.json` не обнаружены; автоматический deploy репозиторием не подтверждён.

```bash
npm ci
npm run db:generate
npm run lint
npx tsc --noEmit
npm run db:migrate:deploy
npm run build
```

Production env храните в secret storage, задайте HTTPS `NEXT_PUBLIC_SITE_URL`, применяйте migrations отдельным контролируемым release-шагом и не запускайте их конкурентно из serverless builds. После deploy проверьте `/api/health`, auth, каталог, тестовый заказ и admin access.

## Тестирование и качество

Unit, integration и E2E тестов не обнаружено (`product-specs.tsx` — UI-компонент). Минимальный quality gate:

```bash
npm run lint
npx tsc --noEmit
npm run build
git diff --check
```

Smoke-test должен покрывать каталог/404, поиск, товар, persist корзины/избранного, регистрацию/вход, права USER/ADMIN, checkout и access token, отмену с однократным возвратом остатка, изображения, sitemap/robots/metadata и mobile/desktop states.

## Риски и план развития

### P0 — до публичного запуска

- Ротировать утёкшие credentials и очистить `.env.example`/историю распространения.
- Заполнить и юридически проверить контакты, адрес, БИН, реквизиты, доставку/возврат и privacy: часть company data сейчас отсутствует.
- Настроить production Upstash, backup/restore PostgreSQL, monitoring и alerts.
- Не включать online payment без provider, signed webhook, проверки суммы/валюты и idempotency.

### P1 — надёжность

- Добавить unit/integration/E2E тесты заказов, остатков, auth и permissions и CI quality gate.
- Устранить несколько источников category definitions либо автоматически проверять согласованность.
- Перенести search/filter/pagination крупного каталога в PostgreSQL.
- Добавить rate limit/audit log admin mutations, structured logs и error tracking.
- Усилить CSP и проверить origin/proxy/cookie модель.

### P2 — продукт и SEO

- Реализовать оплату и доставочные тарифы либо убрать неактивные варианты.
- Добавить password recovery, email verification, MFA admin и session management.
- Добавить отзывы, сравнение, адресную книгу и синхронизацию корзины.
- Провести production crawl canonical/Open Graph/sitemap/JSON-LD.
- Добавить analytics с корректным privacy/cookie flow; интеграция аналитики не обнаружена.

## Границы аудита

Аудит выполнен статически по репозиторию и локальной конфигурации. Он не подтверждает фактические production-данные PostgreSQL, настройки Cloudinary/Upstash/Vercel, DNS, backups или трафик. Секреты и значения credentials в README не копировались.
