"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  fetchPublicProof,
  respondPublicProof,
  type PublicProof,
} from "@/lib/customerApi";

export default function ProofPage() {
  const params = useParams();
  const id = decodeURIComponent(String(params.id || ""));
  const [token, setToken] = useState("");
  const [proof, setProof] = useState<PublicProof | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const nextToken = new URLSearchParams(window.location.search).get("token") || "";
    setToken(nextToken);
    if (!nextToken) {
      setError("Open the approval link from your email.");
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetchPublicProof(id, nextToken)
      .then((data) => {
        if (!cancelled) setProof(data.proof);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not open this proof");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function respond(decision: "approve" | "changes") {
    setBusy(true);
    setError("");
    try {
      const result = await respondPublicProof(id, { token, decision, note });
      setDone(
        result.proofStatus === "approved"
          ? "Approved. We’ll start production from this mockup and sew out."
          : "Got it. We’ll update the proof and send it again.",
      );
      setProof((current) =>
        current
          ? {
              ...current,
              proof: { ...current.proof, status: result.proofStatus },
            }
          : current,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save that");
    } finally {
      setBusy(false);
    }
  }

  const waiting =
    proof?.proof.status === "sent" || proof?.proof.status === "changes_requested";

  return (
    <main className="min-h-screen bg-white px-5 py-12 text-ink">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-soft">
          Plus One Caps
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          {proof ? `Order ${proof.id}` : "Review your proof"}
        </h1>
        {loading ? <p className="mt-6 text-sm text-ink-soft">Loading…</p> : null}
        {error ? <p className="mt-6 text-sm text-red-700">{error}</p> : null}
        {done ? <p className="mt-6 text-sm font-semibold">{done}</p> : null}
        {proof ? (
          <>
            <p className="mt-3 text-sm text-ink-soft">
              {proof.productName}. Production starts after you approve the mockup
              and sew out.
            </p>
            {proof.proof.note ? (
              <p className="mt-3 text-sm">{proof.proof.note}</p>
            ) : null}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <ProofFrame label="Mockup" url={proof.proof.mockup?.url} />
              <ProofFrame label="Sew out" url={proof.proof.sewOut?.url} />
            </div>
            {waiting && !done ? (
              <div className="mt-6 space-y-3">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="Optional note if something needs to change"
                  className="w-full rounded-xl border border-border px-3 py-2 text-sm outline-none"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void respond("approve")}
                    className="h-11 rounded-lg bg-ink px-5 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void respond("changes")}
                    className="h-11 rounded-lg border border-border px-5 text-sm font-semibold disabled:opacity-50"
                  >
                    Request changes
                  </button>
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </main>
  );
}

function ProofFrame({ label, url }: { label: string; url?: string }) {
  if (!url) return null;
  const image = /\.(png|jpe?g|webp|gif)(\?|$)/i.test(url);
  return (
    <a href={url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl border border-border">
      <p className="px-3 pt-3 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
        {label}
      </p>
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={label} className="mt-2 h-64 w-full object-contain" />
      ) : (
        <p className="px-3 py-10 text-sm font-semibold">Open {label}</p>
      )}
    </a>
  );
}
