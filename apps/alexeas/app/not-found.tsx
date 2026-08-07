import { Container, ButtonLink, ArrowLink } from "@/components/ui";
import { InstrumentSilhouette } from "@/components/visuals/silhouettes";

export default function NotFound() {
  return (
    <section className="flex min-h-[80vh] items-center bg-plaster pt-24">
      <Container>
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <p className="overline">Off the bench</p>
            <h1 className="mt-6 font-serif text-6xl leading-none text-espresso sm:text-7xl">
              This one hasn’t been built.
            </h1>
            <p className="mt-6 max-w-md font-sans text-lg leading-relaxed text-ink-soft">
              The page you’re after isn’t here — but the next Alexeas is always waiting to
              begin.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <ButtonLink href="/">Return home</ButtonLink>
              <ArrowLink href="/build">Build an instrument</ArrowLink>
            </div>
          </div>
          <div className="flex justify-center">
            <InstrumentSilhouette silhouette="o" stroke="#8A6245" strokeWidth={1} className="h-80 w-auto text-wood opacity-80" />
          </div>
        </div>
      </Container>
    </section>
  );
}
