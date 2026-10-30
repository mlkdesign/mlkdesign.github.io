import type { Metadata } from "next";
import "./fonts.css";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(
    "https://storm-traffic-studio.milka19051995.chatgpt.site",
  ),
  title: "STORM TRAFFIC — media buying team",
  description:
    "STORM TRAFFIC is a strong media buying team: quality traffic in Gambling, Finance and Crypto, open vacancies and a referral program.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "STORM TRAFFIC",
    description: "A strong team. Quality traffic. Join us.",
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
    <html lang="en">
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
