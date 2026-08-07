import Link from "next/link";
import { MODELS } from "@/lib/data/models";
import { InstrumentSilhouette } from "@/components/visuals/silhouettes";
import { ArrowLink } from "@/components/ui";

/**
 * Editorial model explorer — large alternating rows rather than a card grid.
 * The silhouette rotates gently on hover (CSS only, reduced-motion respected
 * globally), personality leads, specifications stay quiet.
 */
export function ModelExplorer() {
  return (
    <div className="divide-y divide-brass/20">
      {MODELS.map((model, i) => (
        <article key={model.slug} className="reveal grid items-center gap-8 py-14 md:grid-cols-[0.9fr_1.4fr] md:gap-16">
          <div
            className={`group flex justify-center ${i % 2 === 1 ? "md:order-2" : ""}`}
          >
            <Link href={`/instruments/${model.slug}`} aria-label={`View the ${model.name}`}>
              <InstrumentSilhouette
                silhouette={model.silhouette}
                stroke="#3A2A21"
                strokeWidth={1.2}
                className="h-64 w-auto text-espresso transition-transform duration-1000 ease-atelier group-hover:rotate-[3deg] sm:h-72"
              />
            </Link>
          </div>

          <div className={i % 2 === 1 ? "md:order-1" : ""}>
            <div className="flex items-baseline gap-4">
              <span className="font-serif text-lg text-brass">0{model.order}</span>
              <h3 className="font-serif text-4xl text-espresso sm:text-5xl">{model.name}</h3>
            </div>
            <p className="mt-3 font-serif text-2xl italic text-wood">{model.tagline}</p>
            <p className="mt-4 max-w-md font-sans leading-relaxed text-ink-soft">{model.summary}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              {model.idealUse.map((use) => (
                <span
                  key={use}
                  className="border border-brass/30 px-3 py-1 font-sans text-xs uppercase tracking-wider2 text-ink-muted"
                >
                  {use}
                </span>
              ))}
            </div>

            <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2 font-sans text-sm text-ink-soft">
              <div className="flex gap-2">
                <dt className="text-ink-muted">Lower bout</dt>
                <dd>{model.specs.lowerBout}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-ink-muted">Scale</dt>
                <dd>{model.specs.scaleLength}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-ink-muted">Frets</dt>
                <dd>{model.specs.frets}</dd>
              </div>
            </dl>

            <div className="mt-8 flex flex-wrap items-center gap-6">
              <ArrowLink href={`/instruments/${model.slug}`}>View Instrument</ArrowLink>
              <Link
                href={`/build?model=${model.slug}`}
                className="link-underline font-sans text-sm uppercase tracking-wider2 text-wood"
              >
                <span>Build This Model</span>
                <span className="arrow" aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
