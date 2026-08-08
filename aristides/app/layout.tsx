import type { Metadata } from "next";
import { display, body, mono } from "./fonts";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/layout/PageTransition";
import "./globals.css";

const SITE = "https://aristidesinstruments.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Aristides Instruments — The Instrument, Reengineered",
    template: "%s — Aristides Instruments",
  },
  description:
    "Hand-built in Haarlem, engineered around Arium. Aristides Instruments builds precision electric guitars and basses on a rigid exoskeleton and resonant Arium core — extended range, radical design, extreme customization.",
  keywords: [
    "Aristides",
    "Arium",
    "electric guitar",
    "headless guitar",
    "multiscale guitar",
    "extended range guitar",
    "7 string guitar",
    "8 string guitar",
    "9 string guitar",
    "EverTune",
    "custom guitar",
  ],
  openGraph: {
    type: "website",
    title: "Aristides Instruments — The Instrument, Reengineered",
    description:
      "Engineered around Arium. Hand-built in Haarlem. Extended range, radical design, extreme customization.",
    url: SITE,
    siteName: "Aristides Instruments",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body className="min-h-screen bg-void text-chalk antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-graphite-raised focus:px-4 focus:py-2 focus:text-sm"
        >
          Skip to content
        </a>
        <Header />
        <PageTransition>
          <main id="main">{children}</main>
        </PageTransition>
        <Footer />
      </body>
    </html>
  );
}
