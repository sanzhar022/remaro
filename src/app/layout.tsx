import type { Metadata } from "next";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { absoluteUrl, siteUrl } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Remaro — строительные материалы", template: "%s | Remaro" },
  description: "Строительные и отделочные материалы Remaro с доставкой и самовывозом в Алматы.",
  applicationName: "Remaro",
  metadataBase: new URL(siteUrl),
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "ru_KZ", siteName: "Remaro", url: absoluteUrl("/"), title: "Remaro — строительные материалы", description: "Материалы для строительства и ремонта в Алматы." },
  twitter: { card: "summary_large_image", title: "Remaro — строительные материалы", description: "Материалы для строительства и ремонта в Алматы." },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru-KZ">
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
