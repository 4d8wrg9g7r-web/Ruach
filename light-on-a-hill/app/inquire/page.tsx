import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { InquiryWizard } from "@/components/InquiryWizard";

export const metadata: Metadata = buildMetadata({
  title: "Inquire | Light on a Hill Photography",
  description:
    "Start your inquiry with Light on a Hill Photography. Tell us what you're imagining — weddings, couples, families, and portraits in North Carolina and beyond.",
  path: "/inquire",
  image: "weddingDance",
});

export default function InquirePage() {
  return (
    <div className="pt-16">
      <InquiryWizard />
    </div>
  );
}
