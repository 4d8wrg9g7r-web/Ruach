import type { Metadata } from "next";
import { GalleryClient } from "./GalleryClient";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "A field of finished Aristides custom builds — chameleon, sparkle, marble and machined-metal finishes across the full range. Find one you want, then build something like it.",
};

export default function GalleryPage() {
  return <GalleryClient />;
}
