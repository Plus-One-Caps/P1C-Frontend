import { cn } from "@/lib/utils";

/** High-contrast qty chip — sits outside overflow-hidden image boxes. */
export function QtyBadge({
  qty,
  className,
}: {
  qty: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute -right-2 -top-2 z-10 flex h-7 min-w-7 items-center justify-center rounded-full border-2 border-ink bg-white px-1.5 text-xs font-bold tabular-nums text-ink shadow-[0_2px_8px_rgba(10,10,10,0.18)]",
        className,
      )}
    >
      {qty}
    </span>
  );
}
