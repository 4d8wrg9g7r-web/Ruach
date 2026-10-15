import type { Metadata } from "next";
import { Container, Overline, BrassRule, ButtonLink, SectionIndex } from "@/components/ui";
import { CraftDetail, type CraftKind } from "@/components/visuals/details";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "The Craft",
  description:
    "What separates an Alexeas instrument from a mass-produced guitar — the wood, the voicing, the joinery, and the hours that a machine cannot spend.",
};

type Stage = {
  n: string;
  kind: CraftKind;
  title: string;
  body: string[];
};

const STAGES: Stage[] = [
  {
    n: "01",
    kind: "wood",
    title: "Selecting Wood",
    body: [
      "Every instrument begins years before it is built, in a rack of quartersawn billets left to settle into the dry stillness of the shop.",
      "Wood is chosen board by board — tapped, flexed, held to the light. A factory buys tone by the pallet; here it is chosen one top at a time.",
    ],
  },
  {
    n: "02",
    kind: "voicing",
    title: "Bracing & Voicing",
    body: [
      "The braces beneath the top are carved and scalloped by hand until the soundboard answers with the response it should have.",
      "This is the quiet difference. Two guitars can share a shape and a species and sound nothing alike; the voice lives in wood you never see.",
    ],
  },
  {
    n: "03",
    kind: "joint",
    title: "Joinery",
    body: [
      "The neck meets the body in a hand-fitted dovetail — pared, tested, and pared again until the joint closes without a gap.",
      "It is slower than a bolt and a shim. It is also what lets the instrument carry string tension for a lifetime without complaint.",
    ],
  },
  {
    n: "04",
    kind: "neck",
    title: "Neck Carving",
    body: [
      "A neck is shaped with a spokeshave and read with the hand, not a gauge. The profile is carried down until it feels like nothing at all.",
      "A good neck disappears when you play. That is the whole intention behind the hours it takes to carve one.",
    ],
  },
  {
    n: "05",
    kind: "fretwork",
    title: "Fretwork",
    body: [
      "Frets are seated, leveled, crowned, and polished until every note along the board speaks cleanly and rings true.",
      "Precise fretwork is invisible when it is right and impossible to ignore when it is wrong. It is worth the patience it asks for.",
    ],
  },
  {
    n: "06",
    kind: "binding",
    title: "Binding",
    body: [
      "Binding is bent to the curve of the body and let into a channel cut just deep enough to hold it flush.",
      "It protects the edges and frames the whole instrument — the thin line that quietly says a person, not a press, closed these seams.",
    ],
  },
  {
    n: "07",
    kind: "inlay",
    title: "Inlay",
    body: [
      "Where an instrument carries inlay, each piece is cut, fitted, and set into the wood by hand, tight enough that no line reads as a seam.",
      "Restraint matters here. An ornament should feel inevitable, as though the wood asked for it.",
    ],
  },
  {
    n: "08",
    kind: "finish",
    title: "Finishing",
    body: [
      "The finish is built in thin coats and rubbed back between them, thin enough to protect the wood without ever muffling it.",
      "It takes weeks that a spray booth would skip. The reward is a surface that lets the top keep breathing and moving as it should.",
    ],
  },
  {
    n: "09",
    kind: "setup",
    title: "Setup",
    body: [
      "The final hours are spent on the details a player feels first — nut slots, saddle height, and the action set to the hand it is made for.",
      "An instrument is not finished when it is built. It is finished when it plays the way it was meant to.",
    ],
  },
];

const BG = ["bg-plaster", "bg-warmwhite", "bg-plaster-deep"];

function StageRow({ stage, index }: { stage: Stage; index: number }) {
  const imageLeft = index % 2 === 0;
  const bg = BG[index % BG.length];
  return (
    <section className={`${bg} py-20 sm:py-24`}>
      <Container>
        <div className="reveal grid items-center gap-12 md:grid-cols-2 md:gap-16">
          <div className={imageLeft ? "md:order-1" : "md:order-2"}>
            <div className="aspect-square border border-brass/30 bg-warmwhite/60 p-10 sm:p-14">
              <CraftDetail kind={stage.kind} className="h-full w-full text-wood" />
            </div>
          </div>
          <div className={imageLeft ? "md:order-2" : "md:order-1"}>
            <SectionIndex n={stage.n} label={stage.title} />
            <h2 className="mt-5 font-serif text-4xl leading-tight text-espresso sm:text-5xl">
              {stage.title}
            </h2>
            <div className="mt-6 max-w-prose2 space-y-4 text-lg leading-relaxed text-ink-soft text-pretty">
              {stage.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default function CraftPage() {
  const firstHalf = STAGES.slice(0, 5);
  const secondHalf = STAGES.slice(5);

  return (
    <>
      <section className="bg-warmwhite pb-8 pt-24 sm:pt-32">
        <Container>
          <div className="reveal max-w-editorial">
            <Overline>The Craft</Overline>
            <h1 className="mt-6 max-w-4xl font-serif text-5xl leading-[1.05] text-espresso text-balance sm:text-6xl lg:text-7xl">
              A guitar can be assembled in a day. An instrument takes longer.
            </h1>
            <p className="mt-8 max-w-prose2 text-xl leading-relaxed text-ink-soft text-pretty">
              A mass-produced guitar is a specification met by a machine. An
              Alexeas is a series of decisions, made by hand, that no machine is
              asked to make. What follows is where those hours go.
            </p>
          </div>
          <BrassRule className="mt-16" />
        </Container>
      </section>

      {firstHalf.map((stage, i) => (
        <StageRow key={stage.n} stage={stage} index={i} />
      ))}

      <section className="bg-espresso-wash py-24 text-ivory sm:py-32">
        <Container>
          <div className="reveal mx-auto max-w-3xl text-center">
            <Overline className="text-brassLight">The difference you hear</Overline>
            <blockquote className="mt-8 font-serif text-3xl leading-snug text-parchment text-balance sm:text-4xl lg:text-5xl">
              “The machine can copy the shape of an instrument. It cannot spend
              the hours that give it a voice.”
            </blockquote>
            <p className="mt-8 text-sm uppercase tracking-wider2 text-parchment/60">
              {SITE.maker} · {SITE.location.city}, {SITE.location.region}
            </p>
          </div>
        </Container>
      </section>

      {secondHalf.map((stage, i) => (
        <StageRow key={stage.n} stage={stage} index={i + firstHalf.length} />
      ))}

      <section className="bg-plaster-deep py-24 sm:py-32">
        <Container>
          <div className="reveal mx-auto max-w-3xl text-center">
            <Overline>What comes next</Overline>
            <h2 className="mt-6 font-serif text-4xl leading-tight text-espresso text-balance sm:text-5xl">
              An instrument made for one pair of hands.
            </h2>
            <p className="mx-auto mt-6 max-w-prose2 text-lg leading-relaxed text-ink-soft text-pretty">
              Every choice above is one you can be part of. Begin a build, or
              step inside the room where these hours are spent.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <ButtonLink href="/build">Build Your Instrument</ButtonLink>
              <ButtonLink href="/workshop" variant="ghost">
                Step Inside the Workshop
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
