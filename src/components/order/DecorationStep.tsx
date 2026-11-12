"use client";

import { useState } from "react";
import {
  Check,
  ChevronDown,
  FileImage,
  Loader2,
  UploadCloud,
  X,
} from "lucide-react";
import type { DecorationMethod } from "@/lib/catalog";
import { normalizeMethodId } from "@/lib/catalog";
import { pricingDecorationMethods } from "@/data/site";
import {
  embroideryStyles,
  frontPlacements,
  placementAddOns,
  threadColors,
  type EmbroideryStyleId,
  type ExtraLocationDetail,
  type FrontPlacementId,
  type ThreadArtPin,
} from "@/data/decorationOptions";
import { ArtworkThreadMap } from "@/components/order/ArtworkThreadMap";
import { cn } from "@/lib/utils";

type Props = {
  methods: DecorationMethod[];
  methodId: string;
  onMethodChange: (id: string) => void;
  frontPlacement: FrontPlacementId;
  onFrontPlacementChange: (id: FrontPlacementId) => void;
  extraLocations: string[];
  onToggleExtraLocation: (loc: string) => void;
  extraLocationDetails: Record<string, ExtraLocationDetail>;
  onExtraLocationDetailChange: (
    loc: string,
    patch: Partial<ExtraLocationDetail> | null,
  ) => void;
  onUploadExtraLocationArt: (loc: string, file: File) => Promise<void>;
  extraUploadingLoc?: string | null;
  embroideryStyle: EmbroideryStyleId;
  onEmbroideryStyleChange: (id: EmbroideryStyleId) => void;
  preferredThreads: string[];
  onToggleThread: (name: string) => void;
  threadPins: ThreadArtPin[];
  onAddThreadPin: (pin: Omit<ThreadArtPin, "id">) => void;
  onRemoveThreadPin: (id: string) => void;
  threadNotes: string;
  onThreadNotesChange: (value: string) => void;
  decorationNotes: string;
  onDecorationNotesChange: (value: string) => void;
  inkColors: number;
  onInkColorsChange: (n: number) => void;
  totalQty: number;
  artworkPreview?: string | null;
  artworkFileName?: string | null;
};

function money(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  });
}

function shortDelta(id: string) {
  const n = normalizeMethodId(id);
  return pricingDecorationMethods.find((m) => m.id === n)?.badge || null;
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-ink-soft">
      {children}
    </p>
  );
}

function Chip({
  selected,
  onClick,
  children,
  className,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-10 items-center justify-center rounded-full border px-3.5 text-sm font-semibold transition",
        selected
          ? "border-ink bg-ink text-white"
          : "border-[#e8eef4] bg-white text-ink hover:border-[#d1d5db]",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function DecorationStep({
  methods,
  methodId,
  onMethodChange,
  frontPlacement,
  onFrontPlacementChange,
  extraLocations,
  onToggleExtraLocation,
  extraLocationDetails,
  onExtraLocationDetailChange,
  onUploadExtraLocationArt,
  extraUploadingLoc,
  embroideryStyle,
  onEmbroideryStyleChange,
  preferredThreads,
  onToggleThread,
  threadPins,
  onAddThreadPin,
  onRemoveThreadPin,
  threadNotes,
  onThreadNotesChange,
  decorationNotes,
  onDecorationNotesChange,
  inkColors,
  onInkColorsChange,
  totalQty,
  artworkPreview,
  artworkFileName,
}: Props) {
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [moreOpen, setMoreOpen] = useState(
    () =>
      extraLocations.length > 0 ||
      preferredThreads.length > 0 ||
      threadPins.length > 0 ||
      Boolean(threadNotes.trim()) ||
      Boolean(decorationNotes.trim()),
  );

  const active = methods.find((m) => m.id === methodId) || methods[0] || null;
  const isEmbroidery =
    !!active && normalizeMethodId(active.id).includes("embroidery");
  const isScreen = !!active && normalizeMethodId(active.id) === "screenprint";

  const optionalLocs = (active?.locations || []).filter(
    (loc) =>
      !/^(front panel|front cuff|above cuff)$/i.test(String(loc).trim()),
  );

  const qty = Math.max(totalQty, 1);

  function selectThread(name: string) {
    if (activeThread === name) {
      setActiveThread(null);
      return;
    }
    setActiveThread(name);
    if (!preferredThreads.includes(name)) onToggleThread(name);
  }

  const moreSummaryBits: string[] = [];
  if (extraLocations.length) {
    moreSummaryBits.push(
      `${extraLocations.length} extra location${extraLocations.length === 1 ? "" : "s"}`,
    );
  }
  if (preferredThreads.length || threadPins.length) {
    const n = Math.max(
      preferredThreads.length,
      new Set(threadPins.map((p) => p.threadName)).size,
    );
    if (n > 0) moreSummaryBits.push(`${n} thread color${n === 1 ? "" : "s"}`);
  }
  if (decorationNotes.trim()) moreSummaryBits.push("notes");

  return (
    <div className="space-y-8">
      {/* Method */}
      <div>
        <Label>Method</Label>
        <div className="overflow-hidden rounded-2xl border border-[#e8eef4] bg-white">
          {methods.map((m, i) => {
            const selected = m.id === active?.id;
            const badge = shortDelta(m.id);
            return (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onMethodChange(m.id)}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-3.5 text-left transition",
                  i > 0 && "border-t border-[#eef2f6]",
                  selected ? "bg-canvas/70" : "hover:bg-canvas/40",
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                    selected ? "border-ink bg-ink" : "border-[#d1d5db]",
                  )}
                >
                  {selected ? (
                    <Check size={11} strokeWidth={3} className="text-white" />
                  ) : null}
                </span>
                <span className="min-w-0 flex-1 text-sm font-bold text-ink">
                  {m.label}
                </span>
                {badge ? (
                  <span className="shrink-0 text-xs font-semibold text-ink-soft">
                    {badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Embroidery essentials */}
      {isEmbroidery ? (
        <div className="space-y-6">
          <div>
            <Label>Stitch</Label>
            <div className="flex flex-wrap gap-2">
              {embroideryStyles.map((style) => {
                const addOn =
                  style.addOnPerHat != null ? style.addOnPerHat * qty : null;
                return (
                  <Chip
                    key={style.id}
                    selected={style.id === embroideryStyle}
                    onClick={() => onEmbroideryStyleChange(style.id)}
                  >
                    {style.name}
                    {style.addOnPerHat != null ? (
                      <span className="ml-1.5 opacity-70">
                        {addOn != null && totalQty > 0
                          ? `+${money(addOn)}`
                          : style.priceLabel.replace(" est.", "")}
                      </span>
                    ) : null}
                  </Chip>
                );
              })}
            </div>
          </div>

          <div>
            <Label>Front placement</Label>
            <div className="flex flex-wrap gap-2">
              {frontPlacements.map((spot) => (
                <Chip
                  key={spot.id}
                  selected={spot.id === frontPlacement}
                  onClick={() => onFrontPlacementChange(spot.id)}
                >
                  {spot.name}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {isScreen ? (
        <div>
          <Label>Ink colors</Label>
          <div className="inline-flex items-center overflow-hidden rounded-full border border-[#e8eef4] bg-white">
            <button
              type="button"
              aria-label="Fewer ink colors"
              onClick={() => onInkColorsChange(Math.max(1, inkColors - 1))}
              className="inline-flex h-10 w-10 items-center justify-center text-ink-soft hover:text-ink"
            >
              −
            </button>
            <span className="min-w-10 border-x border-[#e8eef4] px-2 text-center text-sm font-bold tabular-nums">
              {inkColors}
            </span>
            <button
              type="button"
              aria-label="More ink colors"
              onClick={() => onInkColorsChange(Math.min(8, inkColors + 1))}
              className="inline-flex h-10 w-10 items-center justify-center text-ink-soft hover:text-ink"
            >
              +
            </button>
          </div>
        </div>
      ) : null}

      {/* Optional details — one drawer */}
      <div className="border-t border-[#eef2f6] pt-6">
        <button
          type="button"
          onClick={() => setMoreOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-3 text-left"
          aria-expanded={moreOpen}
        >
          <div className="min-w-0">
            <p className="text-sm font-bold text-ink">Optional details</p>
            <p className="mt-0.5 text-sm text-ink-soft">
              {moreSummaryBits.length
                ? moreSummaryBits.join(" · ")
                : "Side/back logos, thread colors, notes"}
            </p>
          </div>
          <ChevronDown
            size={18}
            className={cn(
              "shrink-0 text-ink-soft transition-transform",
              moreOpen && "rotate-180",
            )}
          />
        </button>

        {moreOpen ? (
          <div className="mt-5 space-y-7">
            {optionalLocs.length > 0 ? (
              <div>
                <Label>Extra locations</Label>
                <ul className="space-y-2">
                  {optionalLocs.map((loc) => {
                    const on = extraLocations.includes(loc);
                    const addon = placementAddOns[loc];
                    const detail = extraLocationDetails[loc] || {};
                    const uploading = extraUploadingLoc === loc;
                    const line = addon
                      ? `+${money(addon.perHat)}/hat`
                      : "Quoted later";

                    return (
                      <li
                        key={loc}
                        className={cn(
                          "overflow-hidden rounded-xl border",
                          on ? "border-ink/20 bg-canvas/50" : "border-[#e8eef4] bg-white",
                        )}
                      >
                        <div className="flex items-center gap-3 px-3.5 py-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-ink">{loc}</p>
                            <p className="text-xs text-ink-soft">{line}</p>
                          </div>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={on}
                            aria-label={loc}
                            onClick={() => onToggleExtraLocation(loc)}
                            className={cn(
                              "relative h-7 w-12 shrink-0 rounded-full transition-colors",
                              on ? "bg-ink" : "bg-[#e8eef4]",
                            )}
                          >
                            <span
                              className={cn(
                                "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform",
                                on ? "left-[1.35rem]" : "left-0.5",
                              )}
                            />
                          </button>
                        </div>

                        {on && isEmbroidery ? (
                          <div className="space-y-2.5 border-t border-[#eef2f6] px-3.5 py-3">
                            {detail.artworkUrl || detail.preview ? (
                              <div className="flex items-center gap-2.5">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#e8eef4] bg-white">
                                  {detail.preview || detail.artworkUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={detail.preview || detail.artworkUrl}
                                      alt=""
                                      className="h-full w-full object-contain p-1"
                                    />
                                  ) : (
                                    <FileImage size={14} className="text-ink-soft" />
                                  )}
                                </div>
                                <p className="min-w-0 flex-1 truncate text-sm text-ink">
                                  {detail.fileName || "Uploaded"}
                                </p>
                                <button
                                  type="button"
                                  aria-label={`Remove ${loc} artwork`}
                                  onClick={() =>
                                    onExtraLocationDetailChange(loc, {
                                      artworkUrl: undefined,
                                      fileName: undefined,
                                      preview: undefined,
                                    })
                                  }
                                  className="text-ink-soft hover:text-ink"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            ) : (
                              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[#d1d5db] bg-white px-3 py-3 text-xs font-semibold text-ink hover:border-ink/40">
                                {uploading ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <UploadCloud size={14} />
                                )}
                                {uploading ? "Uploading…" : "Upload art"}
                                <input
                                  type="file"
                                  className="sr-only"
                                  accept=".png,.jpg,.jpeg,.webp,.gif,.svg,.pdf,.ai,.eps,image/*,application/pdf"
                                  disabled={uploading}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    e.target.value = "";
                                    if (file) {
                                      void onUploadExtraLocationArt(loc, file);
                                    }
                                  }}
                                />
                              </label>
                            )}
                          </div>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}

            {isEmbroidery ? (
              <div>
                <Label>Thread colors</Label>
                <p className="mb-3 text-sm text-ink-soft">
                  Tap a color, then tap your logo to mark where it stitches.
                </p>
                <ArtworkThreadMap
                  previewUrl={artworkPreview}
                  fileName={artworkFileName}
                  pins={threadPins}
                  activeThread={activeThread}
                  onActiveThreadChange={setActiveThread}
                  onAddPin={onAddThreadPin}
                  onRemovePin={onRemoveThreadPin}
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  {threadColors.map((color) => {
                    const selected = preferredThreads.includes(color.name);
                    const brushing = activeThread === color.name;
                    const light =
                      color.hex.toLowerCase() === "#f5f5f5" ||
                      color.hex.toLowerCase() === "#ffffff" ||
                      color.hex.toLowerCase() === "#e8ff3d";
                    return (
                      <button
                        key={color.name}
                        type="button"
                        title={color.name}
                        aria-pressed={selected || brushing}
                        onClick={() => selectThread(color.name)}
                        className={cn(
                          "relative h-8 w-8 rounded-full border border-black/10 transition",
                          brushing && "ring-2 ring-ink ring-offset-2",
                          selected && !brushing && "ring-2 ring-ink/30 ring-offset-1",
                        )}
                        style={{ backgroundColor: color.hex }}
                      >
                        {(selected || brushing) && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <Check
                              size={12}
                              strokeWidth={3}
                              className={light ? "text-ink" : "text-white"}
                            />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <textarea
                  rows={2}
                  value={threadNotes}
                  onChange={(e) => onThreadNotesChange(e.target.value)}
                  placeholder="Thread notes (optional)"
                  className="mt-3 w-full resize-none rounded-xl border border-[#e8eef4] bg-white px-3.5 py-2.5 text-base text-ink outline-none placeholder:text-ink-soft/70 focus:border-ink focus:ring-2 focus:ring-ink/10"
                />
              </div>
            ) : null}

            <div>
              <Label>Notes</Label>
              <textarea
                rows={3}
                value={decorationNotes}
                onChange={(e) => onDecorationNotesChange(e.target.value)}
                placeholder="Anything else for the mockup…"
                className="w-full resize-none rounded-xl border border-[#e8eef4] bg-white px-3.5 py-3 text-base leading-relaxed text-ink outline-none placeholder:text-ink-soft/70 focus:border-ink focus:ring-2 focus:ring-ink/10"
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
