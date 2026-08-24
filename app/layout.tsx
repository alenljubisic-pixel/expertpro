import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ExpertPro – Honorarni poslovi u Srbiji",
  description: "Platforma za honorarne poslove, usluge i radnike u Srbiji. Povezi se sa firmama, fizičkim licima i agencijama.",
  keywords: "honorarni posao, radnici, usluge, Srbija, freelance, pomoćni radnici",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sr">
      <body className={`${inter.className} min-h-full`}>{children}</body>
    </html>
  );
}
