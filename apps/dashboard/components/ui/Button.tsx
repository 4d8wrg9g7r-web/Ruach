import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded font-medium transition-all duration-180 disabled:cursor-not-allowed disabled:opacity-50";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "text-white bg-[linear-gradient(135deg,#b77935_0%,#d2a266_55%,#9b612b_100%)] hover:brightness-105 shadow-panel",
  secondary: "border border-border-strong bg-surface text-ink hover:bg-surface-muted",
  ghost: "text-ink-secondary hover:bg-surface-muted hover:text-ink",
  danger: "border border-danger/30 bg-danger-bg text-danger hover:bg-danger/10",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-sm",
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
