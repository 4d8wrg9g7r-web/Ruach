import Link from "next/link";
import { FOOTER_NAV } from "@/content/navigation";
import { SITE } from "@/content/site";
import { ApertureIcon } from "./ApertureIcon";
import { ThemeToggle } from "./ThemeToggle";

export function SiteFooter() {
  const year = 2026; // Date.now() is unavailable in this environment; set at build.
  return (
    <footer className="grain relative overflow-hidden bg-shade text-chalk">
      <div className="pointer-events-none absolute -right-40 -top-40 h-[42rem] w-[42rem] text-chalk/[0.04]">
        <ApertureIcon progress={0.7} outline className="h-full w-full" />
      </div>

      <div className="relative mx-auto max-w-editorial px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <p className="font-serif text-3xl leading-tight sm:text-4xl">
              Let&rsquo;s make something worth remembering.
            </p>
            <Link
              href="/inquire"
              data-cursor="explore"
              className="group mt-8 inline-flex items-center gap-3 border-b border-chalk/40 pb-1 font-sans text-[0.72rem] uppercase tracking-label transition-colors hover:border-chalk"
            >
              Start your inquiry
              <span className="transition-transform duration-500 ease-aperture group-hover:translate-x-1">
                &rarr;
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {Object.entries(FOOTER_NAV).map(([group, links]) => (
              <nav key={group} aria-label={group}>
                <p className="eyebrow mb-4 text-mist">{group}</p>
                <ul className="space-y-2.5">
                  {links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-sm text-chalk/75 transition-colors hover:text-chalk">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-6 border-t border-chalk/10 pt-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-sans text-[0.72rem] uppercase tracking-label text-chalk">{SITE.name}</p>
            <p className="mt-1 text-sm text-mist">{SITE.region} + Wherever Your Story Takes You</p>
            <ThemeToggle className="mt-5 text-chalk" />
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-sans text-[0.68rem] uppercase tracking-label text-mist">
            {SITE.social.instagram && (
              <a href={SITE.social.instagram} target="_blank" rel="noreferrer" className="hover:text-chalk">
                Instagram
              </a>
            )}
            <a href={`mailto:${SITE.email}`} className="hover:text-chalk">
              Email
            </a>
            <Link href="/legal/privacy" className="hover:text-chalk">
              Privacy
            </Link>
            <Link href="/legal/terms" className="hover:text-chalk">
              Terms
            </Link>
            <span>&copy; {year}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
