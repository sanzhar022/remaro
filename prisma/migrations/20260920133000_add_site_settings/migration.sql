CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "shortDescription" TEXT,
    "aboutTitle" TEXT,
    "aboutShortText" TEXT,
    "aboutText" TEXT,
    "phone" TEXT,
    "whatsapp" TEXT,
    "email" TEXT,
    "address" TEXT,
    "city" TEXT,
    "workingHours" TEXT,
    "instagramUrl" TEXT,
    "tiktokUrl" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "SiteSettings_singleton" CHECK ("id" = 'site'),
    CONSTRAINT "SiteSettings_latitude_range" CHECK ("latitude" IS NULL OR ("latitude" >= -90 AND "latitude" <= 90)),
    CONSTRAINT "SiteSettings_longitude_range" CHECK ("longitude" IS NULL OR ("longitude" >= -180 AND "longitude" <= 180))
);

INSERT INTO "SiteSettings" (
    "id", "companyName", "shortDescription", "aboutTitle", "aboutShortText", "aboutText", "city", "updatedAt"
) VALUES (
    'site',
    'Remaro Group',
    'Строительные и отделочные материалы для ремонта и строительства.',
    'Remaro — материалы для строительства и ремонта',
    'Интернет-магазин помогает удобно находить и заказывать товары для ремонта, строительства и благоустройства в Алматы.',
    'Remaro объединяет каталог строительных и отделочных материалов для частных покупателей и бизнеса.',
    'Алматы',
    CURRENT_TIMESTAMP
);
