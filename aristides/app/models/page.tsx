import type { Metadata } from "next";
import { ModelsFinder } from "@/components/models/ModelsFinder";

export const metadata: Metadata = {
  title: "Models — Find Your Platform",
  description:
    "Compare Aristides platforms: 0 Standard, S Multiscale, H Headless, T Style, STX and S/B Bass. Filter by string count, construction and bridge — 6, 7, 8 and 9-string, multiscale, headless and EverTune.",
};

export default function ModelsPage() {
  return <ModelsFinder />;
}
