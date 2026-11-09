import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Single-panel signet (not the dual-mark sheet) */
const SIGNET_SRC = "/brand/signet-header.png";
const SIGNET_ON_DARK = "/brand/logo-mark-gold-footer.png?v=2";

type LogoProps = {
  variant?: "header" | "footer" | "hero";
  className?: string;
  href?: string;
  onClick?: () => void;
};

export function Logo({ variant = "header", className, href = "/", onClick }: LogoProps) {
  const onDark = variant === "footer" || variant === "hero";
  const isHeader = variant === "header";

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-label="Plus One Caps home"
      className={cn("inline-flex shrink-0 items-center gap-0.5 md:gap-1", className)}
    >
      <Image
        src={onDark ? SIGNET_ON_DARK : SIGNET_SRC}
        alt=""
        width={112}
        height={148}
        className={cn(
          "shrink-0 object-contain object-center",
          isHeader ? "h-10 w-auto md:h-11" : "h-[3.25rem] w-auto md:h-14",
        )}
        priority={variant !== "footer"}
        unoptimized
      />
      {/* Match Plus One Blanks: Black weight, slightly open letter spacing */}
      <span
        className={cn(
          "flex flex-col justify-center font-black uppercase",
          isHeader
            ? "text-[0.8125rem] leading-[0.86] tracking-[-0.02em] md:text-[1.15rem]"
            : "text-[1.2rem] leading-[0.86] tracking-[-0.02em] md:text-[1.4rem]",
          onDark ? "text-white" : "text-ink",
        )}
        style={{ fontFamily: "var(--font-montserrat), Montserrat, sans-serif" }}
      >
        <span>Plus</span>
        <span>One</span>
        <span>Caps</span>
      </span>
    </Link>
  );
}
