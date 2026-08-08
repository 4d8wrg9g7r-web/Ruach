import { Hero } from "@/components/home/Hero";
import { AriumMoment } from "@/components/home/AriumMoment";
import { ModelsScroller } from "@/components/home/ModelsScroller";
import { Performance } from "@/components/home/Performance";
import { ExtendedRange } from "@/components/home/ExtendedRange";
import { FinishLab } from "@/components/home/FinishLab";
import { HumanCraft } from "@/components/home/HumanCraft";
import { CustomBuilds } from "@/components/home/CustomBuilds";
import { ArtistsStrip } from "@/components/home/ArtistsStrip";
import { FinalCTA } from "@/components/home/FinalCTA";

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Aristides Instruments",
  url: "https://aristidesinstruments.com/",
  description:
    "Hand-built electric guitars and basses engineered around Arium — a rigid exoskeleton over a resonant core. Built in Haarlem, The Netherlands.",
  foundingDate: "2007",
  location: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: "Haarlem", addressCountry: "NL" } },
};

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      <Hero />
      <AriumMoment />
      <ModelsScroller />
      <Performance />
      <ExtendedRange />
      <FinishLab />
      <HumanCraft />
      <CustomBuilds />
      <ArtistsStrip />
      <FinalCTA />
    </>
  );
}
