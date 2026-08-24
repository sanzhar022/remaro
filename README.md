# Remaro

Интернет-магазин строительных материалов на Next.js, TypeScript, Tailwind CSS, PostgreSQL и Prisma ORM.

## Database setup

1. Создайте локальный файл окружения:

   ```bash
   cp .env.example .env
   ```

2. Укажите реальный PostgreSQL `DATABASE_URL` в `.env`.

3. Подготовьте базу и запустите проект:

   ```bash
   npm install
   npm run db:generate
   npm run db:migrate -- --name init_catalog
   npm run db:seed
   npm run dev
   ```

Prisma Studio запускается командой:

```bash
npm run db:studio
```

Seed запускается только вручную. Он использует стабильные ID и повторяемые `upsert`, поэтому не создаёт дубликаты каталога.

## Orders

Checkout создаёт `Order` и `OrderItem` в PostgreSQL через `POST /api/orders`. Цены и остатки проверяются на сервере по актуальным данным каталога. Гостевой заказ доступен на странице подтверждения только по криптографическому access token, а авторизованные пользователи видят собственную историю в `/account/orders`.

## Admin

Защищённая панель доступна по `/admin` только пользователям с ролью `ADMIN`. Повысить существующего пользователя можно локальной CLI-командой `npm run db:make-admin -- user@example.com`. Админка управляет товарами, характеристиками, категориями и статусами заказов; каждая операция записи повторно проверяет роль на сервере.

## Cloudinary images

Изображения загружаются сервером в Cloudinary после проверки роли ADMIN, MIME-типа и лимита 5 МБ. Для запуска укажите `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` и `CLOUDINARY_API_SECRET` только в `.env`. Товары используют упорядоченные записи `ProductImage` (до 8), категории хранят URL и Cloudinary public ID.

## Production readiness

Требования: поддерживаемая Node.js LTS, PostgreSQL/Neon, Cloudinary и все переменные из `.env.example`. `NEXT_PUBLIC_SITE_URL` должен содержать публичный HTTPS URL сайта. Сервер валидирует обязательные env через Zod и завершает запуск без вывода значений, если конфигурация неполна.

Локальный запуск:

```bash
npm install
npx prisma generate
npm run db:migrate -- --name change_name
npm run dev
```

Seed предназначен только для development и запускается явно командой `npm run db:seed`. Для production никогда не используйте `prisma migrate dev`; применяйте уже созданные миграции:

```bash
npm ci
npx prisma generate
npm run db:migrate:deploy
npm run build
npm start
```

Для Vercel добавьте production env в настройках проекта, используйте pooled Neon `DATABASE_URL`, выполните `prisma migrate deploy` отдельным release/deploy шагом и оставьте стандартную build-команду `npm run build`. Реальный deployment этим репозиторием автоматически не выполняется.

Cloudinary credentials доступны только серверу. `PAYMENTS_ENABLED=false` оставляет CARD/KASPI недоступными до появления реального подписанного provider/webhook flow. Будущий webhook обязан проверять signature, reference, сумму, валюту KZT и idempotency.

Создание администратора выполняется только доверенной CLI-командой:

```bash
npm run db:make-admin -- user@example.com
```

Rate-limit API подготовлен как интерфейс с честным no-op fallback. Перед публичным production-трафиком подключите distributed Redis/Upstash adapter; in-memory limiter для serverless намеренно не используется.

### Known security advisory

`npm audit` сообщает о 3 high vulnerabilities в `deepmerge-ts` через `prisma -> @prisma/config`. Автоматическое исправление требует `npm audit fix --force` и несовместимого downgrade Prisma, поэтому оно не применяется. Обновление следует выполнить после появления совместимого исправления в текущей Prisma-линейке.
