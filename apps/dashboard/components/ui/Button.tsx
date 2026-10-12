import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-[0.01em] transition-all duration-180 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-50";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "text-white bg-[linear-gradient(135deg,var(--accent)_0%,var(--accent-light)_55%,var(--accent-dark)_100%)] hover:brightness-105 shadow-panel",
  secondary: "border-[1.5px] border-black/[.12] bg-surface text-ink hover:border-ink",
  ghost: "text-ink-secondary hover:bg-surface-muted hover:text-ink",
  danger: "border-[1.5px] border-danger/30 bg-danger-bg text-danger hover:bg-danger/10",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-[3.25rem] px-8 text-base",
};

export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md") {
  return `${BASE} ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]}`;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({ variant = "primary", size = "md", className = "", ...props }: ButtonProps) {
  return <button className={`${buttonClasses(variant, size)} ${className}`} {...props} />;
}
