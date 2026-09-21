import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const SITE_SETTINGS_ID = "site";

export const fallbackSiteSettings = {
  id: SITE_SETTINGS_ID,
  companyName: "Remaro Group",
  shortDescription: "Строительные и отделочные материалы для ремонта и строительства.",
  aboutTitle: null,
  aboutShortText: null,
  aboutText: null,
  phone: null,
  whatsapp: null,
  email: null,
  address: null,
  city: "Алматы",
  workingHours: null,
  instagramUrl: null,
  tiktokUrl: null,
  latitude: null,
  longitude: null,
} as const;

export const getSiteSettings = cache(async () => {
  const settings = await prisma.siteSettings.findUnique({ where: { id: SITE_SETTINGS_ID } });
  return settings ?? fallbackSiteSettings;
});

export function getWhatsAppUrl(value: string | null): string | null {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15 ? `https://wa.me/${digits}` : null;
}

export function getMapUrl(settings: { address: string | null; city: string | null; latitude: number | null; longitude: number | null }) {
  const query = settings.latitude !== null && settings.longitude !== null
    ? `${settings.latitude},${settings.longitude}`
    : [settings.address, settings.city].filter(Boolean).join(", ");
  return query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : null;
}
