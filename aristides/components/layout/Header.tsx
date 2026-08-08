"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { clsx } from "clsx";
import { NavLink, CTAButton } from "@/components/ui/primitives";
import { Wordmark } from "@/components/layout/Wordmark";
import { ModelMenu } from "@/components/layout/ModelMenu";

const NAV = [
  { href: "/models", label: "Models", hasMenu: true },
  { href: "/arium", label: "Arium" },
  { href: "/build", label: "Build" },
  { href: "/gallery", label: "Gallery" },
  { href: "/artists", label: "Artists" },
  { href: "/story", label: "Story" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [modelMenu, setModelMenu] = useState(false);
  const [mobile, setMobile] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close overlays on route change
  useEffect(() => {
    setModelMenu(false);
    setMobile(false);
  }, [pathname]);

  return (
    <>
      <header
        className={clsx(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-mech",
          scrolled || modelMenu ? "frosted border-b border-graphite-line" : "bg-transparent",
        )}
      >
        <div className="shell flex h-16 items-center justify-between gap-6">
          <Link href="/" aria-label="Aristides Instruments — home" className="shrink-0">
            <Wordmark className="h-4 w-auto text-chalk" />
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {NAV.map((item) =>
              item.hasMenu ? (
                <button
                  key={item.href}
                  onMouseEnter={() => setModelMenu(true)}
                  onClick={() => setModelMenu((v) => !v)}
                  className={clsx(
                    "group relative py-1 font-mono text-[12px] uppercase tracking-wide-tech transition-colors duration-ui",
                    modelMenu ? "text-chalk" : "text-steel hover:text-chalk",
                  )}
                >
                  {item.label}
                  <span
                    aria-hidden
                    className={clsx(
                      "absolute -bottom-0.5 left-1/2 h-px -translate-x-1/2 bg-ice transition-all duration-ui ease-mech",
                      modelMenu ? "w-full" : "w-0 group-hover:w-full",
                    )}
                  />
                </button>
              ) : (
                <NavLink key={item.href} href={item.href} active={pathname === item.href}>
                  {item.label}
                </NavLink>
              ),
            )}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <NavLink href="/in-stock" active={pathname === "/in-stock"}>
              In Stock
            </NavLink>
            <CTAButton href="/build" variant="primary" size="md">
              Build Your Aristides
            </CTAButton>
          </div>

          {/* Mobile trigger */}
          <button
            className="flex h-9 w-9 items-center justify-center lg:hidden"
            aria-label="Menu"
            aria-expanded={mobile}
            onClick={() => setMobile((v) => !v)}
          >
            <div className="flex flex-col gap-1.5">
              <span className={clsx("h-px w-6 bg-chalk transition-transform", mobile && "translate-y-[7px] rotate-45")} />
              <span className={clsx("h-px w-6 bg-chalk transition-opacity", mobile && "opacity-0")} />
              <span className={clsx("h-px w-6 bg-chalk transition-transform", mobile && "-translate-y-[7px] -rotate-45")} />
            </div>
          </button>
        </div>
      </header>

      {/* Cinematic model menu */}
      <AnimatePresence>
        {modelMenu && (
          <div onMouseLeave={() => setModelMenu(false)}>
            <ModelMenu onClose={() => setModelMenu(false)} />
          </div>
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex flex-col bg-void pt-16 lg:hidden"
          >
            <nav className="shell flex flex-1 flex-col justify-center gap-1">
              {NAV.concat({ href: "/in-stock", label: "In Stock" }).map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * i }}
                >
                  <Link
                    href={item.href}
                    className="block border-b border-graphite-line py-4 font-display text-3xl"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <div className="mt-8">
                <CTAButton href="/build" variant="primary" size="lg" className="w-full">
                  Build Your Aristides
                </CTAButton>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
