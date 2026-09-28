import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const SITE_URL = "https://www.expertpro.app";
const SITE_TITLE = "ExpertPro – Honorarni poslovi u Srbiji";
const SITE_DESCRIPTION = "Platforma za honorarne poslove, usluge i radnike u Srbiji. Povezi se sa firmama, fizičkim licima i agencijama.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | ExpertPro",
  },
  description: SITE_DESCRIPTION,
  keywords: "honorarni posao, radnici, usluge, Srbija, freelance, pomoćni radnici",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "sr_RS",
    url: SITE_URL,
    siteName: "ExpertPro",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ExpertPro",
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  areaServed: "RS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sr">
      <body className={`${inter.className} min-h-full`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
