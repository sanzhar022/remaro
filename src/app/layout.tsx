import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { absoluteUrl, siteUrl } from "@/lib/site";
import "./globals.css";

const montserrat = Montserrat({ subsets: ["latin", "cyrillic"], variable: "--font-montserrat", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Remaro — строительные материалы", template: "%s | Remaro" },
  description: "Строительные материалы для вашего проекта. Качественные материалы по выгодным ценам с доставкой и самовывозом в Алматы.",
  applicationName: "Remaro",
  metadataBase: new URL(siteUrl),
  openGraph: { type: "website", locale: "ru_KZ", siteName: "Remaro", url: absoluteUrl("/"), title: "Remaro — строительные материалы", description: "Строительные материалы для вашего проекта с доставкой и самовывозом в Алматы." },
  twitter: { card: "summary_large_image", title: "Remaro — строительные материалы", description: "Строительные материалы для вашего проекта с доставкой и самовывозом в Алматы." },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru-KZ">
      <body className={`${montserrat.variable} flex min-h-screen flex-col`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Remaro",
              url: absoluteUrl("/"),
            }).replace(/</g, "\\u003c"),
          }}
        />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
