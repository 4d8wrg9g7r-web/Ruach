import { SectionLabel } from "@/components/ui/primitives";
import { EditorialImage } from "@/components/ui/EditorialImage";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";

/**
 * Section 7 — Human Craft (§8). After the futuristic technology, the pacing
 * deliberately changes. Monochrome workshop imagery humanises the brand: the
 * instrument still needs skilled luthiers.
 */
const STAGES = [
  { label: "01 / SANDING", caption: "Contours brought true by hand" },
  { label: "02 / FRETWORK", caption: "Every fret dressed and levelled" },
  { label: "03 / PAINT", caption: "Finishes built in layers" },
  { label: "04 / ASSEMBLY", caption: "Hardware fitted and wired" },
  { label: "05 / INSPECTION", caption: "Nothing leaves Haarlem unchecked" },
];

export function HumanCraft() {
  return (
    <section className="border-t border-graphite-line bg-graphite py-24">
      <div className="shell">
        <SectionLabel index="/ 07">Human Craft</SectionLabel>
        <Reveal>
          <h2 className="mt-6 max-w-3xl font-display text-display-md font-medium leading-[0.92]">
            ENGINEERED DIFFERENTLY.
            <br />
            <span className="text-steel">BUILT BY HAND.</span>
          </h2>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-steel">
            After curing, the structure is still only raw material. A luthier routes, sands, frets,
            finishes, assembles, sets up and inspects every instrument. The science makes the material;
            the craft makes the guitar.
          </p>
        </Reveal>

        <RevealGroup className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {STAGES.map((s, i) => (
            <RevealItem key={s.label}>
              <EditorialImage
                label={s.label}
                caption={s.caption}
                tone="mono"
                seed={i}
                aspect={i === 0 ? "3 / 4" : "3 / 4"}
                className="h-full grayscale"
              />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
