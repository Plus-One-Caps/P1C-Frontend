"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { fieldClass } from "@/components/ui/Field";
import {
  checkAddressNeedsUnit,
  getMapsApiKey,
  loadPlacesLibrary,
  parsePlaceResult,
  type ParsedAddress,
} from "@/lib/googleMaps";
import { cn } from "@/lib/utils";

type Props = {
  id?: string;
  value: string;
  onChange: (line1: string) => void;
  onResolved: (
    address: ParsedAddress,
    meta: { needsUnit: boolean; unitHint: string | null },
  ) => void;
  className?: string;
  placeholder?: string;
};

export function AddressAutocomplete({
  id = "ck-line1",
  value,
  onChange,
  onResolved,
  className,
  placeholder = "Start typing your street address",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const onChangeRef = useRef(onChange);
  const onResolvedRef = useRef(onResolved);
  const [mapsError, setMapsError] = useState("");
  const hasKey = Boolean(getMapsApiKey());

  useEffect(() => {
    onChangeRef.current = onChange;
    onResolvedRef.current = onResolved;
  }, [onChange, onResolved]);

  useEffect(() => {
    if (!hasKey) return;
    let cancelled = false;

    void (async () => {
      try {
        const places = await loadPlacesLibrary();
        if (cancelled || !places || !inputRef.current) return;

        // Prevent browser autofill fighting Places.
        inputRef.current.setAttribute("autocomplete", "new-password");

        const ac = new places.Autocomplete(inputRef.current, {
          fields: [
            "address_components",
            "formatted_address",
            "geometry",
            "name",
            "place_id",
            "types",
          ],
          types: ["address"],
          componentRestrictions: { country: ["us"] },
        });
        autocompleteRef.current = ac;

        ac.addListener("place_changed", () => {
          const place = ac.getPlace();
          if (!place?.address_components?.length) return;
          const parsed = parsePlaceResult(place);
          onChangeRef.current(parsed.line1);
          void checkAddressNeedsUnit(parsed).then((check) => {
            onResolvedRef.current(parsed, check);
          });
        });
      } catch {
        if (!cancelled) {
          setMapsError(
            "Address search couldn’t load. You can still type your address manually.",
          );
        }
      }
    })();

    return () => {
      cancelled = true;
      if (autocompleteRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(
          autocompleteRef.current,
        );
      }
      autocompleteRef.current = null;
    };
  }, [hasKey]);

  return (
    <div className={cn(className)}>
      <div className="relative">
        <span
          className="pointer-events-none absolute left-3.5 top-1/2 z-[1] -translate-y-1/2 text-ink-soft"
          aria-hidden
        >
          <Search size={16} strokeWidth={2.25} />
        </span>
        <input
          ref={inputRef}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(fieldClass, "pl-11")}
          autoComplete="off"
        />
      </div>
      {mapsError ? (
        <p className="mt-1.5 text-xs text-ink-soft">{mapsError}</p>
      ) : hasKey ? (
        <p className="mt-1.5 text-xs text-ink-soft">
          Powered by Google — pick a suggestion to autofill city, state, and ZIP.
        </p>
      ) : (
        <p className="mt-1.5 text-xs text-ink-soft">
          Type your street address.
        </p>
      )}
    </div>
  );
}
