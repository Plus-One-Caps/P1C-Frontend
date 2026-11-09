import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "onDark" | "sky";
type Size = "sm" | "md" | "lg";

/**
 * Blanks-aligned pills:
 * - every variant keeps a 1px border
 * - solid charcoal hover lightens; outline hover fills charcoal
 * - trailing arrow slides +3px on hover (like `.button-icon`)
 */
const variants: Record<Variant, string> = {
  primary:
    "border border-ink-mid bg-ink-mid text-white hover:border-[#454a4e] hover:bg-[#454a4e]",
  secondary:
    "border border-ink bg-ink text-white hover:border-[#454a4e] hover:bg-[#454a4e]",
  outline:
    "border border-ink-mid bg-white text-ink-mid hover:border-[#454a4e] hover:bg-[#454a4e] hover:text-white",
  ghost:
    "border border-ink-mid/40 bg-transparent text-ink hover:border-ink-mid hover:bg-ink-mid hover:text-white",
  onDark:
    "border border-white bg-transparent text-white hover:border-white hover:bg-white hover:text-ink",
  sky: "border border-pastel-sky bg-pastel-sky text-ink hover:border-pastel-sky-hover hover:bg-pastel-sky-hover",
};

const sizes: Record<Size, string> = {
  sm: "min-h-10 gap-[0.35rem] px-4 py-2 text-sm",
  md: "min-h-11 gap-[0.45rem] px-6 py-2.5 text-[1rem]",
  lg: "min-h-12 gap-[0.45rem] px-7 py-3 text-[1rem]",
};

const base =
  "inline-flex items-center justify-center rounded-full font-semibold no-underline shadow-none transition-[background,color,border-color] duration-150";

function ButtonArrow({ className }: { className?: string }) {
  return (
    <ArrowRight
      size={16}
      strokeWidth={2.25}
      aria-hidden
      className={cn(
        "button-icon shrink-0 will-change-transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-[5px] group-focus-visible:translate-x-[5px]",
        className,
      )}
    />
  );
}

type ButtonProps = React.ComponentProps<typeof Link> & {
  variant?: Variant;
  size?: Size;
  /** Trailing arrow with Blanks-style hover slide. Default true. */
  arrow?: boolean;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  arrow = true,
  children,
  ...props
}: ButtonProps) {
  return (
    <Link
      className={cn("group", base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
      {arrow ? <ButtonArrow /> : null}
    </Link>
  );
}

type NativeButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  arrow?: boolean;
};

export function ButtonNative({
  className,
  variant = "primary",
  size = "md",
  arrow = false,
  children,
  ...props
}: NativeButtonProps) {
  return (
    <button
      className={cn(
        "group",
        base,
        variants[variant],
        sizes[size],
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
      {arrow ? <ButtonArrow /> : null}
    </button>
  );
}
