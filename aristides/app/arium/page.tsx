import type { Metadata } from "next";
import { AriumStory } from "@/components/arium/AriumStory";

export const metadata: Metadata = {
  title: "Arium — The Material, Reengineered",
  description:
    "Arium is a proprietary material engineered for sound: a rigid exoskeleton over a resonant core, delivering resonance, sustain and consistency. Research began in 1995; every Aristides is built around it.",
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Arium?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Arium is a proprietary material engineered for sound, built as a rigid exoskeleton over a resonant core. It is designed to deliver strong resonance, long sustain, tonal consistency and structural stability.",
      },
    },
    {
      "@type": "Question",
      name: "Is an Aristides just a molded guitar?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. The cured Arium structure is only the raw material. Every instrument still requires extensive hand luthiery — routing, sanding, fretwork, finishing, assembly, setup and inspection — in Haarlem, The Netherlands.",
      },
    },
    {
      "@type": "Question",
      name: "When did Arium research begin?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Research into the structural and acoustic properties of premium woods began in 1995, leading to the development of Arium and the founding of Aristides Instruments in 2007.",
      },
    },
  ],
};

export default function AriumPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <AriumStory />
    </>
  );
}
