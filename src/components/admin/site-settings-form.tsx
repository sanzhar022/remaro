"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Settings = {
  companyName: string; shortDescription: string | null; phone: string | null; whatsapp: string | null; email: string | null;
  workingHours: string | null; city: string | null; address: string | null; latitude: number | null; longitude: number | null;
  instagramUrl: string | null; tiktokUrl: string | null; aboutTitle: string | null; aboutShortText: string | null; aboutText: string | null;
};
type Errors = Record<string, string[] | undefined>;

const fields: Array<[keyof Settings, string, string, string?]> = [
  ["companyName", "Название компании", "text", "Remaro"], ["shortDescription", "Краткое описание", "textarea"],
  ["phone", "Телефон", "tel"], ["whatsapp", "WhatsApp", "tel"], ["email", "Email", "email"], ["workingHours", "Режим работы", "text"],
  ["city", "Город", "text"], ["address", "Полный адрес", "text"], ["latitude", "Latitude", "number"], ["longitude", "Longitude", "number"],
  ["instagramUrl", "Instagram URL", "url"], ["tiktokUrl", "TikTok URL", "url"],
  ["aboutTitle", "Заголовок", "text"], ["aboutShortText", "Краткий текст", "textarea"], ["aboutText", "Основной текст", "textarea"],
];
const sections = [["Компания", 0, 2], ["Контакты", 2, 6], ["Адрес магазина", 6, 10], ["Социальные сети", 10, 12], ["О компании", 12, 15]] as const;
const normalize = (settings: Settings) => Object.fromEntries(Object.entries(settings).map(([key, value]) => [key, value ?? ""])) as Record<keyof Settings, string | number>;
function getPreviewMapUrl(settings: { address: string | null; city: string | null; latitude: number | null; longitude: number | null }) {
  const query = settings.latitude !== null && settings.longitude !== null ? `${settings.latitude},${settings.longitude}` : [settings.address, settings.city].filter(Boolean).join(", ");
  return query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : null;
}

export function SiteSettingsForm({ initialSettings }: { initialSettings: Settings }) {
  const initial = useMemo(() => normalize(initialSettings), [initialSettings]);
  const [values, setValues] = useState(initial); const [saved, setSaved] = useState(initial); const [errors, setErrors] = useState<Errors>({});
  const [pending, setPending] = useState(false); const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const dirty = JSON.stringify(values) !== JSON.stringify(saved);
  useEffect(() => { const warn = (event: BeforeUnloadEvent) => { if (dirty) event.preventDefault(); }; window.addEventListener("beforeunload", warn); return () => window.removeEventListener("beforeunload", warn); }, [dirty]);
  useEffect(() => {
    if (!dirty) return;
    const confirmNavigation = (event: MouseEvent) => {
      const link = (event.target as HTMLElement).closest("a");
      if (!link || link.target === "_blank" || window.confirm("Уйти со страницы? Несохранённые изменения будут потеряны.")) return;
      event.preventDefault(); event.stopPropagation();
    };
    document.addEventListener("click", confirmNavigation, true);
    return () => document.removeEventListener("click", confirmNavigation, true);
  }, [dirty]);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setPending(true); setNotice(null); setErrors({});
    try {
      const response = await fetch("/api/admin/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const data = await response.json();
      if (!response.ok) { setErrors(data.fieldErrors ?? {}); setNotice({ type: "error", text: data.error ?? "Не удалось сохранить настройки" }); return; }
      const next = normalize(data.settings); setValues(next); setSaved(next); setNotice({ type: "success", text: "Настройки сохранены" });
    } catch { setNotice({ type: "error", text: "Не удалось сохранить настройки" }); } finally { setPending(false); }
  }

  const mapUrl = getPreviewMapUrl({ address: String(values.address || "") || null, city: String(values.city || "") || null, latitude: values.latitude === "" ? null : Number(values.latitude), longitude: values.longitude === "" ? null : Number(values.longitude) });
  return <form onSubmit={submit} className="mt-8 space-y-6">
    {sections.map(([title, start, end]) => <section key={title} className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-sm)] sm:p-7"><h2 className="type-h2">{title}</h2><div className="mt-5 grid gap-5 md:grid-cols-2">{fields.slice(start, end).map(([name, label, type, placeholder]) => {
      const error = errors[name]?.[0]; const textarea = type === "textarea";
      return <label key={name} className={textarea ? "md:col-span-2" : ""}><span className="mb-1.5 block text-sm font-semibold">{label}</span>{textarea ? <textarea name={name} rows={name === "aboutText" ? 8 : 3} value={values[name]} disabled={pending} onChange={(e) => setValues((old) => ({ ...old, [name]: e.target.value }))} className={`w-full rounded-[var(--radius-md)] border bg-surface px-4 py-3 outline-none focus:border-primary focus:ring-3 focus:ring-primary/15 ${error ? "border-destructive" : "border-border"}`} /> : <Input name={name} type={type} step={type === "number" ? "any" : undefined} placeholder={placeholder} value={values[name]} disabled={pending} error={Boolean(error)} onChange={(e) => setValues((old) => ({ ...old, [name]: e.target.value }))} />}{error && <span role="alert" className="mt-1 block text-sm text-destructive">{error}</span>}</label>;
    })}</div>{title === "Адрес магазина" && mapUrl && <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex font-semibold text-primary underline">Открыть на карте</a>}</section>)}
    {notice && <p role="status" className={`rounded-md p-4 text-sm ${notice.type === "success" ? "bg-green-50 text-success" : "bg-red-50 text-destructive"}`}>{notice.text}</p>}
    <div className="sticky bottom-3 flex flex-wrap gap-3 rounded-lg border border-border bg-surface/95 p-4 shadow-lg backdrop-blur"><Button type="submit" disabled={pending || !dirty}>{pending ? "Сохраняем..." : "Сохранить изменения"}</Button><Button type="button" variant="outline" disabled={pending || !dirty} onClick={() => { setValues(saved); setErrors({}); setNotice(null); }}>Отменить изменения</Button>{dirty && <span className="self-center text-sm text-muted">Есть несохранённые изменения</span>}</div>
  </form>;
}
