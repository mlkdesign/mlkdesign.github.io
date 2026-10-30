import type { Metadata } from "next";
import "./fonts.css";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(
    "https://storm-traffic-studio.milka19051995.chatgpt.site",
  ),
  title: "STORM TRAFFIC — команда медиабаинга",
  description:
    "STORM TRAFFIC — сильная команда медиабаинга. Качественный трафик в Gambling, Finance и Crypto, вакансии и реферальная программа.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "STORM TRAFFIC",
    description: "Сильная команда. Качественный трафик. Присоединяйся к нам.",
    type: "website",
    images: [
      { url: "/assets/74-50627_imgImg47771.webp", width: 1600, height: 1600 },
    ],
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/favicon.svg" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "STORM TRAFFIC",
              url: "https://storm-traffic-studio.milka19051995.chatgpt.site",
              email: "work@storm-traffic.com",
            }),
          }}
        />
      </body>
    </html>
  );
}
