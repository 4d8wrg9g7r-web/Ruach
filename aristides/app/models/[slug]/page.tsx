import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FAMILIES, familyBySlug } from "@/lib/data/models";
import { ModelPage } from "@/components/models/ModelPage";

export function generateStaticParams() {
  return FAMILIES.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const family = familyBySlug(slug);
  if (!family) return {};
  const from = Math.min(...family.variants.map((v) => v.fromPrice));
  return {
    title: `${family.name} — ${family.tagline}`,
    description: `${family.blurb} Available ${family.variants.map((v) => `${v.strings}-string`).join(", ")}. From €${from}. Hand-built in Haarlem, engineered around Arium.`,
  };
}

export default async function ModelFamilyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const family = familyBySlug(slug);
  if (!family) notFound();

  const from = Math.min(...family.variants.map((v) => v.fromPrice));
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `Aristides ${family.name}`,
    brand: { "@type": "Brand", name: "Aristides Instruments" },
    description: family.description,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "EUR",
      lowPrice: from,
      offerCount: family.variants.length,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <ModelPage family={family} />
    </>
  );
}
