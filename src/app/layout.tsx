import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import DemoBanner from "@/components/DemoBanner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const DESCRIPTION =
  "Unofficial student concept demo of a digital campus card: student ID, library, mensa balance and Semesterticket in one web app. Not affiliated with Hochschule Rhein-Waal. All data is fictional.";

export const metadata: Metadata = {
  title: "UniCard (unofficial demo) | Student concept",
  description: DESCRIPTION,
  keywords: ["UniCard", "student card concept", "demo", "Mensa", "Library", "Deutschlandticket", "NFC"],
  applicationName: "UniCard Demo",
  authors: [{ name: "Mohammad Saad Ibna Inan", url: "https://www.saadibnainan.tech" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "UniCard Demo",
  },
  openGraph: {
    type: "website",
    locale: "de_DE",
    alternateLocale: "en_GB",
    title: "UniCard (unofficial demo)",
    description: DESCRIPTION,
    siteName: "UniCard Demo",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Zoom intentionally left enabled (no maximumScale / userScalable:false) —
  // disabling pinch-zoom is a WCAG 1.4.4 failure.
  viewportFit: "cover",
  themeColor: "#28255A",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body style={{ height: "100%" }}>
        <DemoBanner />
        {children}
      </body>
    </html>
  );
}
