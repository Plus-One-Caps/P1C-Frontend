import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
};

/** Clean page intro — quiet canvas, clear title, no cards. */
export function PageHeader({ eyebrow, title, description, className, children }: Props) {
  return (
    <section className={cn("border-b border-border bg-white", className)}>
      <Container className="py-14 md:py-20">
        <div className="max-w-2xl">
          {eyebrow && <p className="text-eyebrow text-ink">{eyebrow}</p>}
          <h1 className="mt-3 text-section-title text-ink md:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="mt-4 text-base leading-relaxed text-ink-soft md:text-lg">
              {description}
            </p>
          )}
          {children && <div className="mt-7">{children}</div>}
        </div>
      </Container>
    </section>
  );
}
