import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { StudioImage } from "@/components/StudioImage";
import type { ImageKey } from "@/content/images";

type Story = {
  label: string;
  headline: [string, string];
  href: string;
  cta: string;
  image: ImageKey;
};

const STORIES: Story[] = [
  {
    label: "Weddings",
    headline: ["The day moves quickly.", "Your photographs shouldn't."],
    href: "/weddings",
    cta: "Explore Weddings",
    image: "weddingAisle",
  },
  {
    label: "Couples",
    headline: ["Photographs that feel like", "the two of you — not a photoshoot."],
    href: "/couples",
    cta: "Explore Couples",
    image: "couplesField",
  },
  {
    label: "Families",
    headline: ["The beautifully imperfect", "season you're living right now."],
    href: "/families",
    cta: "Explore Families",
    image: "familyOutdoor",
  },
];

/** Asymmetric editorial services composition — not a row of identical cards. */
export function ChooseYourStory() {
  return (
    <section className="bg-surface px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-editorial">
        <Reveal>
          <p className="eyebrow text-champagne">Choose your story</p>
        </Reveal>

        {/* Weddings — oversized, offset */}
        <StoryBlock story={STORIES[0]} variant="wide" />

        {/* Couples + Families — narrow vertical + offset */}
        <div className="mt-8 grid gap-8 lg:mt-16 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5 lg:col-start-1">
            <StoryBlock story={STORIES[1]} variant="tall" />
          </div>
          <div className="lg:col-span-6 lg:col-start-7 lg:mt-24">
            <StoryBlock story={STORIES[2]} variant="short" />
          </div>
        </div>
      </div>
    </section>
  );
}

function StoryBlock({ story, variant }: { story: Story; variant: "wide" | "tall" | "short" }) {
  const ratio =
    variant === "wide"
      ? "aspect-[16/10] sm:aspect-[16/8]"
      : variant === "tall"
        ? "aspect-[3/4]"
        : "aspect-[4/3]";

  return (
    <Reveal className="group mt-10 block first:mt-12">
      <Link href={story.href} className="block" data-cursor="explore">
        <div className={`crop-frame relative overflow-hidden ${ratio}`}>
          <StudioImage
            image={story.image}
            sizes={variant === "wide" ? "100vw" : "50vw"}
            className="transition-transform duration-[1400ms] ease-aperture group-hover:scale-[1.05]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-shade/40 to-transparent" />
          <span className="absolute left-5 top-5 font-sans text-[0.62rem] uppercase tracking-label text-chalk mix-blend-difference">
            {story.label}
          </span>
        </div>
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h3 className="max-w-2xl text-balance font-serif text-display-sm text-ink">
            {story.headline[0]}
            <br />
            {story.headline[1]}
          </h3>
          <span className="inline-flex shrink-0 items-center gap-2 border-b border-ink/30 pb-1 font-sans text-[0.72rem] uppercase tracking-label text-ink transition-colors group-hover:border-ink">
            {story.cta}
            <span className="transition-transform duration-500 ease-aperture group-hover:translate-x-1">&rarr;</span>
          </span>
        </div>
      </Link>
    </Reveal>
  );
}
