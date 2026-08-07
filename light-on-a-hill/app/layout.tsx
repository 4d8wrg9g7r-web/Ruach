import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { ApertureNav } from "@/components/ApertureNav";
import { CustomCursor } from "@/components/CustomCursor";
import { SiteFooter } from "@/components/SiteFooter";
import { JsonLd } from "@/components/JsonLd";
import { localBusinessJsonLd } from "@/lib/seo";
import { SITE } from "@/content/site";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-serif",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} | ${SITE.region} Wedding & Portrait Photographer`,
    template: `%s`,
  },
  description: SITE.tagline,
  applicationName: SITE.name,
  authors: [{ name: SITE.name }],
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: "en_US",
  },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.svg" },
};

// Analytics tag ids, wired from env at deploy time. Absent ⇒ tags simply omitted.
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <head>
        <JsonLd data={localBusinessJsonLd()} />
        {GTM_ID && (
          <script
            // Google Tag Manager loader — only emitted when NEXT_PUBLIC_GTM_ID is set.
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`,
            }}
          />
        )}
      </head>
      <body>
        {GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="gtm"
            />
          </noscript>
        )}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:rounded-full focus:bg-ink focus:px-5 focus:py-2 focus:text-sm focus:text-paper"
        >
          Skip to content
        </a>
        <CustomCursor />
        <ApertureNav />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
