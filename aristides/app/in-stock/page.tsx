import type { Metadata } from "next";
import { CTAButton, SectionLabel, ModelBadge, TechSpec, Divider } from "@/components/ui/primitives";
import { GuitarVisual } from "@/components/visual/GuitarVisual";
import { Reveal } from "@/components/ui/Reveal";
import { finishById } from "@/lib/data/finishes";
import { formatEUR } from "@/lib/build";
import type { Construction } from "@/lib/data/models";
import { NewsletterSignup } from "./NewsletterSignup";

export const metadata: Metadata = {
  title: "In Stock",
  description:
    "Ready-to-ship Aristides instruments. Finished, set up and waiting — each one a single object, gone once it ships. When the shelf is empty, the next one is yours to build.",
};

/**
 * §27 — In Stock. A ready-to-ship instrument is not a listing; it is a finished
 * object that happens to exist right now. Each is presented large, one per row,
 * photography-scale. The empty state refuses to be a dead shop: it points at the
 * configurator and captures intent instead.
 */

interface StockItem {
  code: string;
  family: string;
  construction: Construction;
  strings: number;
  scale: string;
  finishId: string;
  bridge: string;
  pickups: string;
  hardware: string;
  hardwareColor: string;
  price: number;
  note: string;
}

const STOCK: StockItem[] = [
  {
    code: "STX7 S",
    family: "STX Multiscale",
    construction: "offset",
    strings: 7,
    scale: '25.5–27"',
    finishId: "cham-purple-red",
    bridge: "Multiscale EverTune F-model",
    pickups: "Bare Knuckle Aftermath",
    hardware: "Black",
    hardwareColor: "black",
    price: 4400,
    note: "The chameleon. Purple through the body, red at the horns, never the same twice under stage light.",
  },
  {
    code: "H/08",
    family: "Headless",
    construction: "headless",
    strings: 8,
    scale: '27"',
    finishId: "sparkle-galactic",
    bridge: "Hantug Headless",
    pickups: "Fishman Fluence Modern",
    hardware: "Hybrid",
    hardwareColor: "hybrid",
    price: 3900,
    note: "Eight strings, no headstock, perfect neutral balance. Deep-space flake over graphite.",
  },
  {
    code: "060",
    family: "Standard",
    construction: "standard",
    strings: 6,
    scale: '25.5"',
    finishId: "metal-worn-steel",
    bridge: "Hipshot Fixed .175",
    pickups: "Seymour Duncan Pegasus / Sentient",
    hardware: "Chrome",
    hardwareColor: "chrome",
    price: 3200,
    note: "The reference platform, dressed in brushed steel. A sweep of reflection follows the room.",
  },
  {
    code: "T/0",
    family: "T Style",
    construction: "traditional",
    strings: 6,
    scale: '25.5"',
    finishId: "gold-gloss",
    bridge: "EverTune F-model",
    pickups: "Lollar Imperial",
    hardware: "Gold",
    hardwareColor: "gold",
    price: 2900,
    note: "A classic silhouette on Arium. Deep gold gloss, twenty-two frets, timeless feel.",
  },
  {
    code: "S/B5",
    family: "S/B Bass",
    construction: "bass",
    strings: 5,
    scale: '34–35"',
    finishId: "aqua-green",
    bridge: "Hipshot A-style",
    pickups: "Aguilar Dual Soapbar",
    hardware: "Black",
    hardwareColor: "black",
    price: 3400,
    note: "Five strings of low-frequency clarity. Satin aqua, built for the bottom.",
  },
];

function StockRow({ item, index }: { item: StockItem; index: number }) {
  const finish = finishById(item.finishId);
  const tint = finish?.tint ?? [138, 143, 152];
  const flip = index % 2 === 1;

  return (
    <Reveal
      as="article"
      className="border-t border-graphite-line py-16 first:border-t-0 lg:py-24"
    >
      <div
        className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${flip ? "lg:[&>*:first-child]:order-2" : ""}`}
      >
        {/* --- Instrument, photography-scale ------------------------- */}
        <div
          className="instrument-ambient relative flex h-[440px] items-center justify-center overflow-hidden rounded-sm border border-graphite-line bg-graphite sm:h-[560px]"
          style={{ ["--instrument-tint" as string]: tint.join(",") }}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(60% 55% at 50% 42%, rgba(${tint.join(",")},0.16), transparent 68%)`,
            }}
          />
          <div className="absolute left-4 top-4 flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-sm border border-ice/40 bg-void/70 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide-tech text-ice">
              <span className="h-1.5 w-1.5 rounded-full bg-ice" />
              Ready to ship
            </span>
          </div>
          <div className="absolute right-4 top-4 font-mono text-[11px] uppercase tracking-wide-tech text-steel/70">
            {String(index + 1).padStart(2, "0")} / {String(STOCK.length).padStart(2, "0")}
          </div>
          <GuitarVisual
            construction={item.construction}
            strings={item.strings}
            finish={finish}
            hardwareColor={item.hardwareColor}
            detail="full"
            className="relative h-[112%] w-auto"
          />
        </div>

        {/* --- Spec + price ----------------------------------------- */}
        <div>
          <div className="flex items-center gap-3">
            <ModelBadge>{item.code}</ModelBadge>
            <span className="tech-label text-steel">{item.family}</span>
          </div>

          <h2 className="mt-5 font-display text-display-sm font-medium leading-[0.95]">
            {item.family.toUpperCase()}
            <span className="block text-steel">{item.code}</span>
          </h2>

          <p className="mt-5 max-w-md font-sans text-sm leading-relaxed text-steel">
            {item.note}
          </p>

          <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-5">
            <TechSpec label="Finish" value={finish?.name ?? "Raw Arium"} sub={finish?.category} />
            <TechSpec label="Strings" value={`${item.strings}-string`} sub={item.scale} />
            <TechSpec label="Bridge" value={item.bridge} />
            <TechSpec label="Pickups" value={item.pickups} />
            <TechSpec label="Hardware" value={item.hardware} />
            <TechSpec label="Availability" value="1 in stock" sub="Ships in 3–5 days" />
          </div>

          <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="tech-label mb-1">Price</div>
              <div className="font-display text-display-sm leading-none text-chalk">
                {formatEUR(item.price)}
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <CTAButton href="/build" variant="primary" size="lg">
              Inquire to reserve
            </CTAButton>
            <CTAButton href="/build" variant="secondary" size="lg">
              Compare to custom build
            </CTAButton>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

export default function InStockPage() {
  return (
    <main className="bg-void">
      {/* ---- Header ------------------------------------------------- */}
      <section className="shell pt-32 pb-8">
        <SectionLabel index="/ IN STOCK">Ready to ship</SectionLabel>
        <div className="mt-8 flex flex-wrap items-end justify-between gap-8">
          <h1 className="max-w-3xl font-display text-display-md font-medium leading-[0.9]">
            FINISHED.
            <br />
            <span className="text-steel">WAITING.</span>
          </h1>
          <p className="max-w-sm font-sans text-sm leading-relaxed text-steel">
            A handful of instruments, already built and set up. Each is a single
            object — specified, finished, gone once it ships. What is here now is
            all there is.
          </p>
        </div>
      </section>

      {/* ---- The shelf --------------------------------------------- */}
      <section className="shell pb-8">
        {STOCK.map((item, i) => (
          <StockRow key={item.code} item={item} index={i} />
        ))}
      </section>

      {/* ---- Empty state (documented section) ---------------------- */}
      <section className="border-t border-graphite-line bg-graphite py-24">
        <div className="shell">
          <SectionLabel index="/ EMPTY STATE">When the shelf is bare</SectionLabel>

          <Reveal className="mt-12 grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <h2 className="font-display text-display-sm font-medium leading-[0.95]">
                NOTHING IS WAITING.
                <br />
                <span className="text-ice">YOURS CAN BE NEXT.</span>
              </h2>
              <p className="mt-6 max-w-md font-sans text-sm leading-relaxed text-steel">
                Every Aristides is built to order. When there is nothing on the
                shelf, that is not a dead end — it is an invitation. Start from
                the platform up and specify an instrument that is only yours.
              </p>
              <div className="mt-8">
                <CTAButton href="/build" variant="primary" size="lg">
                  Build your own
                </CTAButton>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <Divider className="mb-8 lg:hidden" />
              <p className="mb-6 max-w-md font-sans text-sm leading-relaxed text-steel">
                Or be first to know. Ready-to-ship instruments are rare and move
                quickly — the list hears before the site does.
              </p>
              <NewsletterSignup />
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
