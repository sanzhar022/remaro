import type { Metadata } from "next";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import { getSiteSettings } from "@/lib/site-settings";

export const metadata: Metadata = { title: "Управление сайтом" };

export default async function SettingsPage() {
  const settings = await getSiteSettings();
  return <><h1 className="type-h1">Управление сайтом</h1><p className="mt-2 text-muted">Данные компании, контакты и публичные страницы.</p><SiteSettingsForm initialSettings={settings} /></>;
}
