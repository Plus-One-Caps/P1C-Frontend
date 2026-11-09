"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Check,
  CreditCard,
  Lock,
  Loader2,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Field, fieldClass } from "@/components/ui/Field";
import { DatePicker, minNeedByISO } from "@/components/ui/DatePicker";
import { ButtonNative } from "@/components/ui/Button";
import { useCart } from "@/components/cart/CartProvider";
import { AddressAutocomplete } from "@/components/checkout/AddressAutocomplete";
import { QtyBadge } from "@/components/checkout/QtyBadge";
import { StripePaymentForm } from "@/components/checkout/StripePaymentForm";
import {
  applyPromoCode,
  expediteForNeedBy,
  expediteOptions,
  money,
  productionDateRange,
  shippingForQty,
  type ExpediteId,
} from "@/data/checkoutOptions";
import {
  createStripePaymentIntent,
  stripePublishableKey,
  submitOrderRequest,
  validateDiscountCode,
  type OrderRequestPayload,
} from "@/lib/catalog";
import type { ParsedAddress } from "@/lib/googleMaps";
import { useCustomerAuth } from "@/components/account/CustomerAuthProvider";
import { cn } from "@/lib/utils";

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export function SecureCheckout() {
  const router = useRouter();
  const { items, hydrated, itemCount, merchandiseTotal, clear } = useCart();
  const { user, isAuthenticated } = useCustomerAuth();

  const [contact, setContact] = useState({
    email: "",
    name: "",
    phone: "",
    company: "",
    marketing: true,
  });
  const [shipping, setShipping] = useState({
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
  });
  const [profilePrefillDone, setProfilePrefillDone] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user || profilePrefillDone) return;
    setContact((prev) => ({
      ...prev,
      email: prev.email || user.email || "",
      name: prev.name || user.name || "",
      phone: prev.phone || user.phone || "",
      company: prev.company || user.company || "",
    }));
    const ship =
      user.shippingAddresses?.find(
        (a) => a.id === user.defaultShippingAddressId,
      ) ||
      user.shippingAddresses?.[0] ||
      user.address ||
      null;
    if (ship?.line1) {
      setShipping((prev) => ({
        line1: prev.line1 || ship.line1 || "",
        line2: prev.line2 || ship.line2 || "",
        city: prev.city || ship.city || "",
        state: prev.state || ship.state || "",
        postalCode: prev.postalCode || ship.postalCode || "",
      }));
    }
    setProfilePrefillDone(true);
  }, [isAuthenticated, user, profilePrefillDone]);
  const [unitHint, setUnitHint] = useState<string | null>(null);
  const [needsUnit, setNeedsUnit] = useState(false);
  const [expediteId, setExpediteId] = useState<ExpediteId>("standard");
  const [needBy, setNeedBy] = useState("");
  const [showExpedite, setShowExpedite] = useState(false);
  const [instructions, setInstructions] = useState("");
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    label: string;
    type?: string;
    amount: number;
  } | null>(null);
  const [promoError, setPromoError] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [preparingPayment, setPreparingPayment] = useState(false);
  const [successEmail, setSuccessEmail] = useState("");
  const [payment, setPayment] = useState<{
    orderRequestId: string;
    clientSecret: string;
    paymentIntentId: string;
    amount: number;
  } | null>(null);
  const paymentPrepKey = useRef("");
  const orderIdRef = useRef<string | null>(null);

  const expediteOption =
    expediteOptions.find((o) => o.id === expediteId) || expediteOptions[0];
  const standardRange = useMemo(
    () => productionDateRange(expediteOptions[0]),
    [],
  );
  const selectedRange = useMemo(
    () => productionDateRange(expediteOption),
    [expediteOption],
  );

  const expediteMarkup = useMemo(() => {
    if (merchandiseTotal <= 0 || !expediteOption.markupPercent) return 0;
    return Math.round(merchandiseTotal * expediteOption.markupPercent * 100) / 100;
  }, [merchandiseTotal, expediteOption]);

  const discountAmount = useMemo(() => {
    if (!appliedPromo) return 0;
    if (
      appliedPromo.type === "free_shipping" ||
      appliedPromo.code === "FREESHIP"
    ) {
      return 0;
    }
    return appliedPromo.amount || 0;
  }, [appliedPromo]);

  /** 100% (or full-merch) codes also waive shipping so a true $0 sandbox order is possible. */
  const fullMerchComp =
    Boolean(appliedPromo) &&
    appliedPromo?.type !== "free_shipping" &&
    discountAmount > 0 &&
    discountAmount >= merchandiseTotal - 0.001;

  const shipQuote = useMemo(() => shippingForQty(itemCount), [itemCount]);
  const shippingAmount =
    appliedPromo?.type === "free_shipping" ||
    appliedPromo?.code === "FREESHIP" ||
    fullMerchComp
      ? 0
      : shipQuote.amount;

  const total =
    Math.round(
      Math.max(
        0,
        merchandiseTotal + expediteMarkup + shippingAmount - discountAmount,
      ) * 100,
    ) / 100;

  const addressReady = Boolean(
    shipping.line1.trim() &&
      shipping.city.trim() &&
      shipping.state.trim() &&
      shipping.postalCode.trim(),
  );

  const onAddressLineChange = useCallback((line1: string) => {
    setShipping((prev) => ({ ...prev, line1 }));
    setNeedsUnit(false);
    setUnitHint(null);
  }, []);

  const onAddressResolved = useCallback(
    (
      address: ParsedAddress,
      meta: { needsUnit: boolean; unitHint: string | null },
    ) => {
      setShipping({
        line1: address.line1,
        line2: address.line2 || "",
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
      });
      setNeedsUnit(meta.needsUnit);
      setUnitHint(meta.unitHint);
      setError("");
    },
    [],
  );

  async function handleApplyPromo() {
    const apiResult = await validateDiscountCode(promoInput, merchandiseTotal);
    if (apiResult.ok) {
      setPromoError("");
      setAppliedPromo({
        code: apiResult.code,
        label: apiResult.label,
        type: apiResult.type,
        amount: apiResult.amount,
      });
      return;
    }
    // Local fallback for offline / undeployed discount API.
    const local = applyPromoCode(promoInput, merchandiseTotal);
    if (!local.ok) {
      setAppliedPromo(null);
      setPromoError(apiResult.error || local.error);
      return;
    }
    setPromoError("");
    setAppliedPromo({
      code: local.code,
      label: local.label,
      type: local.code === "FREESHIP" ? "free_shipping" : undefined,
      amount: local.amount,
    });
  }

  const checkoutReady = useMemo(() => {
    if (!items.length) return false;
    if (!emailOk(contact.email)) return false;
    if (!contact.name.trim()) return false;
    if (!addressReady) return false;
    if (needsUnit && !shipping.line2.trim()) return false;
    return true;
  }, [
    items.length,
    contact.email,
    contact.name,
    addressReady,
    needsUnit,
    shipping.line2,
  ]);

  const buildPayload = useCallback((): OrderRequestPayload | null => {
    const flatItems: NonNullable<OrderRequestPayload["items"]> = [];
    for (const item of items) {
      for (const blank of item.blanks) {
        flatItems.push({
          productId: blank.productId,
          productName: blank.productName,
          productSlug: blank.productSlug,
          imageUrl: blank.imageUrl,
          variants: blank.variants,
          decoration: {
            method: item.decoration.method,
            locations: item.decoration.locations,
            frontPlacement: item.decoration.frontPlacement,
            extraLocations: item.decoration.extraLocations,
            colors: item.decoration.colors,
            embroideryStyle: item.decoration.embroideryStyle,
            preferredThreads: item.decoration.preferredThreads,
            threadPins: item.decoration.threadPins,
            threadNotes: item.decoration.threadNotes,
            notes: item.decoration.notes,
          },
          design: {
            hasArtwork: item.design.hasArtwork,
            notes: item.design.notes,
            artworkUrl: item.design.artworkUrl,
          },
        });
      }
    }
    if (!flatItems.length) return null;

    const deliverySpeed = expediteId === "standard" ? "standard" : "rush";
    const deliveryNotes = [
      `Expedite: ${expediteOption.label}`,
      `Est. production complete: ${selectedRange.label}`,
      expediteMarkup > 0
        ? `Expedite markup: +${Math.round(expediteOption.markupPercent * 100)}% (${money(expediteMarkup)})`
        : null,
      shippingAmount > 0
        ? `Shipping estimate: ${money(shippingAmount)}`
        : `Shipping: ${shipQuote.label}`,
      appliedPromo
        ? `Promo ${appliedPromo.code}: ${appliedPromo.label}${
            discountAmount > 0 ? ` (−${money(discountAmount)})` : ""
          }`
        : null,
    ]
      .filter(Boolean)
      .join(" · ");

    return {
      items: flatItems,
      delivery: {
        speed: deliverySpeed,
        needByDate: needBy || undefined,
        notes: deliveryNotes || undefined,
      },
      shipping: {
        line1: shipping.line1.trim(),
        line2: shipping.line2.trim() || undefined,
        city: shipping.city.trim(),
        state: shipping.state.trim(),
        postalCode: shipping.postalCode.trim(),
        country: "US",
      },
      contact: {
        name: contact.name.trim(),
        email: contact.email.trim(),
        phone: contact.phone.trim() || undefined,
        company: contact.company.trim() || undefined,
      },
      specialInstructions: instructions.trim() || undefined,
      estimatedTotal: total,
      promo: appliedPromo
        ? {
            code: appliedPromo.code,
            label: appliedPromo.label,
            type: appliedPromo.type,
            amount: discountAmount,
          }
        : undefined,
      totals: {
        merchandise: merchandiseTotal,
        expedite: expediteMarkup,
        shipping: shippingAmount,
        discount: discountAmount,
        total,
      },
    };
  }, [
    items,
    expediteId,
    expediteOption.label,
    expediteOption.markupPercent,
    selectedRange.label,
    expediteMarkup,
    shippingAmount,
    shipQuote.label,
    appliedPromo,
    discountAmount,
    needBy,
    shipping,
    contact,
    instructions,
    total,
    merchandiseTotal,
  ]);

  const ensurePaymentReady = useCallback(async () => {
    if (!checkoutReady || total < 0.5) return false;
    const pk = stripePublishableKey();
    if (!pk) return false;

    const key = [
      total.toFixed(2),
      contact.email.trim().toLowerCase(),
      contact.name.trim(),
      shipping.line1.trim(),
      shipping.postalCode.trim(),
      itemCount,
      appliedPromo?.code || "",
      expediteId,
    ].join("|");

    if (payment && paymentPrepKey.current === key) return true;

    setPreparingPayment(true);
    setError("");
    try {
      let orderId = orderIdRef.current;
      if (!orderId) {
        const payload = buildPayload();
        if (!payload) {
          setError("Add at least one blank to your order.");
          return false;
        }
        const result = await submitOrderRequest(payload);
        if (!result.success || !result.orderRequest?.id) {
          setError(result.error || "Could not start checkout. Please try again.");
          return false;
        }
        orderId = result.orderRequest.id;
        orderIdRef.current = orderId;
      }

      const intent = await createStripePaymentIntent({
        orderRequestId: orderId,
        amount: total,
      });
      if (!intent.ok || !intent.clientSecret || !intent.paymentIntentId) {
        setError(
          intent.error || "Could not start payment. Please try again.",
        );
        return false;
      }

      paymentPrepKey.current = key;
      setPayment({
        orderRequestId: orderId,
        clientSecret: intent.clientSecret,
        paymentIntentId: intent.paymentIntentId,
        amount: total,
      });
      return true;
    } catch {
      setError("We could not reach the server. Check your connection and try again.");
      return false;
    } finally {
      setPreparingPayment(false);
    }
  }, [
    checkoutReady,
    total,
    contact.email,
    contact.name,
    shipping.line1,
    shipping.postalCode,
    itemCount,
    appliedPromo?.code,
    expediteId,
    payment,
    buildPayload,
  ]);

  // Open Stripe card fields on this screen once contact + shipping are ready.
  useEffect(() => {
    if (!checkoutReady || total < 0.5 || !stripePublishableKey()) return;
    const key = [
      total.toFixed(2),
      contact.email.trim().toLowerCase(),
      contact.name.trim(),
      shipping.line1.trim(),
      shipping.postalCode.trim(),
      itemCount,
      appliedPromo?.code || "",
      expediteId,
    ].join("|");
    if (paymentPrepKey.current === key && payment) return;

    const timer = window.setTimeout(() => {
      void ensurePaymentReady();
    }, 650);
    return () => window.clearTimeout(timer);
  }, [
    checkoutReady,
    total,
    contact.email,
    contact.name,
    shipping.line1,
    shipping.postalCode,
    itemCount,
    appliedPromo?.code,
    expediteId,
    payment,
    ensurePaymentReady,
  ]);

  async function placeComplimentaryOrder() {
    setError("");
    if (!checkoutReady) {
      if (!emailOk(contact.email)) setError("Enter a valid email address.");
      else if (!contact.name.trim()) setError("Enter your full name.");
      else if (!addressReady) setError("Complete your shipping address.");
      else if (needsUnit && !shipping.line2.trim()) {
        setError("Add your apartment, suite, or unit number to continue.");
      } else setError("Your cart is empty.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = buildPayload();
      if (!payload) {
        setSubmitting(false);
        setError("Add at least one blank to your order.");
        return;
      }
      const result = await submitOrderRequest(payload);
      if (!result.success || !result.orderRequest?.id) {
        setSubmitting(false);
        setError(result.error || "Could not place your order. Please try again.");
        return;
      }
      clear();
      setSuccessEmail(contact.email.trim());
      setSubmitting(false);
    } catch {
      setSubmitting(false);
      setError(
        "We could not reach the server. Check your connection and try again.",
      );
    }
  }

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <Loader2 className="animate-spin text-ink" size={28} />
      </div>
    );
  }

  if (successEmail) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <CheckoutChrome />
        <div className="flex flex-1 flex-col items-center justify-center px-5 py-16">
          <div className="mx-auto w-full max-w-lg text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ink text-white">
              <Check size={26} strokeWidth={3} />
            </div>
            <h1 className="mt-6 text-center text-3xl font-bold tracking-tight text-ink md:text-4xl">
              Order received
            </h1>
            <p className="mx-auto mt-3 max-w-md text-center text-sm text-ink-soft md:text-base">
              Confirmation is on its way to{" "}
              <span className="font-semibold text-ink">{successEmail}</span>.
              Your card was charged. We&apos;ll send a mockup next and start
              production after you approve.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <ButtonNative
                variant="secondary"
                size="lg"
                onClick={() => router.push("/order")}
              >
                Start another order
              </ButtonNative>
              <ButtonNative
                variant="outline"
                size="lg"
                arrow={false}
                onClick={() => router.push("/")}
              >
                Back to home
              </ButtonNative>
            </div>
            {!isAuthenticated ? (
              <p className="mt-8 text-center text-sm text-ink-soft">
                Want easy reorders later?{" "}
                <Link
                  href={`/account?email=${encodeURIComponent(successEmail)}`}
                  className="font-semibold text-pastel-link underline-offset-2 hover:underline"
                >
                  Create a free account with this email
                </Link>
              </p>
            ) : (
              <p className="mt-8 text-center text-sm text-ink-soft">
                <Link
                  href="/account?tab=orders"
                  className="font-semibold text-pastel-link underline-offset-2 hover:underline"
                >
                  View this order in your account →
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="min-h-screen bg-white">
        <CheckoutChrome />
        <div className="mx-auto max-w-lg px-5 py-16 text-center">
          <ShoppingBag className="mx-auto text-ink" size={28} />
          <h1 className="mt-4 text-2xl font-bold text-ink">Nothing to check out</h1>
          <p className="mt-2 text-sm text-ink-soft">
            Add a configured order to your cart first.
          </p>
          <ButtonNative
            className="mt-6"
            variant="secondary"
            size="lg"
            onClick={() => router.push("/order")}
          >
            Start your order
          </ButtonNative>
        </div>
      </div>
    );
  }

  const headerCopy =
    expediteId === "standard"
      ? `Standard estimated production complete ${standardRange.label}`
      : `${expediteOption.label} · estimated complete ${selectedRange.label}`;

  return (
    <div className="min-h-screen bg-white">
      <CheckoutChrome />

      <div className="mx-auto grid max-w-6xl lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        {/* Left — forms */}
        <div className="px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
          <div className="mx-auto max-w-xl space-y-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-soft">
                Secure checkout
              </p>
              <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-ink md:text-3xl">
                Almost there
              </h1>
              <p className="mt-1.5 text-sm text-ink-soft">
                Confirm contact, shipping, and pay on this page. Your card is
                charged today.
              </p>
            </div>

            <Section title="Contact">
              <div className="space-y-3">
                <Field
                  label="Email"
                  htmlFor="ck-email"
                  required={!isAuthenticated}
                  hint={
                    isAuthenticated
                      ? "Tied to your account — switch accounts from Account if needed."
                      : undefined
                  }
                >
                  <input
                    id="ck-email"
                    type="email"
                    autoComplete="email"
                    value={contact.email}
                    readOnly={isAuthenticated}
                    onChange={(e) => {
                      if (isAuthenticated) return;
                      setContact({ ...contact, email: e.target.value });
                    }}
                    className={cn(
                      fieldClass,
                      isAuthenticated &&
                        "cursor-default bg-canvas text-ink-soft focus:border-border focus:ring-0",
                    )}
                    placeholder="you@company.com"
                  />
                </Field>
                {!isAuthenticated ? (
                  <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink">
                    <input
                      type="checkbox"
                      checked={contact.marketing}
                      onChange={(e) =>
                        setContact({ ...contact, marketing: e.target.checked })
                      }
                      className="h-4 w-4 accent-ink"
                    />
                    Email me with news and offers
                  </label>
                ) : null}
              </div>
            </Section>

            <Section title="Ship to">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Full name" htmlFor="ck-name" required className="sm:col-span-2">
                  <input
                    id="ck-name"
                    autoComplete="name"
                    value={contact.name}
                    onChange={(e) =>
                      setContact({ ...contact, name: e.target.value })
                    }
                    className={fieldClass}
                  />
                </Field>
                <Field
                  label="Company or team (optional)"
                  htmlFor="ck-company"
                  className="sm:col-span-2"
                >
                  <input
                    id="ck-company"
                    autoComplete="organization"
                    value={contact.company}
                    onChange={(e) =>
                      setContact({ ...contact, company: e.target.value })
                    }
                    className={fieldClass}
                  />
                </Field>
                <Field label="Address" htmlFor="ck-line1" required className="sm:col-span-2">
                  <AddressAutocomplete
                    id="ck-line1"
                    value={shipping.line1}
                    onChange={onAddressLineChange}
                    onResolved={onAddressResolved}
                  />
                </Field>
                <Field
                  label={
                    needsUnit
                      ? "Apartment / suite / unit"
                      : "Apartment, suite, etc. (optional)"
                  }
                  htmlFor="ck-line2"
                  required={needsUnit}
                  className="sm:col-span-2"
                >
                  <input
                    id="ck-line2"
                    autoComplete="address-line2"
                    value={shipping.line2}
                    onChange={(e) => {
                      setShipping({ ...shipping, line2: e.target.value });
                      if (e.target.value.trim()) {
                        setNeedsUnit(false);
                        setUnitHint(null);
                      }
                    }}
                    className={cn(
                      fieldClass,
                      needsUnit &&
                        !shipping.line2.trim() &&
                        "border-ink ring-2 ring-ink/15",
                    )}
                    placeholder="Apt, suite, unit…"
                  />
                </Field>
                {unitHint ? (
                  <div
                    className={cn(
                      "sm:col-span-2 flex items-start gap-2.5 rounded-[var(--radius-md)] px-3.5 py-3 text-sm",
                      needsUnit
                        ? "border border-ink bg-canvas text-ink"
                        : "border border-border bg-canvas text-ink-soft",
                    )}
                    role="status"
                  >
                    <AlertTriangle
                      size={16}
                      className="mt-0.5 shrink-0 text-ink"
                    />
                    <p>
                      <span className="font-semibold text-ink">
                        {needsUnit ? "Unit number needed. " : ""}
                      </span>
                      {unitHint}
                    </p>
                  </div>
                ) : null}
                <Field label="City" htmlFor="ck-city" required>
                  <input
                    id="ck-city"
                    autoComplete="address-level2"
                    value={shipping.city}
                    onChange={(e) =>
                      setShipping({ ...shipping, city: e.target.value })
                    }
                    className={fieldClass}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="State" htmlFor="ck-state" required>
                    <input
                      id="ck-state"
                      autoComplete="address-level1"
                      maxLength={2}
                      value={shipping.state}
                      onChange={(e) =>
                        setShipping({
                          ...shipping,
                          state: e.target.value.toUpperCase(),
                        })
                      }
                      className={fieldClass}
                    />
                  </Field>
                  <Field label="ZIP" htmlFor="ck-zip" required>
                    <input
                      id="ck-zip"
                      autoComplete="postal-code"
                      inputMode="numeric"
                      value={shipping.postalCode}
                      onChange={(e) =>
                        setShipping({ ...shipping, postalCode: e.target.value })
                      }
                      className={fieldClass}
                    />
                  </Field>
                </div>
                <Field label="Phone (optional)" htmlFor="ck-phone" className="sm:col-span-2">
                  <input
                    id="ck-phone"
                    type="tel"
                    autoComplete="tel"
                    value={contact.phone}
                    onChange={(e) =>
                      setContact({ ...contact, phone: e.target.value })
                    }
                    className={fieldClass}
                  />
                </Field>
              </div>
            </Section>

            <Section title="Shipping">
              {addressReady ? (
                <div className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-ink bg-canvas px-4 py-3.5">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-white text-ink">
                      <Truck size={16} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-ink">
                        Standard shipping
                      </p>
                      <p className="mt-0.5 text-xs text-ink-soft">
                        Based on hat qty · free at 24+
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-bold tabular-nums text-ink">
                    {shippingAmount <= 0 ? "Free" : money(shippingAmount)}
                  </p>
                </div>
              ) : (
                <div className="rounded-[var(--radius-md)] border border-dashed border-border bg-white/70 px-4 py-5 text-center text-sm text-ink-soft">
                  Enter your shipping address to see shipping.
                </div>
              )}
            </Section>

            <Section title="Production time">
              <p className="text-sm text-ink">{headerCopy}</p>
              <button
                type="button"
                onClick={() => setShowExpedite((v) => !v)}
                className="mt-3 text-sm font-semibold text-ink underline decoration-ink/25 underline-offset-4 hover:decoration-ink"
              >
                {showExpedite
                  ? "Hide expediting options"
                  : "View expediting options"}
              </button>

              {showExpedite ? (
                <div className="mt-4 space-y-4 border-t border-border pt-4">
                  <div>
                    <p className="text-sm font-bold text-ink">Need by date</p>
                    <p className="mt-1 text-sm text-ink-soft">
                      When do you need this order{" "}
                      <span className="font-semibold text-ink">in hand</span>?
                    </p>
                    <div className="mt-2 max-w-xs">
                      <DatePicker
                        id="ck-needby"
                        value={needBy}
                        min={minNeedByISO(3)}
                        placeholder="mm/dd/yyyy"
                        onChange={(value) => {
                          setNeedBy(value);
                          if (value) {
                            setExpediteId(expediteForNeedBy(value));
                            setShowExpedite(true);
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div
                    className="overflow-hidden rounded-[var(--radius-md)] border border-border"
                    role="radiogroup"
                    aria-label="Expediting level"
                  >
                    {expediteOptions.map((opt) => {
                      const range = productionDateRange(opt);
                      const selected = opt.id === expediteId;
                      const markupAmt =
                        Math.round(
                          merchandiseTotal * opt.markupPercent * 100,
                        ) / 100;
                      return (
                        <label
                          key={opt.id}
                          className={cn(
                            "flex cursor-pointer items-center gap-3 border-b border-border px-3.5 py-3.5 last:border-b-0",
                            selected && "bg-canvas",
                          )}
                        >
                          <input
                            type="radio"
                            name="expedite"
                            checked={selected}
                            onChange={() => setExpediteId(opt.id)}
                            className="h-4 w-4 accent-ink"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-medium text-ink">
                              {opt.label}
                            </span>
                            <span className="block text-xs tabular-nums text-ink-soft">
                              {range.label}
                            </span>
                          </span>
                          <span className="text-right text-sm tabular-nums">
                            <span className="font-semibold text-ink">
                              +{Math.round(opt.markupPercent * 100)}%
                            </span>
                            {opt.markupPercent > 0 && merchandiseTotal > 0 ? (
                              <span className="block text-xs text-ink-soft">
                                ({money(markupAmt)})
                              </span>
                            ) : null}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  <p className="text-xs italic leading-relaxed text-ink-soft">
                    Dates do not include transit time. We cannot guarantee
                    delivery times.
                  </p>
                </div>
              ) : null}
            </Section>

            <Section
              title="Payment"
              right={
                <span className="inline-flex items-center gap-1 text-xs font-medium text-ink-soft">
                  <Lock size={12} />
                  Secure
                </span>
              }
            >
              {total < 0.5 ? (
                <p className="text-sm text-ink-soft">
                  This order is fully covered — no card payment needed. Confirm
                  below to place it.
                </p>
              ) : payment ? (
                <div className="mt-1">
                  <p className="mb-4 text-sm text-ink-soft">
                    Enter your card to pay now. The full order total is charged
                    today.
                  </p>
                  <StripePaymentForm
                    clientSecret={payment.clientSecret}
                    publishableKey={stripePublishableKey()}
                    orderRequestId={payment.orderRequestId}
                    paymentIntentId={payment.paymentIntentId}
                    amountLabel={money(payment.amount)}
                    onSuccess={() => {
                      clear();
                      setPayment(null);
                      setSuccessEmail(contact.email.trim());
                    }}
                    onError={(message) => setError(message)}
                  />
                </div>
              ) : (
                <>
                  <p className="text-sm text-ink-soft">
                    {checkoutReady
                      ? "Preparing secure card fields…"
                      : "Complete contact and shipping above to pay on this page."}
                  </p>
                  <div className="mt-4 overflow-hidden rounded-[var(--radius-md)] border border-border bg-white">
                    <div className="flex items-center gap-2 border-b border-border bg-canvas px-4 py-3">
                      <CreditCard size={16} className="text-ink" />
                      <span className="text-sm font-semibold text-ink">
                        Credit card
                      </span>
                      <span className="ml-auto rounded-full border border-border bg-white px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-ink-soft">
                        Stripe
                      </span>
                    </div>
                    <div className="space-y-3 p-4">
                      <div className="flex items-center justify-center gap-2 rounded-[var(--radius-md)] border border-dashed border-border bg-canvas px-3 py-6 text-sm text-ink-soft">
                        {preparingPayment || (checkoutReady && total >= 0.5) ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Loading payment…
                          </>
                        ) : (
                          "Card fields appear when your details are complete"
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </Section>

            <Section title="Order notes">
              <textarea
                id="ck-notes"
                rows={3}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className={cn(fieldClass, "resize-none")}
                placeholder="Anything else for our team?"
              />
            </Section>

            {error ? (
              <p
                role="alert"
                className="rounded-[var(--radius-md)] bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </p>
            ) : null}

            {total < 0.5 ? (
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  href="/cart"
                  className="text-sm font-semibold text-ink underline decoration-ink/25 underline-offset-4"
                >
                  ← Return to cart
                </Link>
                <ButtonNative
                  variant="secondary"
                  size="lg"
                  arrow={false}
                  disabled={submitting || !checkoutReady}
                  onClick={() => void placeComplimentaryOrder()}
                  className="min-w-[12rem]"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Confirming…
                    </>
                  ) : (
                    <>
                      <Lock size={15} />
                      Confirm order
                    </>
                  )}
                </ButtonNative>
              </div>
            ) : (
              <Link
                href="/cart"
                className="inline-block pt-2 text-sm font-semibold text-ink underline decoration-ink/25 underline-offset-4"
              >
                ← Return to cart
              </Link>
            )}

            <p className="pb-8 text-center text-xs text-ink-soft lg:text-left">
              By paying you agree to our{" "}
              <Link href="/terms" className="underline">
                terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline">
                privacy policy
              </Link>
              .
            </p>
          </div>
        </div>

        {/* Right — summary */}
        <aside className="border-t border-border bg-white px-5 py-8 sm:px-8 lg:border-l lg:border-t-0 lg:px-10 lg:py-10">
          <div className="mx-auto max-w-md lg:sticky lg:top-8">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-soft">
              Order summary
            </p>

            <ul className="mt-5 space-y-4">
              {items.map((item) => {
                const thumb = item.blanks[0]?.imageUrl;
                return (
                  <li key={item.id} className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <div className="h-16 w-16 overflow-hidden rounded-[0.75rem] border border-border bg-canvas">
                        {thumb ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={thumb}
                            alt=""
                            className="h-full w-full object-contain p-1"
                          />
                        ) : null}
                      </div>
                      <QtyBadge qty={item.totalQty} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">
                        {item.title}
                      </p>
                      <p className="text-xs text-ink-soft">
                        {item.decoration.method}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold tabular-nums text-ink">
                      {money(item.merchandiseEstimate)}
                    </p>
                  </li>
                );
              })}
            </ul>

            <div className="mt-6 flex items-stretch gap-2">
              {appliedPromo ? (
                <div className="flex flex-1 items-center justify-between rounded-[var(--radius-md)] border border-border bg-white px-3 py-2.5">
                  <span className="text-sm font-semibold text-ink">
                    {appliedPromo.code}
                  </span>
                  <button
                    type="button"
                    className="text-xs font-semibold text-ink underline decoration-ink/25 underline-offset-2"
                    onClick={() => {
                      setAppliedPromo(null);
                      setPromoInput("");
                      setPromoError("");
                    }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <input
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleApplyPromo();
                      }
                    }}
                    placeholder="Discount code"
                    className={cn(fieldClass, "min-h-12 flex-1")}
                  />
                  <ButtonNative
                    type="button"
                    variant="secondary"
                    size="lg"
                    arrow={false}
                    onClick={() => void handleApplyPromo()}
                    className="shrink-0 px-6"
                  >
                    Apply
                  </ButtonNative>
                </>
              )}
            </div>
            {promoError ? (
              <p className="mt-2 text-xs text-red-600">{promoError}</p>
            ) : null}

            <dl className="mt-6 space-y-2.5 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-soft">Subtotal</dt>
                <dd className="tabular-nums text-ink">
                  {money(merchandiseTotal)}
                </dd>
              </div>
              {expediteMarkup > 0 ? (
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-soft">
                    Expedite (+
                    {Math.round(expediteOption.markupPercent * 100)}%)
                  </dt>
                  <dd className="tabular-nums text-ink">
                    {money(expediteMarkup)}
                  </dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-3">
                <dt className="text-ink-soft">Shipping</dt>
                <dd className="tabular-nums text-ink">
                  {!addressReady
                    ? "Enter address"
                    : shippingAmount <= 0
                      ? "Free"
                      : money(shippingAmount)}
                </dd>
              </div>
              {discountAmount > 0 ? (
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-soft">
                    Discount ({appliedPromo?.code})
                  </dt>
                  <dd className="tabular-nums text-ink">
                    −{money(discountAmount)}
                  </dd>
                </div>
              ) : null}
            </dl>

            <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-border pt-4">
              <span className="text-base font-bold text-ink">Total</span>
              <span className="text-2xl font-bold tabular-nums text-ink">
                <span className="mr-1.5 text-xs font-semibold text-ink-soft">
                  USD
                </span>
                {money(
                  addressReady
                    ? total
                    : merchandiseTotal + expediteMarkup - discountAmount,
                )}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Section({
  title,
  right,
  children,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1rem] border border-border bg-white p-5 shadow-[0_1px_0_rgba(15,23,42,0.03)] sm:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-bold tracking-tight text-ink">{title}</h2>
        {right}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function CheckoutChrome() {
  return (
    <header className="border-b border-border bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <span className="inline-flex rounded-md bg-white px-1.5 py-1">
          <Logo variant="header" className="scale-[0.92]" />
        </span>
        <Link
          href="/cart"
          className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-border text-ink transition hover:bg-canvas"
          aria-label="Return to cart"
        >
          <ShoppingBag size={20} strokeWidth={1.75} />
        </Link>
      </div>
    </header>
  );
}
