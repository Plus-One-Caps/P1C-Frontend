import { cn } from "@/lib/utils";

export function Container({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mx-auto w-full min-w-0 max-w-[96rem] px-4 sm:px-5 lg:px-6",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
