import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ruach",
  description: "Turn your media library into a conversation.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
