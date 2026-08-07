"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ApertureIcon } from "./ApertureIcon";
import { PRIMARY_NAV } from "@/content/navigation";
import { IMAGES, objectPosition, src } from "@/content/images";
import { SITE } from "@/content/site";
import { track } from "@/lib/analytics";

const EASE = [0.16, 1, 0.3, 1] as const;

export function ApertureNav() {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(1); // default preview: Weddings
  const pathname = usePathname();
  const overlayRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), []);

  // Close on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock scroll + focus management + Escape + focus trap while open.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const first = overlayRef.current?.querySelector<HTMLElement>("a,button");
    first?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;
      const nodes = overlayRef.current?.querySelectorAll<HTMLElement>("a,button");
      if (!nodes || nodes.length === 0) return;
      const list = Array.from(nodes);
      const firstEl = list[0];
      const lastEl = list[list.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const activeImg = IMAGES[PRIMARY_NAV[active].image];

  return (
    <>
      {/* Fixed chrome: wordmark + aperture control */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-[120] flex items-start justify-between px-5 py-5 sm:px-8 sm:py-7 mix-blend-difference">
        <Link
          href="/"
          className="pointer-events-auto font-sans text-[0.72rem] font-medium uppercase tracking-label text-paper transition-opacity hover:opacity-70"
          data-cursor=""
        >
          {SITE.wordmark}
        </Link>
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen(true)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          aria-label="Open navigation menu"
          aria-expanded={open}
          aria-haspopup="dialog"
          className="pointer-events-auto -m-2 flex items-center gap-3 p-2 text-paper"
        >
          <span className="hidden font-sans text-[0.6rem] uppercase tracking-label text-paper/80 sm:inline">
            Menu
          </span>
          <ApertureIcon
            progress={open ? 1 : hovered ? 0.28 : 0}
            duration={hovered && !open ? 0.5 : 0.6}
            className="h-8 w-8 sm:h-9 sm:w-9"
          />
        </button>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={overlayRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            className="fixed inset-0 z-[130] grain overflow-hidden bg-ink/95 text-paper backdrop-blur-xl"
            initial={{ clipPath: "circle(0% at calc(100% - 3rem) 3rem)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 3rem) 3rem)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 3rem) 3rem)" }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            {/* Dynamic background photograph (desktop) */}
            <div className="pointer-events-none absolute inset-0 hidden lg:block">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={active}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 0.4, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9, ease: EASE }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src(activeImg, 1600)}
                    alt=""
                    className="h-full w-full object-cover"
                    style={{ objectPosition: objectPosition(activeImg) }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-ink/30" />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Top bar inside menu */}
            <div className="relative z-10 flex items-start justify-between px-5 py-5 sm:px-8 sm:py-7">
              <span className="font-sans text-[0.72rem] uppercase tracking-label text-paper/80">
                {SITE.wordmark}
              </span>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
                aria-label="Close navigation menu"
                className="-m-2 flex items-center gap-3 p-2"
              >
                <span className="hidden font-sans text-[0.6rem] uppercase tracking-label text-paper/70 sm:inline">
                  Close
                </span>
                <ApertureIcon progress={1} className="h-8 w-8 rotate-45" />
              </button>
            </div>

            {/* Navigation list */}
            <nav className="relative z-10 flex h-[calc(100%-6rem)] flex-col justify-center px-5 sm:px-8 lg:px-14">
              <ul className="max-w-3xl">
                {PRIMARY_NAV.map((item, i) => {
                  const isCurrent = pathname === item.href;
                  return (
                    <li key={item.href} className="border-b border-paper/10">
                      <Link
                        href={item.href}
                        onMouseEnter={() => setActive(i)}
                        onFocus={() => setActive(i)}
                        onClick={() => track("navigation_service_click", { label: item.label })}
                        className="group flex items-baseline gap-4 py-2.5 sm:gap-6 sm:py-3"
                        aria-current={isCurrent ? "page" : undefined}
                      >
                        <span className="font-sans text-[0.7rem] tabular-nums tracking-label text-champagne/80">
                          {item.index}
                        </span>
                        <span
                          className={`font-serif text-4xl leading-none transition-all duration-500 ease-aperture sm:text-6xl lg:text-7xl ${
                            isCurrent ? "text-paper" : "text-paper/70 group-hover:text-paper"
                          } group-hover:translate-x-2`}
                        >
                          {item.label}
                        </span>
                        <span className="ml-auto hidden max-w-[15rem] pb-2 text-right font-sans text-[0.72rem] leading-snug text-mist opacity-0 transition-opacity duration-500 group-hover:opacity-100 lg:block">
                          {item.hint}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-2 font-sans text-[0.7rem] uppercase tracking-label text-mist">
                <a href={`mailto:${SITE.email}`} onClick={() => track("email_click")} className="hover:text-paper">
                  {SITE.email}
                </a>
                <span className="hidden sm:inline">{SITE.region}</span>
                {SITE.social.instagram && (
                  <a href={SITE.social.instagram} target="_blank" rel="noreferrer" className="hover:text-paper">
                    Instagram
                  </a>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
