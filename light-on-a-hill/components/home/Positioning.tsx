import { Reveal } from "@/components/Reveal";

export function Positioning() {
  return (
    <section className="bg-paper px-5 py-28 sm:px-8 sm:py-40">
      <div className="mx-auto max-w-editorial">
        <Reveal>
          <p className="max-w-xl font-sans text-[0.95rem] leading-relaxed text-charcoal/70">
            Photography isn&rsquo;t about documenting what something looked like.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mt-8 max-w-5xl text-balance font-serif text-display-lg text-ink">
            It&rsquo;s remembering
            <br />
            what it felt like.
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-10 max-w-lg text-[0.98rem] leading-relaxed text-charcoal/80">
            The temperature of a room. The sound just before the vows. The way your daughter looked at
            you when she thought no one was watching. That&rsquo;s the work &mdash; not perfect pictures,
            but photographs that put you back inside the moment years from now.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
