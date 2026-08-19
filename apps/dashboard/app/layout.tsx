import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const SITE_URL = process.env.NEXTAUTH_URL ?? "https://ruachplatform.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Ruach", template: "%s | Ruach" },
  description: "Turn your media library into a conversation.",
  openGraph: {
    siteName: "Ruach",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#b87b38",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
