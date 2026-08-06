import type { Metadata } from "next";
import { noIndexMetadata } from "../../../lib/no-index-metadata";

export const metadata: Metadata = noIndexMetadata;

export default function FinishingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
