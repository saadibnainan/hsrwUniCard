import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HSRW UniCard | Rhine-Waal University of Applied Sciences",
  description:
    "Your unified digital student identity card for Hochschule Rhein-Waal — Deutschlandsemesterticket, Mensa smart wallet, Library pass, and NFC access in one secure app.",
  keywords: ["HSRW", "Hochschule Rhein-Waal", "student card", "UniCard", "Mensa", "Library", "Deutschlandticket", "NFC"],
  applicationName: "HSRW UniCard",
  authors: [{ name: "Hochschule Rhein-Waal" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "HSRW UniCard",
  },
  openGraph: {
    type: "website",
    locale: "de_DE",
    alternateLocale: "en_GB",
    title: "HSRW UniCard",
    description: "Unified digital student card for Rhine-Waal University.",
    siteName: "HSRW UniCard Portal",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#28255A",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body style={{ height: "100%" }}>{children}</body>
    </html>
  );
}
