"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  id?: string;
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
};

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function parseISO(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  ) {
    return null;
  }
  return date;
}

function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatDisplay(value: string) {
  const date = parseISO(value);
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function monthLabel(date: Date) {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function DatePicker({
  id,
  value,
  onChange,
  min,
  max,
  placeholder = "Select a date",
  required,
  className,
}: Props) {
  const autoId = useId();
  const inputId = id || autoId;
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const selected = parseISO(value);
  const [view, setView] = useState(() => selected || startOfDay(new Date()));

  useEffect(() => {
    if (selected) setView(new Date(selected.getFullYear(), selected.getMonth(), 1));
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const minDate = min ? parseISO(min) : null;
  const maxDate = max ? parseISO(max) : null;

  const days = useMemo(() => {
    const first = new Date(view.getFullYear(), view.getMonth(), 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(
      view.getFullYear(),
      view.getMonth() + 1,
      0,
    ).getDate();
    const cells: Array<Date | null> = [];
    for (let i = 0; i < startPad; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(new Date(view.getFullYear(), view.getMonth(), d));
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [view]);

  function isDisabled(date: Date) {
    const t = startOfDay(date).getTime();
    if (minDate && t < startOfDay(minDate).getTime()) return true;
    if (maxDate && t > startOfDay(maxDate).getTime()) return true;
    return false;
  }

  function pick(date: Date) {
    if (isDisabled(date)) return;
    onChange(toISO(date));
    setOpen(false);
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        id={inputId}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-required={required || undefined}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex min-h-12 w-full items-center gap-3 rounded-[var(--radius-md)] border bg-white px-3.5 text-left text-sm outline-none transition",
          open
            ? "border-ink ring-2 ring-ink/15"
            : "border-border hover:border-ink/40",
        )}
      >
        <Calendar size={16} className="shrink-0 text-ink-soft" aria-hidden />
        <span
          className={cn(
            "min-w-0 flex-1 truncate font-medium",
            value ? "text-ink" : "text-ink-soft",
          )}
        >
          {value ? formatDisplay(value) : placeholder}
        </span>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Choose a date"
          className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-[var(--radius-md)] border border-border bg-white p-3 shadow-[0_12px_40px_rgba(15,23,42,0.12)] sm:left-auto sm:right-0 sm:w-[19.5rem]"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() =>
                setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))
              }
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-ink-soft transition hover:border-ink hover:text-ink"
            >
              <ChevronLeft size={16} />
            </button>
            <p className="text-sm font-bold text-ink">{monthLabel(view)}</p>
            <button
              type="button"
              aria-label="Next month"
              onClick={() =>
                setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))
              }
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-ink-soft transition hover:border-ink hover:text-ink"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-1">
            {WEEKDAYS.map((d) => (
              <span
                key={d}
                className="py-1 text-center text-xs font-bold uppercase tracking-wide text-ink-soft"
              >
                {d}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((date, i) => {
              if (!date) {
                return <span key={`e-${i}`} className="aspect-square" />;
              }
              const iso = toISO(date);
              const selectedDay = value === iso;
              const disabled = isDisabled(date);
              const today = toISO(startOfDay(new Date())) === iso;
              return (
                <button
                  key={iso}
                  type="button"
                  disabled={disabled}
                  onClick={() => pick(date)}
                  className={cn(
                    "aspect-square rounded-[8px] text-sm font-semibold transition",
                    disabled && "cursor-not-allowed text-ink-soft/35",
                    !disabled &&
                      !selectedDay &&
                      "text-ink hover:bg-canvas",
                    selectedDay && "bg-ink text-white",
                    today && !selectedDay && !disabled && "ring-1 ring-ink/20",
                  )}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** Days from today (start of day) until ISO date. */
export function daysUntilISO(value: string): number | null {
  const date = parseISO(value);
  if (!date) return null;
  const today = startOfDay(new Date());
  const target = startOfDay(date);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

/** Auto timing: within 14 days → rush, otherwise standard. */
export function speedFromNeedBy(value: string): "standard" | "rush" | null {
  const days = daysUntilISO(value);
  if (days == null || days < 0) return null;
  return days <= 14 ? "rush" : "standard";
}

export function minNeedByISO(minDaysOut = 7): string {
  const d = startOfDay(new Date());
  d.setDate(d.getDate() + minDaysOut);
  return toISO(d);
}
