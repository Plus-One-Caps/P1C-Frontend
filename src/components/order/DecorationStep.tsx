"use client";

import { useState } from "react";
import { Check, FileImage, Loader2, UploadCloud, X } from "lucide-react";
import type { DecorationMethod } from "@/lib/catalog";
import { normalizeMethodId } from "@/lib/catalog";
import { decorationShowcase, pricingDecorationMethods } from "@/data/site";
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
  /** Optional side/back locations only (not front). */
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

function methodMeta(id: string) {
  const n = normalizeMethodId(id);
  return (
    pricingDecorationMethods.find((m) => m.id === n) ||
    decorationShowcase.find((m) => m.id === n) ||
    null
  );
}

function Section({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[var(--radius-md)] border border-border bg-white p-5 sm:p-6">
      <div className="mb-5">
        {eyebrow ? (
          <p className="text-[0.8125rem] font-bold uppercase tracking-[0.12em] text-ink-soft">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-1 text-lg font-bold tracking-tight text-ink sm:text-xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1.5 text-sm text-ink-soft">{subtitle}</p>
        ) : null}
      </div>
      {children}
    </section>
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
  const active =
    methods.find((m) => m.id === methodId) || methods[0] || null;
  const isEmbroidery =
    active && normalizeMethodId(active.id).includes("embroidery");
  const isScreen = active && normalizeMethodId(active.id) === "screenprint";

  function selectThread(name: string) {
    const already = preferredThreads.includes(name);
    if (activeThread === name) {
      setActiveThread(null);
      return;
    }
    setActiveThread(name);
    if (!already) onToggleThread(name);
  }

  const optionalLocs = (active?.locations || []).filter(
    (loc) =>
      !/^(front panel|front cuff|above cuff)$/i.test(String(loc).trim()),
  );

  const qty = Math.max(totalQty, 1);
  const activeStyle = embroideryStyles.find((s) => s.id === embroideryStyle);
  const activeFront = frontPlacements.find((p) => p.id === frontPlacement);

  let nextEyebrow = 2;

  return (
    <div className="space-y-5">
      <Section
        eyebrow="01"
        title="Decoration method"
        subtitle="How should your logo go on the hat?"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {methods.map((m) => {
            const selected = m.id === active?.id;
            const meta = methodMeta(m.id);
            return (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onMethodChange(m.id)}
                className={cn(
                  "flex items-start justify-between gap-3 rounded-[var(--radius-md)] border bg-white px-4 py-4 text-left transition-colors",
                  selected
                    ? "border-ink ring-2 ring-ink/20"
                    : "border-border hover:border-ink/40",
                )}
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-ink">{m.label}</p>
                  {meta && "delta" in meta && meta.delta ? (
                    <p className="mt-1 text-xs text-ink-soft">{meta.delta}</p>
                  ) : meta && "line" in meta && meta.line ? (
                    <p className="mt-1 text-xs text-ink-soft line-clamp-2">
                      {meta.line}
                    </p>
                  ) : null}
                </div>
                <span
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                    selected ? "border-ink bg-ink" : "border-border",
                  )}
                >
                  {selected ? (
                    <Check size={12} strokeWidth={3} className="text-white" />
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      </Section>

      {isEmbroidery ? (
        <Section
          eyebrow={`0${nextEyebrow++}`}
          title="Embroidery style"
          subtitle={
            activeStyle
              ? `${activeStyle.name} · ${activeStyle.priceLabel}`
              : "Choose flat or raised stitch."
          }
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {embroideryStyles.map((style) => {
              const selected = style.id === embroideryStyle;
              const addOn =
                style.addOnPerHat != null ? style.addOnPerHat * qty : null;
              return (
                <button
                  key={style.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => onEmbroideryStyleChange(style.id)}
                  className={cn(
                    "flex flex-col rounded-[var(--radius-md)] border bg-white p-4 text-left transition-colors",
                    selected
                      ? "border-ink ring-2 ring-ink/20"
                      : "border-border hover:border-ink/40",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-bold text-ink">{style.name}</p>
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                        selected ? "border-ink bg-ink" : "border-border",
                      )}
                    >
                      {selected ? (
                        <Check
                          size={12}
                          strokeWidth={3}
                          className="text-white"
                        />
                      ) : null}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
                    {style.blurb}
                  </p>
                  <p
                    className={cn(
                      "mt-3 text-sm font-semibold tabular-nums",
                      style.addOnPerHat == null ? "text-ink" : "text-ink-mid",
                    )}
                  >
                    {style.priceLabel}
                    {addOn != null && totalQty > 0 ? (
                      <span className="font-medium text-ink-soft">
                        {" "}
                        · +{money(addOn)}
                      </span>
                    ) : null}
                  </p>
                </button>
              );
            })}
          </div>

          {optionalLocs.length > 0 ? (
            <div className="mt-8 border-t border-border pt-6">
              <p className="text-[0.8125rem] font-bold uppercase tracking-[0.12em] text-ink-soft">
                Additional locations
              </p>
              <p className="mt-1.5 text-sm text-ink-soft">
                Optional. Turn on a side or back logo, then upload that design
                and leave a note.
              </p>

              <ul className="mt-4 space-y-3">
                {optionalLocs.map((loc) => {
                  const on = extraLocations.includes(loc);
                  const addon = placementAddOns[loc];
                  const detail = extraLocationDetails[loc] || {};
                  const uploading = extraUploadingLoc === loc;
                  const line = addon
                    ? `+${money(addon.perHat)}/hat · +${money(addon.setup)} setup est.`
                    : "Optional add-on · quoted after mockup";
                  const totalHint =
                    addon && totalQty > 0
                      ? ` · +${money(addon.perHat * qty)}`
                      : "";

                  return (
                    <li
                      key={loc}
                      className={cn(
                        "overflow-hidden rounded-[var(--radius-md)] border bg-white transition-colors",
                        on ? "border-ink/40" : "border-border",
                      )}
                    >
                      <div className="flex items-center gap-3 px-3 py-3 sm:gap-4 sm:px-4">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-canvas sm:h-14 sm:w-14">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={
                              addon?.image || "/images/home/blank-trucker.jpg"
                            }
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-ink">{loc}</p>
                          <p className="mt-0.5 text-xs text-ink-soft">
                            {line}
                            {on ? totalHint : ""}
                          </p>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={on}
                          aria-label={`${loc} embroidery`}
                          onClick={() => onToggleExtraLocation(loc)}
                          className={cn(
                            "relative h-7 w-12 shrink-0 rounded-full transition-colors",
                            on ? "bg-ink" : "bg-border",
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

                      {on ? (
                        <div className="space-y-3 border-t border-border bg-canvas/30 px-3 py-4 sm:px-4">
                          {detail.artworkUrl || detail.preview ? (
                            <div className="flex items-center gap-3 rounded-[var(--radius-md)] border border-border bg-white p-3">
                              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-sm)] border border-border bg-white">
                                {detail.preview || detail.artworkUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={detail.preview || detail.artworkUrl}
                                    alt=""
                                    className="h-full w-full object-contain p-1"
                                  />
                                ) : (
                                  <FileImage
                                    size={18}
                                    className="text-ink-soft"
                                  />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-ink">
                                  {detail.fileName || "Artwork uploaded"}
                                </p>
                                <p className="mt-0.5 text-xs text-ink-soft">
                                  {loc} design
                                </p>
                              </div>
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
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-canvas hover:text-ink"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <label
                              className={cn(
                                "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--radius-md)] border-2 border-dashed bg-white px-4 py-6 text-center transition-colors",
                                "border-border hover:border-ink/50",
                              )}
                            >
                              {uploading ? (
                                <Loader2
                                  className="animate-spin text-ink"
                                  size={22}
                                />
                              ) : (
                                <UploadCloud className="text-ink" size={22} />
                              )}
                              <span className="text-xs font-semibold text-ink">
                                {uploading
                                  ? "Uploading…"
                                  : `Upload ${loc.toLowerCase()} design`}
                              </span>
                              <span className="text-xs text-ink-soft">
                                PNG, JPG, SVG, PDF up to 8 MB
                              </span>
                              <input
                                type="file"
                                className="sr-only"
                                accept=".png,.jpg,.jpeg,.webp,.gif,.svg,.pdf,.ai,.eps,image/*,application/pdf"
                                disabled={uploading}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  e.target.value = "";
                                  if (file) void onUploadExtraLocationArt(loc, file);
                                }}
                              />
                            </label>
                          )}

                          <div>
                            <label
                              htmlFor={`extra-note-${loc}`}
                              className="text-[0.8125rem] font-semibold uppercase tracking-[0.08em] text-ink-soft"
                            >
                              Note for {loc.toLowerCase()}
                            </label>
                            <textarea
                              id={`extra-note-${loc}`}
                              rows={2}
                              value={detail.notes || ""}
                              onChange={(e) =>
                                onExtraLocationDetailChange(loc, {
                                  notes: e.target.value,
                                })
                              }
                              placeholder={`Size, placement, or anything specific for the ${loc.toLowerCase()} logo…`}
                              className="mt-1.5 w-full resize-none rounded-[var(--radius-md)] border border-border bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink-soft/70 focus:border-ink focus:ring-2 focus:ring-ink/15"
                            />
                          </div>
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
              <p className="mt-3 text-xs leading-relaxed text-ink-soft">
                Side and back pricing is an estimate. We confirm exact cost with
                your mockup — you pay nothing today.
              </p>
            </div>
          ) : null}
        </Section>
      ) : null}

      {isEmbroidery ? (
        <Section
          eyebrow={`0${nextEyebrow++}`}
          title="Front placement"
          subtitle={
            activeFront
              ? `${activeFront.name} — ${activeFront.blurb}`
              : "Where should the main logo sit on the front panel?"
          }
        >
          <div className="grid gap-3 sm:grid-cols-3">
            {frontPlacements.map((spot) => {
              const selected = spot.id === frontPlacement;
              return (
                <button
                  key={spot.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => onFrontPlacementChange(spot.id)}
                  className={cn(
                    "flex flex-col rounded-[var(--radius-md)] border bg-white p-4 text-left transition-colors",
                    selected
                      ? "border-ink ring-2 ring-ink/20"
                      : "border-border hover:border-ink/40",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold text-ink">{spot.name}</p>
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                        selected ? "border-ink bg-ink" : "border-border",
                      )}
                    >
                      {selected ? (
                        <Check
                          size={12}
                          strokeWidth={3}
                          className="text-white"
                        />
                      ) : null}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
                    {spot.blurb}
                  </p>
                </button>
              );
            })}
          </div>
        </Section>
      ) : null}

      {isEmbroidery ? (
        <Section
          eyebrow={`0${nextEyebrow++}`}
          title="Thread colors"
          subtitle="Pick a thread, then tap the part of your logo that should stitch in that color."
        >
          <ArtworkThreadMap
            previewUrl={artworkPreview}
            fileName={artworkFileName}
            pins={threadPins}
            activeThread={activeThread}
            onActiveThreadChange={setActiveThread}
            onAddPin={onAddThreadPin}
            onRemovePin={onRemoveThreadPin}
          />

          <div className="mt-5 grid grid-cols-4 gap-2.5 sm:grid-cols-6 md:grid-cols-8">
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
                  title={
                    brushing
                      ? `${color.name} selected — tap art to place`
                      : color.name
                  }
                  aria-pressed={selected || brushing}
                  onClick={() => selectThread(color.name)}
                  className="group flex flex-col items-center gap-1.5 text-center"
                >
                  <span
                    className={cn(
                      "relative aspect-square w-full max-w-[3.25rem] rounded-[8px] border border-black/10 transition duration-200",
                      brushing
                        ? "ring-2 ring-ink shadow-md scale-[1.03]"
                        : selected
                          ? "ring-2 ring-ink/25 shadow-md"
                          : "shadow-none group-hover:shadow-md group-hover:-translate-y-px",
                    )}
                    style={{ backgroundColor: color.hex }}
                  >
                    {selected || brushing ? (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <Check
                          size={14}
                          strokeWidth={3}
                          className={cn(
                            "drop-shadow",
                            light ? "text-ink" : "text-white",
                          )}
                        />
                      </span>
                    ) : null}
                  </span>
                  <span className="w-full truncate text-xs font-medium text-ink-soft">
                    {color.name}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-5">
            <label
              htmlFor="thread-notes"
              className="text-[0.8125rem] font-semibold uppercase tracking-[0.08em] text-ink-soft"
            >
              Color notes
            </label>
            <textarea
              id="thread-notes"
              rows={3}
              value={threadNotes}
              onChange={(e) => onThreadNotesChange(e.target.value)}
              placeholder="e.g. Use Navy for the mark and White for the tagline."
              className="mt-2 w-full resize-none rounded-[var(--radius-md)] border border-border bg-canvas/40 px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink-soft/70 focus:border-ink focus:bg-white focus:ring-2 focus:ring-ink/15"
            />
            <p className="mt-2 text-xs leading-relaxed text-ink-soft">
              Optional. Color changes are limited once production is locked —
              usually one revision on runs of 6+.
            </p>
          </div>
        </Section>
      ) : null}

      {isScreen ? (
        <Section
          eyebrow={`0${nextEyebrow++}`}
          title="Ink colors"
          subtitle="How many ink colors are in your art?"
        >
          <div className="inline-flex items-center rounded-[var(--radius-md)] border border-border bg-white">
            <button
              type="button"
              aria-label="Fewer ink colors"
              onClick={() => onInkColorsChange(Math.max(1, inkColors - 1))}
              className="inline-flex h-11 w-11 items-center justify-center text-ink-soft hover:text-ink"
            >
              −
            </button>
            <span className="min-w-12 border-x border-border px-3 text-center text-base font-bold tabular-nums">
              {inkColors}
            </span>
            <button
              type="button"
              aria-label="More ink colors"
              onClick={() => onInkColorsChange(Math.min(8, inkColors + 1))}
              className="inline-flex h-11 w-11 items-center justify-center text-ink-soft hover:text-ink"
            >
              +
            </button>
          </div>
        </Section>
      ) : null}

      {/* Non-embroidery optional locations (leather/PVC/etc.) */}
      {!isEmbroidery && active && optionalLocs.length > 0 ? (
        <Section
          eyebrow={`0${nextEyebrow++}`}
          title="Additional locations"
          subtitle="Optional. Add a back or side logo if you need it."
        >
          <ul className="divide-y divide-border overflow-hidden rounded-[var(--radius-md)] border border-border">
            {optionalLocs.map((loc) => {
              const on = extraLocations.includes(loc);
              const addon = placementAddOns[loc];
              const line = addon
                ? `+${money(addon.perHat)}/hat · +${money(addon.setup)} setup est.`
                : "Optional add-on · quoted after mockup";
              return (
                <li
                  key={loc}
                  className="flex items-center gap-3 bg-white px-3 py-3 sm:gap-4 sm:px-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-ink">{loc}</p>
                    <p className="mt-0.5 text-xs text-ink-soft">{line}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={on}
                    aria-label={`${loc}`}
                    onClick={() => onToggleExtraLocation(loc)}
                    className={cn(
                      "relative h-7 w-12 shrink-0 rounded-full transition-colors",
                      on ? "bg-ink" : "bg-border",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform",
                        on ? "left-[1.35rem]" : "left-0.5",
                      )}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </Section>
      ) : null}

      <Section
        eyebrow={`0${nextEyebrow}`}
        title="Decoration notes"
        subtitle="Anything else we should know before the mockup."
      >
        <textarea
          id="decoration-notes"
          rows={4}
          value={decorationNotes}
          onChange={(e) => onDecorationNotesChange(e.target.value)}
          placeholder="Sizing, placement tweaks, deadline context, or how you want the logo to feel…"
          className="w-full resize-none rounded-[var(--radius-md)] border border-border bg-canvas/40 px-4 py-3.5 text-sm leading-relaxed text-ink outline-none transition placeholder:text-ink-soft/70 focus:border-ink focus:bg-white focus:ring-2 focus:ring-ink/15"
        />
      </Section>
    </div>
  );
}
