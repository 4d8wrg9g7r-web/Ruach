import Link from "next/link";
import type { ReactNode } from "react";

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-editorial px-6 sm:px-8 lg:px-12 ${className}`}>
      {children}
    </div>
  );
}

export function Overline({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <p className={`overline ${className}`}>{children}</p>;
}

export function BrassRule({ className = "" }: { className?: string }) {
  return <div className={`brass-rule ${className}`} aria-hidden="true" />;
}

/** An editorial arrow link with animated brass underline. */
export function ArrowLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`link-underline font-sans text-sm uppercase tracking-wider2 text-espresso ${className}`}
    >
      <span>{children}</span>
      <span className="arrow" aria-hidden="true">
        →
      </span>
    </Link>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
}) {
  return (
    <Link href={href} className={`${variant === "primary" ? "btn-primary" : "btn-ghost"} ${className}`}>
      {children}
    </Link>
  );
}

/** Numbered section eyebrow used across editorial sections. */
export function SectionIndex({ n, label }: { n: string; label: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="font-serif text-2xl text-brass">{n}</span>
      <span className="overline">{label}</span>
    </div>
  );
}
