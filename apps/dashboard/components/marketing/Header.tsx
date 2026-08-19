"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Wind } from "lucide-react";
import { buttonClasses } from "../ui/Button";
import { MobileNav } from "./MobileNav";

/**
 * Deliberately 3, not 5 -- every extra primary-nav item is a competing exit before a
 * first-time visitor has read the pitch (Linear/Superhuman/Arc all converge on a
 * minimal header). "How It Works" and "Why Ruach" aren't gone, just demoted to the
 * footer (Footer.tsx's PRODUCT_LINKS/COMPANY_LINKS) -- still one click away, not
 * fighting for space with the CTA.
 */
export const NAV_LINKS = [
  { href: "/features", label: "Features" },
  { href: "/product/prayer-wall", label: "Prayer Wall" },
  { href: "/pricing", label: "Pricing" },
];

/**
 * Starts transparent over the hero, then transitions into a warm blurred surface
 * once the page scrolls -- a plain CSS transition on background/border/backdrop-filter,
 * not framer-motion (this needs to track continuous scroll position, not a one-time
 * entrance).
 */
export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-300 ${
        scrolled ? "border-b border-border bg-[#f7f6f3]/85 backdrop-blur-md" : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">
          <Wind size={20} strokeWidth={1.75} className="text-accent" />
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-ink">Ruach</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-sm text-sm text-ink-secondary transition-colors duration-180 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login" className={buttonClasses("ghost", "sm")}>
            Sign In
          </Link>
          <Link href="/signup" className={buttonClasses("primary", "sm")}>
            Start free trial
          </Link>
        </div>

        <MobileNav />
      </div>
    </header>
  );
}
