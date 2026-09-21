import { z } from "zod";

const emptyToNull = (value: unknown) => typeof value === "string" && value.trim() === "" ? null : value;
const optionalText = (max: number) => z.preprocess(emptyToNull, z.string().trim().max(max).nullable());
const optionalEmail = z.preprocess(emptyToNull, z.email("Введите корректный email").max(254).nullable());
const optionalPhone = z.preprocess(emptyToNull, z.string().trim().max(30).regex(/^\+?[\d\s()-]{5,30}$/, "Введите корректный номер").nullable());
const optionalWhatsapp = z.preprocess(emptyToNull, z.string().trim().max(30).refine((value) => {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}, "Введите корректный номер WhatsApp").nullable());

function socialUrl(service: "instagram" | "tiktok") {
  return z.preprocess(emptyToNull, z.url("Введите корректный URL").max(500).refine((value) => {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    return service === "instagram" ? host === "instagram.com" : host === "tiktok.com";
  }, `Введите ссылку на ${service === "instagram" ? "Instagram" : "TikTok"}`).nullable());
}

const coordinate = (min: number, max: number, label: string) => z.preprocess(emptyToNull,
  z.coerce.number({ error: `${label}: введите число` }).min(min, `${label}: минимум ${min}`).max(max, `${label}: максимум ${max}`).nullable(),
);

export const siteSettingsSchema = z.object({
  companyName: z.string().trim().min(1, "Название компании обязательно").max(120),
  shortDescription: optionalText(300),
  phone: optionalPhone,
  whatsapp: optionalWhatsapp,
  email: optionalEmail,
  workingHours: optionalText(300),
  city: optionalText(120),
  address: optionalText(500),
  latitude: coordinate(-90, 90, "Latitude"),
  longitude: coordinate(-180, 180, "Longitude"),
  instagramUrl: socialUrl("instagram"),
  tiktokUrl: socialUrl("tiktok"),
  aboutTitle: optionalText(200),
  aboutShortText: optionalText(600),
  aboutText: optionalText(10_000),
}).superRefine((data, context) => {
  if ((data.latitude === null) !== (data.longitude === null)) {
    context.addIssue({ code: "custom", path: [data.latitude === null ? "latitude" : "longitude"], message: "Укажите обе координаты" });
  }
});

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
