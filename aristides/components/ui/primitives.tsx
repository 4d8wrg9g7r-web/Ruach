import Link from "next/link";
import { clsx } from "clsx";

/**
 * Design-system primitives (§38). Small, machined, reusable. Colour is scarce;
 * hairlines and tiny technical labels carry the "expensive" feel (§39).
 */

/* ---- SectionLabel: tiny tracked technical eyebrow ------------------ */
export function SectionLabel({
  children,
  index,
  className,
}: {
  children: React.ReactNode;
  index?: string;
  className?: string;
}) {
  return (
    <div className={clsx("flex items-center gap-3", className)}>
      {index && <span className="font-mono text-[11px] text-ice">{index}</span>}
      <span className="tech-label">{children}</span>
      <span className="h-px flex-1 bg-graphite-line" />
    </div>
  );
}

/* ---- DisplayHeading: oversized grotesk display -------------------- */
export function DisplayHeading({
  children,
  as: Tag = "h2",
  size = "md",
  className,
}: {
  children: React.ReactNode;
  as?: "h1" | "h2" | "h3";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    sm: "text-display-sm",
    md: "text-display-md",
    lg: "text-display-lg",
  };
  return (
    <Tag className={clsx("font-display font-medium text-balance", sizes[size], className)}>
      {children}
    </Tag>
  );
}

/* ---- TechSpec: label / value pair with a hairline ---------------- */
export function TechSpec({
  label,
  value,
  sub,
  className,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx("border-t border-graphite-line pt-3", className)}>
      <div className="tech-label mb-1">{label}</div>
      <div className="font-display text-lg leading-tight text-chalk">{value}</div>
      {sub && <div className="mt-0.5 text-sm text-steel">{sub}</div>}
    </div>
  );
}

/* ---- ModelBadge: family glyph in a machined box ------------------ */
export function ModelBadge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center justify-center rounded-sm border border-graphite-line bg-graphite-raised px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide-tech text-steel",
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ---- Divider ----------------------------------------------------- */
export function Divider({ className }: { className?: string }) {
  return <div className={clsx("hairline", className)} />;
}

/* ---- CTAButton: primary/secondary/ghost -------------------------- */
type CTAProps = {
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  size?: "md" | "lg";
  className?: string;
  children: React.ReactNode;
  type?: "button" | "submit";
  disabled?: boolean;
};

export function CTAButton({
  href,
  onClick,
  variant = "primary",
  size = "md",
  className,
  children,
  type = "button",
  disabled,
}: CTAProps) {
  const base =
    "group relative inline-flex items-center justify-center gap-2.5 rounded-sm font-mono uppercase tracking-wide-tech transition-all duration-ui ease-mech disabled:opacity-40 disabled:pointer-events-none";
  const sizes = { md: "px-5 py-3 text-[12px]", lg: "px-7 py-4 text-[13px]" };
  const variants = {
    primary: "bg-chalk text-void hover:bg-ice hover:-translate-y-[1px]",
    secondary:
      "border border-graphite-line bg-graphite-raised/60 text-chalk hover:border-steel hover:-translate-y-[1px]",
    ghost: "text-steel hover:text-chalk",
  };
  const cls = clsx(base, sizes[size], variants[variant], className);

  const inner = (
    <>
      <span>{children}</span>
      <span
        aria-hidden
        className="translate-x-0 transition-transform duration-ui ease-mech group-hover:translate-x-1"
      >
        →
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {inner}
    </button>
  );
}

/* ---- Underline nav link (center-grow) ---------------------------- */
export function NavLink({
  href,
  children,
  onClick,
  active,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={clsx(
        "group relative py-1 font-mono text-[12px] uppercase tracking-wide-tech transition-colors duration-ui",
        active ? "text-chalk" : "text-steel hover:text-chalk",
      )}
    >
      {children}
      <span
        aria-hidden
        className={clsx(
          "absolute -bottom-0.5 left-1/2 h-px -translate-x-1/2 bg-ice transition-all duration-ui ease-mech",
          active ? "w-full" : "w-0 group-hover:w-full",
        )}
      />
    </Link>
  );
}
