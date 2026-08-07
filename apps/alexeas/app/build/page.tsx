import type { Metadata } from "next";
import { Suspense } from "react";
import { BuildEntry } from "./build-entry";

export const metadata: Metadata = {
  title: "Build Yours",
  description:
    "Design your own Alexeas guitar or mandolin, step by step — wood, voice, feel, and detail — then send the full specification to the workshop.",
};

export default function BuildPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-warmwhite" />}>
      <BuildEntry />
    </Suspense>
  );
}
