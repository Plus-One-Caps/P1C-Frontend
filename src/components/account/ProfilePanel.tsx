"use client";

import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { ButtonNative } from "@/components/ui/Button";
import { Field, fieldClass } from "@/components/ui/Field";
import { AddressAutocomplete } from "@/components/checkout/AddressAutocomplete";
import { useCustomerAuth } from "@/components/account/CustomerAuthProvider";
import { updateCustomerProfile } from "@/lib/customerApi";
import type { ParsedAddress } from "@/lib/googleMaps";

export function ProfilePanel() {
  const { user, setUser } = useCustomerAuth();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [company, setCompany] = useState(user?.company || "");
  const [address, setAddress] = useState({
    line1: user?.address?.line1 || "",
    line2: user?.address?.line2 || "",
    city: user?.address?.city || "",
    state: user?.address?.state || "",
    postalCode: user?.address?.postalCode || "",
  });
  const [unitHint, setUnitHint] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setName(user?.name || "");
    setPhone(user?.phone || "");
    setCompany(user?.company || "");
    setAddress({
      line1: user?.address?.line1 || "",
      line2: user?.address?.line2 || "",
      city: user?.address?.city || "",
      state: user?.address?.state || "",
      postalCode: user?.address?.postalCode || "",
    });
  }, [user]);

  function onAddressResolved(
    parsed: ParsedAddress,
    meta: { needsUnit: boolean; unitHint: string | null },
  ) {
    setAddress({
      line1: parsed.line1 || "",
      line2: parsed.line2 || address.line2 || "",
      city: parsed.city || "",
      state: parsed.state || "",
      postalCode: parsed.postalCode || "",
    });
    setUnitHint(
      meta.needsUnit
        ? meta.unitHint || "Add suite / unit if you have one"
        : null,
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);
    if (!name.trim() || !phone.trim() || !company.trim()) {
      setError("Name, phone, and company are required.");
      return;
    }
    if (
      !address.line1.trim() ||
      !address.city.trim() ||
      !address.state.trim() ||
      !address.postalCode.trim()
    ) {
      setError("Please complete your business address.");
      return;
    }
    setBusy(true);
    try {
      const data = await updateCustomerProfile({
        name: name.trim(),
        phone: phone.trim(),
        company: company.trim(),
        address: {
          line1: address.line1.trim(),
          line2: address.line2?.trim() || null,
          city: address.city.trim(),
          state: address.state.trim(),
          postalCode: address.postalCode.trim(),
          country: "US",
        },
      });
      setUser(data.user);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save profile.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto w-full max-w-xl space-y-5 rounded-[1.25rem] border border-border bg-white p-6 md:p-8"
    >
      <div>
        <h3 className="text-lg font-bold text-ink">Profile & checkout defaults</h3>
        <p className="mt-1 text-sm text-ink-soft">
          Saved once — we’ll prefill checkout when you’re signed in. Email stays{" "}
          <span className="font-medium text-ink">{user?.email}</span>.
        </p>
      </div>

      <Field label="Full name" htmlFor="profile-name" required>
        <input
          id="profile-name"
          className={fieldClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
        />
      </Field>
      <Field label="Phone" htmlFor="profile-phone" required>
        <input
          id="profile-phone"
          className={fieldClass}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="tel"
        />
      </Field>
      <Field label="Company" htmlFor="profile-company" required>
        <input
          id="profile-company"
          className={fieldClass}
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          autoComplete="organization"
        />
      </Field>

      <div className="space-y-3 border-t border-border pt-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
          Business address
        </p>
        <AddressAutocomplete
          id="profile-line1"
          value={address.line1}
          onChange={(line1) => setAddress((a) => ({ ...a, line1 }))}
          onResolved={onAddressResolved}
        />
        <Field label="Apt / suite" htmlFor="profile-line2" hint={unitHint || undefined}>
          <input
            id="profile-line2"
            className={fieldClass}
            value={address.line2 || ""}
            onChange={(e) =>
              setAddress((a) => ({ ...a, line2: e.target.value }))
            }
            autoComplete="address-line2"
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="City" htmlFor="profile-city" required>
            <input
              id="profile-city"
              className={fieldClass}
              value={address.city}
              onChange={(e) =>
                setAddress((a) => ({ ...a, city: e.target.value }))
              }
              autoComplete="address-level2"
            />
          </Field>
          <Field label="State" htmlFor="profile-state" required>
            <input
              id="profile-state"
              className={fieldClass}
              value={address.state}
              onChange={(e) =>
                setAddress((a) => ({ ...a, state: e.target.value }))
              }
              autoComplete="address-level1"
            />
          </Field>
          <Field label="ZIP" htmlFor="profile-zip" required>
            <input
              id="profile-zip"
              className={fieldClass}
              value={address.postalCode}
              onChange={(e) =>
                setAddress((a) => ({ ...a, postalCode: e.target.value }))
              }
              autoComplete="postal-code"
            />
          </Field>
        </div>
      </div>

      {error ? (
        <p className="text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-700">
          <Check size={15} /> Profile saved
        </p>
      ) : null}

      <ButtonNative
        type="submit"
        variant="primary"
        size="lg"
        disabled={busy}
        arrow={!busy}
      >
        {busy ? (
          <>
            <Loader2 className="animate-spin" size={16} />
            Saving…
          </>
        ) : (
          "Save profile"
        )}
      </ButtonNative>
    </form>
  );
}
