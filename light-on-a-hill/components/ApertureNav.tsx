"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ApertureLens } from "./ApertureLens";
import { PRIMARY_NAV } from "@/content/navigation";
import { IMAGES, objectPosition, src } from "@/content/images";
import { SITE } from "@/content/site";
import { track } from "@/lib/analytics";
import { ThemeToggle } from "./ThemeToggle";

const EASE = [0.16, 1, 0.3, 1] as const;

// Blade angles (degrees of swing)
const SEALED = 2;
const REST = 14;
const HOVER_CONTRACT = 9;
const OPEN = 60;

type Phase = "closed" | "open" | "exiting";

export function ApertureNav() {
  const [phase, setPhase] = useState<Phase>("closed");
  const [hovered, setHovered] = useState(false);
  const [proximity, setProximity] = useState(0); // 0..1, pointer near the control
  const [active, setActive] = useState(1); // previewed nav index
  const [pointer, setPointer] = useState({ x: 0, y: 0 }); // -1..1 within viewport
  const pathname = usePathname();
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const controlRef = useRef<HTMLDivElement>(null);
  const exiting = useRef(false);

  const open = phase !== "closed";

  // Close on route change.
  useEffect(() => {
    exiting.current = false;
    setPhase("closed");
  }, [pathname]);

  // Pointer proximity (fine pointers): blades react as the cursor approaches.
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setPointer({
          x: (e.clientX / window.innerWidth) * 2 - 1,
          y: (e.clientY / window.innerHeight) * 2 - 1,
        });
        const el = controlRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        const d = Math.hypot(dx, dy);
        setProximity(Math.max(0, Math.min(1, 1 - d / 180)));
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  // Scroll: the closed barrel rotates almost imperceptibly with the page.
  const [scrollRotate, setScrollRotate] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setScrollRotate((window.scrollY * 0.02) % 360));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Scrolling inside the open menu stops the iris down; it relaxes back open.
  // Wheel on desktop, list scroll on mobile — both feed the same pulse.
  const [scrollPulse, setScrollPulse] = useState(0);
  const pulseTimer = useRef<number>(0);
  const pulse = useCallback((delta: number) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setScrollPulse((p) => Math.min(1, Math.max(p * 0.7, Math.abs(delta) / 260)));
    window.clearTimeout(pulseTimer.current);
    pulseTimer.current = window.setTimeout(() => setScrollPulse(0), 240);
  }, []);
  useEffect(() => () => window.clearTimeout(pulseTimer.current), []);

  // Scroll lock + focus management + Escape + focus trap while open.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const first = overlayRef.current?.querySelector<HTMLElement>("a,button");
    first?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPhase("closed");
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

  // Iris-out page transition: blades seal, then navigate.
  const navigate = useCallback(
    (href: string, label: string) => {
      if (exiting.current) return;
      exiting.current = true;
      track("navigation_service_click", { label });
      if (href === pathname) {
        setPhase("closed");
        exiting.current = false;
        return;
      }
      setPhase("exiting");
      window.setTimeout(() => router.push(href), 460);
    },
    [pathname, router],
  );

  const activeItem = PRIMARY_NAV[active];
  const activeImg = IMAGES[activeItem.image];
  const controlAngle = open
    ? OPEN
    : hovered
      ? HOVER_CONTRACT
      : REST - 2.5 * proximity;

  return (
    <>
      {/* Fixed chrome: wordmark + aperture control */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-[120] flex items-start justify-between px-5 py-5 sm:px-8 sm:py-6 mix-blend-difference">
        <Link
          href="/"
          className="pointer-events-auto font-sans text-[0.72rem] font-medium uppercase tracking-label text-chalk transition-opacity hover:opacity-70"
        >
          {SITE.wordmark}
        </Link>
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setPhase(open ? "closed" : "open")}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          aria-haspopup="dialog"
          data-cursor-ring="lg"
          className="pointer-events-auto -m-2 flex items-center gap-3 p-2 text-chalk"
        >
          <motion.span
            className="hidden font-sans text-[0.6rem] uppercase tracking-label text-chalk/80 sm:inline"
            animate={{ opacity: hovered || open ? 1 : 0, x: hovered || open ? 0 : 6 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            {open ? "Close" : "Menu"}
          </motion.span>
          <div ref={controlRef} className="h-10 w-10 sm:h-11 sm:w-11">
            <ApertureLens
              angle={controlAngle}
              ringRotate={(hovered ? 10 : 0) + (open ? 24 : 0) + scrollRotate}
              breathe={!open}
              duration={0.55}
              tone="light"
            />
          </div>
        </button>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={overlayRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            className="fixed inset-0 z-[130] grain overflow-hidden"
            initial={{ clipPath: "circle(0% at calc(100% - 3.4rem) 3.2rem)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 3.4rem) 3.2rem)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 3.4rem) 3.2rem)", transition: { duration: 0.4, ease: EASE } }}
            transition={{ duration: 0.7, ease: EASE }}
            style={{
              background: "rgba(7,7,7,0.72)",
              backdropFilter: "blur(14px) saturate(0.6)",
              WebkitBackdropFilter: "blur(14px) saturate(0.6)",
            }}
            onWheel={(e) => pulse(e.deltaY)}
          >
            {/* vignette over the defocused page beneath */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: "radial-gradient(120% 120% at 50% 50%, transparent 40%, rgba(0,0,0,0.5) 100%)" }}
            />

            {/* ===== Desktop: orbital composition ===== */}
            <div className="relative hidden h-full lg:block">
              {/* The lens — slightly off-centre right. Positioning lives on a
                  plain wrapper so framer's transform can't clobber the centring. */}
              <div
                className="absolute right-[7vw] top-1/2 -translate-y-1/2"
                style={{ width: "min(56vh, 34vw)", aspectRatio: "1" }}
              >
              <motion.div
                className="relative h-full w-full"
                initial={{ opacity: 0, scale: 0.62 }}
                animate={{ opacity: 1, scale: 1, transition: { delay: 0.16, duration: 0.7, ease: EASE } }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.3, ease: EASE } }}
              >
                <ApertureLens
                  angle={
                    phase === "exiting" ? SEALED : OPEN + (active % 3) * 2.5 - scrollPulse * 26
                  }
                  ringRotate={24 + active * 4 + scrollPulse * 6}
                  arcs
                  progress={{ index: active, total: PRIMARY_NAV.length }}
                  duration={phase === "exiting" ? 0.42 : scrollPulse > 0 ? 0.3 : 0.8}
                  image={{
                    src: src(activeImg, 1000),
                    alt: activeImg.alt,
                    position: objectPosition(activeImg),
                  }}
                  parallax={{ x: pointer.x * 3.5, y: pointer.y * 3.5 }}
                  className="h-full w-full"
                />
                {/* focus ring settle on preview change */}
                <motion.div
                  key={active}
                  className="pointer-events-none absolute rounded-full border border-champagne/50"
                  initial={{ inset: "8%", opacity: 0 }}
                  animate={{ inset: "17%", opacity: [0, 0.55, 0] }}
                  transition={{ duration: 0.8, ease: EASE, times: [0, 0.45, 1] }}
                />
                {/* index numeral above the lens */}
                <div className="absolute -top-9 left-1/2 -translate-x-1/2 font-sans text-[0.62rem] tabular-nums tracking-micro text-chalk/60">
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={activeItem.index}
                      className="inline-block"
                      initial={{ opacity: 0, y: 7 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -7 }}
                      transition={{ duration: 0.35, ease: EASE }}
                    >
                      {activeItem.index}
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-chalk/30"> / {String(PRIMARY_NAV.length).padStart(2, "0")}</span>
                </div>
              </motion.div>
              </div>

              {/* Orbital nav list — arcs toward the lens */}
              <nav className="absolute left-[7vw] top-1/2 -translate-y-1/2" aria-label="Primary">
                <ul>
                  {PRIMARY_NAV.map((item, i) => {
                    const t = i / (PRIMARY_NAV.length - 1) - 0.5; // -0.5..0.5
                    const arcX = Math.cos(t * Math.PI) * 64; // bow toward the lens
                    const isActive = i === active;
                    const isCurrent = pathname === item.href;
                    return (
                      <motion.li
                        key={item.href}
                        initial={{ opacity: 0, x: -18 }}
                        animate={{
                          opacity: phase === "exiting" ? 0 : 1,
                          x: phase === "exiting" ? -14 : arcX,
                          transition: { delay: phase === "exiting" ? 0 : 0.26 + i * 0.038, duration: 0.55, ease: EASE },
                        }}
                        exit={{ opacity: 0, x: -14, transition: { duration: 0.25 } }}
                      >
                        <Link
                          href={item.href}
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(item.href, item.label);
                          }}
                          onMouseEnter={() => setActive(i)}
                          onFocus={() => setActive(i)}
                          aria-current={isCurrent ? "page" : undefined}
                          data-cursor-ring="sm"
                          className="group flex items-baseline gap-5 py-1.5"
                        >
                          <span
                            className={`font-sans text-[0.62rem] tabular-nums tracking-micro transition-colors duration-500 ${
                              isActive ? "text-champagne" : "text-chalk/35"
                            }`}
                          >
                            {item.index}
                          </span>
                          <span
                            className="font-serif leading-[1.16] transition-all duration-500 ease-aperture"
                            style={{
                              fontSize: "clamp(32px, 3.4vw, 58px)",
                              color: isActive ? "#F4F2ED" : "rgba(244,242,237,0.42)",
                              letterSpacing: "0.01em",
                              transform: isActive ? "translateX(6px)" : "none",
                            }}
                          >
                            {item.label}
                          </span>
                        </Link>
                        {/* secondary line under the active item */}
                        <AnimatePresence>
                          {isActive && (
                            <motion.p
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.4, ease: EASE }}
                              className="overflow-hidden pl-[2.1rem] font-sans text-[0.6rem] uppercase tracking-micro text-chalk/45"
                            >
                              {item.index} — {item.hint}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </motion.li>
                    );
                  })}
                </ul>
              </nav>

              {/* hairline connecting list to lens */}
              <motion.div
                className="pointer-events-none absolute left-[30vw] right-[calc(7vw+min(56vh,34vw))] top-1/2 h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(244,242,237,0.14))" }}
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: phase === "exiting" ? 0 : 1, scaleX: 1 }}
                transition={{ delay: 0.5, duration: 0.6, ease: EASE }}
              />

              {/* footer strip */}
              <motion.div
                className="absolute inset-x-[7vw] bottom-8 flex items-center justify-between font-sans text-[0.62rem] uppercase tracking-label text-chalk/40"
                initial={{ opacity: 0 }}
                animate={{ opacity: phase === "exiting" ? 0 : 1 }}
                transition={{ delay: 0.55, duration: 0.5 }}
              >
                <a href={`mailto:${SITE.email}`} onClick={() => track("email_click")} className="hover:text-chalk/80">
                  {SITE.email}
                </a>
                <ThemeToggle className="text-chalk/70" />
                <span>{SITE.region} + Beyond</span>
                {SITE.social.instagram ? (
                  <a href={SITE.social.instagram} target="_blank" rel="noreferrer" className="hover:text-chalk/80">
                    Instagram
                  </a>
                ) : (
                  <span />
                )}
              </motion.div>
            </div>

            {/* ===== Mobile: lens above a vertical list ===== */}
            <div className="relative flex h-full flex-col lg:hidden">
              <motion.div
                className="mx-auto mt-[11vh]"
                initial={{ opacity: 0, scale: 0.6, y: -24 }}
                animate={{ opacity: 1, scale: 1, y: 0, transition: { delay: 0.14, duration: 0.65, ease: EASE } }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.25 } }}
                style={{ width: "min(64vw, 38vh)", aspectRatio: "1" }}
              >
                <ApertureLens
                  angle={phase === "exiting" ? SEALED : OPEN - scrollPulse * 26}
                  ringRotate={20 + active * 4 + scrollPulse * 6}
                  progress={{ index: active, total: PRIMARY_NAV.length }}
                  duration={phase === "exiting" ? 0.42 : scrollPulse > 0 ? 0.3 : 0.8}
                  image={{ src: src(activeImg, 700), alt: activeImg.alt, position: objectPosition(activeImg) }}
                  className="h-full w-full"
                />
              </motion.div>

              <nav
                className="no-scrollbar mt-6 flex-1 overflow-y-auto px-8 pb-6"
                aria-label="Primary"
                onScroll={(e) => {
                  const el = e.currentTarget;
                  const last = Number(el.dataset.lastScroll ?? el.scrollTop);
                  pulse((el.scrollTop - last) * 2.2);
                  el.dataset.lastScroll = String(el.scrollTop);
                }}
              >
                <ul>
                  {PRIMARY_NAV.map((item, i) => (
                    <motion.li
                      key={item.href}
                      className="border-b border-chalk/10"
                      initial={{ opacity: 0, y: 14 }}
                      animate={{
                        opacity: phase === "exiting" ? 0 : 1,
                        y: 0,
                        transition: { delay: 0.24 + i * 0.03, duration: 0.5, ease: EASE },
                      }}
                    >
                      <Link
                        href={item.href}
                        onClick={(e) => {
                          e.preventDefault();
                          setActive(i);
                          navigate(item.href, item.label);
                        }}
                        onTouchStart={() => setActive(i)}
                        aria-current={pathname === item.href ? "page" : undefined}
                        className="flex items-baseline gap-4 py-3"
                      >
                        <span
                          className={`font-sans text-[0.6rem] tabular-nums tracking-micro ${
                            i === active ? "text-champagne" : "text-chalk/35"
                          }`}
                        >
                          {item.index}
                        </span>
                        <span
                          className="font-serif text-chalk"
                          style={{ fontSize: "clamp(26px, 6.4vw, 34px)", opacity: i === active ? 1 : 0.62 }}
                        >
                          {item.label}
                        </span>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </nav>
              <div className="flex justify-center pb-8 pt-2">
                <ThemeToggle className="text-chalk/70" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
