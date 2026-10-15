import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { COMPLETED } from "@/lib/data/content";
import { Container, Overline, BrassRule, ButtonLink, ArrowLink } from "@/components/ui";
import { InstrumentSilhouette } from "@/components/visuals/silhouettes";
import { SITE } from "@/lib/site";

export function generateStaticParams() {
  return COMPLETED.map((b) => ({ id: b.id }));
}

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const build = COMPLETED.find((b) => b.id === id);
  if (!build) return {};
  return {
    title: `${build.model} — ${build.top} / ${build.body} (${build.year})`,
    description: build.story,
  };
}

export default async function BuildDetailPage({ params }: Props) {
  const { id } = await params;
  const build = COMPLETED.find((b) => b.id === id);
  if (!build) notFound();

  const specs: [string, string][] = [
    ["Model", build.model],
    ["Year", build.year],
    ["Top", build.top],
    ["Back & sides", build.body],
    ["Neck", build.neck],
    ["Fretboard", build.fretboard],
    ["Binding", build.binding],
    ["Rosette", build.rosette],
  ];

  return (
    <>
      <section className="bg-plaster pb-16 pt-32 sm:pt-40">
        <Container>
          <Link href="/instruments/completed" className="link-underline font-sans text-xs uppercase tracking-wider2 text-ink-muted">
            <span aria-hidden>←</span> <span>The archive</span>
          </Link>
          <div className="mt-10 grid items-center gap-12 lg:grid-cols-2">
            <div className="reveal flex justify-center">
              <div className="w-full max-w-sm border border-brass/20 bg-warmwhite p-10">
                <InstrumentSilhouette silhouette={build.silhouette} stroke={build.accent} strokeWidth={1.2} className="mx-auto h-[52vh] w-auto" />
              </div>
            </div>
            <div className="reveal">
              <Overline>{build.year} · {build.model}</Overline>
              <h1 className="mt-4 font-serif text-5xl leading-tight text-espresso sm:text-6xl">
                {build.top} / {build.body}
              </h1>
              <p className="mt-6 max-w-md font-sans text-lg leading-relaxed text-ink-soft">{build.story}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {build.features.map((f) => (
                  <span key={f} className="border border-brass/30 px-3 py-1 font-sans text-xs uppercase tracking-wider2 text-ink-muted">{f}</span>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-warmwhite py-20">
        <Container>
          <div className="reveal max-w-2xl">
            <Overline>Specification</Overline>
          </div>
          <dl className="reveal mt-8 grid gap-px overflow-hidden border border-brass/20 bg-brass/20 sm:grid-cols-2 lg:grid-cols-4">
            {specs.map(([k, v]) => (
              <div key={k} className="bg-plaster p-6">
                <dt className="font-sans text-xs uppercase tracking-wider2 text-ink-muted">{k}</dt>
                <dd className="mt-2 font-serif text-lg text-espresso">{v}</dd>
              </div>
            ))}
          </dl>

          {/* Media placeholders — the data model already carries audio/video slots. */}
          <div className="reveal mt-10 grid gap-6 sm:grid-cols-2">
            {["Audio demo", "Video demo"].map((label) => (
              <div key={label} className="flex items-center justify-between border border-brass/20 bg-plaster px-6 py-8">
                <span className="font-serif text-xl text-espresso">{label}</span>
                <span className="font-sans text-xs uppercase tracking-wider2 text-ink-muted">Coming soon</span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-plaster py-24 text-center">
        <Container>
          <p className="reveal overline mx-auto">Inspired?</p>
          <h2 className="reveal mx-auto mt-6 max-w-3xl font-serif text-4xl leading-tight text-espresso sm:text-5xl">
            Begin a build like this one — then make it your own.
          </h2>
          <BrassRule className="reveal mx-auto mt-10 max-w-xs" />
          <div className="reveal mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <ButtonLink href="/build">Build Your Instrument →</ButtonLink>
            <ArrowLink href={`mailto:${SITE.email}`}>Ask about this build</ArrowLink>
          </div>
        </Container>
      </section>
    </>
  );
}
