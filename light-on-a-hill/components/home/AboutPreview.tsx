import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { FocusImage } from "@/components/FocusImage";

export function AboutPreview() {
  return (
    <section className="bg-paper px-5 py-28 sm:px-8 sm:py-36">
      <div className="mx-auto grid max-w-editorial gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
        <Reveal className="order-2 lg:order-none">
          <div className="crop-frame">
            <FocusImage image="photographer" className="aspect-[4/5]" sizes="(max-width: 1024px) 100vw, 50vw" />
          </div>
        </Reveal>

        <div className="order-1 lg:order-none">
          <Reveal>
            <p className="eyebrow text-champagne">The person behind the camera</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-6 text-balance font-serif text-display-sm text-ink">
              You should feel comfortable with the person documenting the moments that matter.
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-8 max-w-md text-[0.98rem] leading-relaxed text-charcoal/80">
              I&rsquo;ve spent years learning when to step in and, more importantly, when to disappear.
              The best frames are rarely the ones people pose for &mdash; they&rsquo;re the half-second
              after, when everyone forgets I&rsquo;m there. That&rsquo;s the half-second I&rsquo;m always
              waiting for.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <Link
              href="/about"
              data-cursor="explore"
              className="group mt-10 inline-flex items-center gap-3 border-b border-ink/30 pb-1 font-sans text-[0.72rem] uppercase tracking-label text-ink transition-colors hover:border-ink"
            >
              Meet your photographer
              <span className="transition-transform duration-500 ease-aperture group-hover:translate-x-1">&rarr;</span>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
