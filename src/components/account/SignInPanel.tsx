"use client";

import { useState } from "react";
import { Loader2, Mail, ShieldCheck } from "lucide-react";
import { ButtonNative } from "@/components/ui/Button";
import { Field, fieldClass } from "@/components/ui/Field";
import { requestCustomerCode } from "@/lib/customerApi";
import { useCustomerAuth } from "@/components/account/CustomerAuthProvider";
import { cn } from "@/lib/utils";

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

type Props = {
  initialEmail?: string;
  onSignedIn?: () => void;
};

export function SignInPanel({ initialEmail = "", onSignedIn }: Props) {
  const { loginWithCredentials } = useCustomerAuth();
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function sendCode(e?: React.FormEvent) {
    e?.preventDefault();
    setError("");
    setInfo("");
    if (!emailOk(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setBusy(true);
    try {
      const res = await requestCustomerCode(email.trim());
      setStep("code");
      setInfo(res.message || "Check your email for a sign-in code.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send code.");
    } finally {
      setBusy(false);
    }
  }

  async function verify(e?: React.FormEvent) {
    e?.preventDefault();
    setError("");
    if (!code.trim()) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    setBusy(true);
    try {
      await loginWithCredentials({
        email: email.trim(),
        code: code.trim(),
      });
      onSignedIn?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid or expired code.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-[1.25rem] border border-border bg-white p-7 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-9">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-pastel-sky/35 text-pastel-link">
          {step === "email" ? (
            <Mail size={22} strokeWidth={2.25} aria-hidden />
          ) : (
            <ShieldCheck size={22} strokeWidth={2.25} aria-hidden />
          )}
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-ink md:text-[1.65rem]">
          {step === "email" ? "Sign in to your account" : "Enter your code"}
        </h2>
        <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-soft">
          {step === "email"
            ? "Use the email from your order — we’ll send a one-time code. No password to remember."
            : `We sent a 6-digit code to ${email}. It expires in 15 minutes.`}
        </p>

        {step === "email" ? (
          <form onSubmit={sendCode} className="mt-7 space-y-4">
            <Field label="Email" htmlFor="account-email" required>
              <input
                id="account-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={fieldClass}
                placeholder="you@company.com"
              />
            </Field>
            {error ? (
              <p className="text-sm font-medium text-red-600" role="alert">
                {error}
              </p>
            ) : null}
            <ButtonNative
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={busy}
              arrow={!busy}
            >
              {busy ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Sending…
                </>
              ) : (
                "Email me a code"
              )}
            </ButtonNative>
          </form>
        ) : (
          <form onSubmit={verify} className="mt-7 space-y-4">
            <Field label="One-time code" htmlFor="account-code" required>
              <input
                id="account-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className={cn(fieldClass, "tracking-[0.35em]")}
                placeholder="••••••"
              />
            </Field>
            {info ? (
              <p className="text-sm text-ink-soft">{info}</p>
            ) : null}
            {error ? (
              <p className="text-sm font-medium text-red-600" role="alert">
                {error}
              </p>
            ) : null}
            <ButtonNative
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={busy}
              arrow={!busy}
            >
              {busy ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </ButtonNative>
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-sm">
              <button
                type="button"
                className="font-semibold text-pastel-link hover:underline"
                onClick={() => {
                  setStep("email");
                  setCode("");
                  setError("");
                  setInfo("");
                }}
              >
                Use a different email
              </button>
              <button
                type="button"
                className="font-semibold text-ink hover:underline disabled:opacity-50"
                disabled={busy}
                onClick={() => void sendCode()}
              >
                Resend code
              </button>
            </div>
          </form>
        )}
      </div>
      <p className="mt-5 text-center text-xs leading-relaxed text-ink-soft">
        Secure, passwordless sign-in. Sessions are stored server-side and expire
        automatically. We’ll only show orders placed with this email.
      </p>
    </div>
  );
}
