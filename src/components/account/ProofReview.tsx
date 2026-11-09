"use client";

import { useState } from "react";
import { respondToOrderProof, type CustomerOrder } from "@/lib/customerApi";

type Props = {
  order: CustomerOrder;
  onUpdated: (order: CustomerOrder) => void;
};

export function ProofReview({ order, onUpdated }: Props) {
  const proof = order.proof;
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!proof?.mockup?.url && !proof?.sewOut?.url) return null;
  if (proof.status === "draft") return null;

  const waiting =
    proof.status === "sent" || proof.status === "changes_requested";

  async function respond(decision: "approve" | "changes") {
    setBusy(true);
    setError("");
    try {
      const data = await respondToOrderProof(order.id, { decision, note });
      onUpdated(data.orderRequest);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save that");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-5 rounded-xl border border-border bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-soft">
        Mockup and sew out
      </p>
      <p className="mt-1 text-sm text-ink">
        {proof.status === "approved"
          ? "You approved this. We’re getting it into production."
          : proof.status === "changes_requested"
            ? "We have your notes and will send an updated proof."
            : "Review these before we start production."}
      </p>
      {proof.note ? (
        <p className="mt-2 text-sm text-ink-soft">{proof.note}</p>
      ) : null}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <ProofImage label="Mockup" url={proof.mockup?.url} />
        <ProofImage label="Sew out" url={proof.sewOut?.url} />
      </div>
      {waiting ? (
        <div className="mt-4 space-y-3">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Optional note if something needs to change"
            className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ink/15"
          />
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void respond("approve")}
              className="h-10 rounded-lg bg-ink px-4 text-sm font-semibold text-white disabled:opacity-50"
            >
              Approve
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void respond("changes")}
              className="h-10 rounded-lg border border-border px-4 text-sm font-semibold text-ink disabled:opacity-50"
            >
              Request changes
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ProofImage({ label, url }: { label: string; url?: string }) {
  if (!url) return null;
  const image = /\.(png|jpe?g|webp|gif)(\?|$)/i.test(url);
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="overflow-hidden rounded-lg border border-border bg-canvas"
    >
      <p className="px-3 pt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
        {label}
      </p>
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={label} className="mt-2 h-44 w-full object-contain" />
      ) : (
        <p className="px-3 py-8 text-sm font-semibold text-ink">Open {label}</p>
      )}
    </a>
  );
}
