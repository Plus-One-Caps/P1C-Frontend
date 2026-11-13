"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ButtonNative } from "@/components/ui/Button";
import { SignInPanel } from "@/components/account/SignInPanel";
import { OrdersPanel } from "@/components/account/OrdersPanel";
import { DesignsPanel } from "@/components/account/DesignsPanel";
import { ProfilePanel } from "@/components/account/ProfilePanel";
import { useCustomerAuth } from "@/components/account/CustomerAuthProvider";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "orders", label: "Orders" },
  { id: "designs", label: "Designs" },
  { id: "profile", label: "Profile" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function AccountExperience() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, isAuthenticated, loginWithCredentials, logout } =
    useCustomerAuth();

  const [tab, setTab] = useState<TabId>("orders");
  const [magicBusy, setMagicBusy] = useState(false);
  const [magicError, setMagicError] = useState("");
  const [magicHandled, setMagicHandled] = useState(false);

  const magicEmail = searchParams.get("email") || "";
  const magicToken = searchParams.get("token") || "";
  const orderHighlight = searchParams.get("order");
  const tabParam = searchParams.get("tab");

  useEffect(() => {
    if (tabParam === "orders" || tabParam === "designs" || tabParam === "profile") {
      setTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    if (magicHandled || !magicToken || !magicEmail || loading) return;
    let cancelled = false;
    (async () => {
      setMagicBusy(true);
      setMagicError("");
      try {
        await loginWithCredentials({
          email: magicEmail,
          token: magicToken,
        });
        if (!cancelled) {
          setMagicHandled(true);
          router.replace("/account");
        }
      } catch (err) {
        if (!cancelled) {
          setMagicHandled(true);
          setMagicError(
            err instanceof Error
              ? err.message
              : "This sign-in link is invalid or expired.",
          );
        }
      } finally {
        if (!cancelled) setMagicBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    magicToken,
    magicEmail,
    loading,
    magicHandled,
    loginWithCredentials,
    router,
  ]);

  const greeting = useMemo(() => {
    if (user?.name) return user.name.split(" ")[0];
    if (user?.email) return user.email.split("@")[0];
    return "there";
  }, [user]);

  if (loading || magicBusy) {
    return (
      <div className="flex min-h-[calc(100dvh-9rem)] flex-1 flex-col items-center justify-center gap-3 bg-canvas/40 text-ink-soft">
        <Loader2 className="animate-spin text-ink" size={22} />
        <p className="text-sm font-medium">
          {magicBusy ? "Signing you in…" : "Loading your account…"}
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[calc(100dvh-9rem)] flex-1 flex-col bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_42%)]">
        <Container className="flex flex-1 flex-col justify-center py-14 md:py-20">
          <div className="mx-auto mb-10 max-w-xl text-center">
            <p className="text-eyebrow text-ink">Your account</p>
            <h1 className="mt-3 text-section-title text-ink md:text-5xl">
              Orders & designs, ready to reorder
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-pretty text-ink-soft sm:text-base md:text-lg">
              Sign in with the email from your order to see past runs, reuse
              artwork with no setup fees, and kick off the same hats in a couple
              of taps.
            </p>
          </div>
          {magicError ? (
            <p className="mx-auto mb-6 max-w-md text-center text-sm font-medium text-red-600">
              {magicError}
            </p>
          ) : null}
          <SignInPanel initialEmail={magicEmail} />
        </Container>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100dvh-9rem)] flex-1 flex-col bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_28%)]">
      <Container className="flex flex-1 flex-col py-10 md:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-8">
          <div>
            <p className="text-eyebrow text-ink">Account</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-balance text-ink sm:text-3xl md:text-4xl">
              Welcome back, {greeting}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft md:text-base">
              Reorder past hats with setup waived when you reuse art, pull saved
              artwork into a new build, or update checkout details.
            </p>
          </div>
          <ButtonNative
            type="button"
            variant="outline"
            size="sm"
            arrow={false}
            onClick={() => void logout()}
          >
            <LogOut size={15} />
            Sign out
          </ButtonNative>
        </div>

        <div
          className="mt-6 flex gap-1 border-b border-border"
          role="tablist"
          aria-label="Account sections"
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => {
                setTab(t.id);
                router.replace(`/account?tab=${t.id}`, { scroll: false });
              }}
              className={cn(
                "relative shrink-0 px-4 py-3 text-sm font-semibold transition",
                tab === t.id
                  ? "text-ink"
                  : "text-ink-soft hover:text-ink",
              )}
            >
              {t.label}
              {tab === t.id ? (
                <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-ink" />
              ) : null}
            </button>
          ))}
        </div>

        <div className="mt-8 flex min-h-0 flex-1 flex-col" role="tabpanel">
          {tab === "orders" ? (
            <OrdersPanel highlightId={orderHighlight} />
          ) : null}
          {tab === "designs" ? <DesignsPanel /> : null}
          {tab === "profile" ? <ProfilePanel /> : null}
        </div>
      </Container>
    </div>
  );
}
