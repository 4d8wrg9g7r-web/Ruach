"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { NAV, SITE } from "@/lib/site";
import { Wordmark } from "@/components/wordmark";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the overlay on navigation and lock scroll while it is open.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-700 ease-atelier ${
          scrolled
            ? "bg-warmwhite/85 backdrop-blur-md shadow-[0_1px_0_rgba(168,138,90,0.22)]"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-editorial items-center justify-between px-6 py-5 sm:px-8 lg:px-12">
          <Link href="/" aria-label={`${SITE.name} — home`} className="relative z-50">
            <Wordmark className="h-6 w-auto text-espresso" />
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-6 xl:flex 2xl:gap-8">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="link-underline whitespace-nowrap font-sans text-[0.82rem] uppercase tracking-wider2 text-ink-soft transition-colors hover:text-espresso"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden xl:block">
            <Link
              href="/build"
              className="btn-primary whitespace-nowrap !py-3 !px-6 !text-[0.72rem]"
            >
              Commission an Instrument
            </Link>
          </div>

          {/* Menu trigger: two brass rules, not a boxed hamburger */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-[6px] xl:hidden"
          >
            <span
              className={`h-px w-7 bg-espresso transition-all duration-500 ease-atelier ${
                open ? "translate-y-[3.5px] rotate-45" : ""
              }`}
            />
            <span
              className={`h-px w-7 bg-espresso transition-all duration-500 ease-atelier ${
                open ? "-translate-y-[3.5px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </header>

      {/* Full-screen parchment overlay */}
      <div
        className={`fixed inset-0 z-40 bg-plaster transition-all duration-700 ease-atelier xl:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="flex h-full flex-col justify-center px-8">
          <nav aria-label="Mobile" className="flex flex-col gap-1">
            {NAV.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-baseline gap-4 border-b border-brass/20 py-4"
                style={{
                  transitionDelay: open ? `${120 + i * 60}ms` : "0ms",
                }}
              >
                <span className="font-serif text-[0.9rem] text-brass">
                  0{i + 1}
                </span>
                <span className="font-serif text-4xl text-espresso transition-transform duration-500 ease-atelier group-hover:translate-x-1">
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>
          <Link
            href="/build"
            className="btn-primary mt-10 self-start"
          >
            Commission an Instrument
          </Link>
        </div>
      </div>
    </>
  );
}
