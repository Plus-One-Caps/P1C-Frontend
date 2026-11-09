"use client";

import { useState } from "react";
import { ImageIcon, X } from "lucide-react";
import type { ThreadArtPin } from "@/data/decorationOptions";
import { threadColors } from "@/data/decorationOptions";
import { cn } from "@/lib/utils";

type Props = {
  previewUrl?: string | null;
  fileName?: string | null;
  pins: ThreadArtPin[];
  activeThread: string | null;
  onActiveThreadChange: (name: string | null) => void;
  onAddPin: (pin: Omit<ThreadArtPin, "id">) => void;
  onRemovePin: (id: string) => void;
  /** Compact read-only preview for the order summary. */
  readOnly?: boolean;
  className?: string;
};

function hexFor(name: string) {
  return threadColors.find((c) => c.name === name)?.hex || "#111111";
}

function isLight(hex: string) {
  const h = hex.toLowerCase();
  return h === "#f5f5f5" || h === "#ffffff" || h === "#e8ff3d" || h === "#c0c4c8";
}

export function ArtworkThreadMap({
  previewUrl,
  fileName,
  pins,
  activeThread,
  onActiveThreadChange,
  onAddPin,
  onRemovePin,
  readOnly = false,
  className,
}: Props) {
  const [hint, setHint] = useState("");

  function handleArtClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (readOnly) return;
    if (!activeThread) {
      setHint("Pick a thread color first, then tap your logo.");
      window.setTimeout(() => setHint(""), 2200);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));
    onAddPin({
      threadName: activeThread,
      hex: hexFor(activeThread),
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
    });
    setHint("");
  }

  const canMap = Boolean(previewUrl);

  return (
    <div className={cn("space-y-3", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-[var(--radius-md)] border border-border bg-white",
          readOnly ? "aspect-square max-w-[5.5rem]" : "aspect-[4/3] sm:aspect-[16/10]",
        )}
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt={fileName || "Artwork"}
            className={cn(
              "pointer-events-none h-full w-full object-contain",
              readOnly ? "p-1.5" : "p-3 sm:p-4",
            )}
            draggable={false}
          />
        ) : (
          <div className="flex h-full min-h-[7rem] flex-col items-center justify-center gap-2 px-4 text-center">
            <ImageIcon className="text-ink-soft" size={readOnly ? 18 : 28} />
            {!readOnly ? (
              <p className="text-xs text-ink-soft">
                {fileName
                  ? "Preview isn’t available for this file type. You can still pick thread colors below."
                  : "Upload artwork first to map colors onto your logo."}
              </p>
            ) : null}
          </div>
        )}

        {!readOnly && previewUrl ? (
          <button
            type="button"
            onClick={handleArtClick}
            className={cn(
              "absolute inset-0 z-[1] cursor-crosshair outline-none focus-visible:ring-2 focus-visible:ring-ink/30",
              activeThread ? "ring-1 ring-inset ring-ink/20" : "",
            )}
            aria-label={
              activeThread
                ? `Tap to place ${activeThread} on your artwork`
                : "Artwork — pick a thread color, then tap here"
            }
          />
        ) : null}

        {pins.map((pin, index) => {
          const light = isLight(pin.hex);
          return (
            <button
              key={pin.id}
              type="button"
              disabled={readOnly}
              onClick={(e) => {
                e.stopPropagation();
                if (!readOnly) onRemovePin(pin.id);
              }}
              title={
                readOnly
                  ? pin.threadName
                  : `${pin.threadName} — tap to remove`
              }
              className={cn(
                "absolute z-[2] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white shadow-md transition",
                readOnly
                  ? "pointer-events-none h-3.5 w-3.5"
                  : "h-7 w-7 hover:scale-110",
              )}
              style={{
                left: `${pin.x}%`,
                top: `${pin.y}%`,
                backgroundColor: pin.hex,
              }}
            >
              {!readOnly ? (
                <span
                  className={cn(
                    "text-xs font-bold tabular-nums",
                    light ? "text-ink" : "text-white",
                  )}
                >
                  {index + 1}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {!readOnly && canMap ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-ink-soft">
            {activeThread ? (
              <>
                Placing{" "}
                <span className="font-semibold text-ink">{activeThread}</span>
                {" — "}
                tap your logo where that thread should go
              </>
            ) : (
              "Select a thread, then tap a part of your logo"
            )}
          </p>
          {activeThread ? (
            <button
              type="button"
              onClick={() => onActiveThreadChange(null)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-ink-soft hover:text-ink"
            >
              <X size={12} /> Clear brush
            </button>
          ) : null}
        </div>
      ) : null}

      {hint ? (
        <p className="text-xs font-medium text-ink">{hint}</p>
      ) : null}

      {!readOnly && pins.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {pins.map((pin, index) => (
            <li key={pin.id}>
              <button
                type="button"
                onClick={() => onRemovePin(pin.id)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-canvas/60 py-1 pl-1.5 pr-2.5 text-xs font-medium text-ink transition hover:border-ink/40"
              >
                <span
                  className="flex h-5 w-5 items-center justify-center rounded-full border border-white text-xs font-bold text-white shadow-sm"
                  style={{
                    backgroundColor: pin.hex,
                    color: isLight(pin.hex) ? "#0a0a0a" : "#fff",
                  }}
                >
                  {index + 1}
                </span>
                {pin.threadName}
                <X size={12} className="text-ink-soft" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
