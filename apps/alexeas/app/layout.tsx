import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope, Spline_Sans_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { GrainOverlay } from "@/components/grain-overlay";
import { AtelierFrame } from "@/components/atelier-frame";
import { RevealProvider } from "@/components/reveal-provider";
import { SITE } from "@/lib/site";

// Fraunces (variable, with italics) is the editorial display voice; Manrope the
// UI voice; Spline Sans Mono the archival micro-label / numeral voice.
const serif = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = Spline_Sans_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Alexeas Guitars & Mandolins — Handcrafted Stringed Instruments",
    template: "%s · Alexeas Guitars & Mandolins",
  },
  description:
    "Handcrafted guitars, mandolins, and stringed instruments built individually in the Alexeas workshop. Made slowly. Made deliberately. Made to remain.",
  keywords: [
    "custom acoustic guitars",
    "handmade acoustic guitars",
    "luthier built guitars",
    "boutique acoustic guitars",
    "custom mandolins",
    "handcrafted mandolin",
    "commission acoustic guitar",
    "custom stringed instruments",
    "Alexeas Guitars",
  ],
  authors: [{ name: "James Alexeas" }],
  openGraph: {
    title: "Alexeas Guitars & Mandolins",
    description:
      "Instruments made slowly, deliberately, and by hand — commission your own from the Alexeas workshop.",
    siteName: "Alexeas Guitars & Mandolins",
    type: "website",
    locale: "en_US",
    url: SITE.url,
  },
  twitter: {
    card: "summary_large_image",
    title: "Alexeas Guitars & Mandolins",
    description: "Handcrafted guitars and mandolins, built one at a time.",
  },
  alternates: { canonical: SITE.url },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#241C17",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${mono.variable}`}>
      <body className="font-sans antialiased">
        {/* Mark JS as active before paint so scroll-reveal content is only ever
            hidden when it can actually be revealed (no-JS/crawlers see it all). */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE.organizationSchema) }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-espresso focus:px-4 focus:py-2 focus:text-ivory"
        >
          Skip to content
        </a>
        <GrainOverlay />
        <AtelierFrame />
        <RevealProvider>
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
        </RevealProvider>
      </body>
    </html>
  );
}
