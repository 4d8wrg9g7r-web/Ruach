import Link from "next/link";
import { NAV, SITE } from "@/lib/site";
import { Container, BrassRule } from "@/components/ui";
import { Wordmark } from "@/components/wordmark";

export function SiteFooter() {
  return (
    <footer className="bg-espresso-wash text-ivory">
      <Container className="py-20">
        <div className="grid gap-14 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Wordmark className="h-7 w-auto text-ivory" />
            <p className="mt-6 max-w-xs font-serif text-2xl leading-snug text-parchment">
              {SITE.tagline}
            </p>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-parchment/70">
              Handcrafted guitars, mandolins, and stringed instruments, built one
              at a time in the workshop of {SITE.maker}.
            </p>
          </div>

          <nav aria-label="Footer" className="flex flex-col gap-3">
            <p className="overline text-brassLight">Explore</p>
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="w-fit text-parchment/80 transition-colors hover:text-ivory"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-3">
            <p className="overline text-brassLight">Workshop</p>
            <a
              href={`mailto:${SITE.email}`}
              className="w-fit text-parchment/80 transition-colors hover:text-ivory"
            >
              {SITE.email}
            </a>
            <p className="text-parchment/80">
              {SITE.location.city}, {SITE.location.region}
            </p>
            <div className="mt-2 flex gap-5">
              <a
                href={SITE.social.instagram}
                className="text-sm uppercase tracking-wider2 text-parchment/60 transition-colors hover:text-ivory"
                target="_blank"
                rel="noreferrer noopener"
              >
                Instagram
              </a>
              <a
                href={SITE.social.facebook}
                className="text-sm uppercase tracking-wider2 text-parchment/60 transition-colors hover:text-ivory"
                target="_blank"
                rel="noreferrer noopener"
              >
                Facebook
              </a>
            </div>
          </div>
        </div>

        <BrassRule className="my-12 opacity-40" />

        <div className="flex flex-col items-start justify-between gap-4 text-xs uppercase tracking-wider2 text-parchment/50 sm:flex-row sm:items-center">
          <p>
            © {SITE.name}. Made by hand in {SITE.location.city}, {SITE.location.regionCode}.
          </p>
          <p className="font-serif text-sm normal-case tracking-normal text-brassLight">
            The next Alexeas hasn’t been built yet.
          </p>
        </div>
      </Container>
    </footer>
  );
}
