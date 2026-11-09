import { importLibrary, setOptions } from "@googlemaps/js-api-loader";

export type ParsedAddress = {
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  formatted?: string;
  placeId?: string;
};

export type AddressCheck = {
  /** True when Google suggests a unit/suite is missing. */
  needsUnit: boolean;
  /** Soft advisory when we can't fully validate but unit is empty. */
  unitHint: string | null;
};

let configured = false;
let placesPromise: Promise<google.maps.PlacesLibrary> | null = null;

export function getMapsApiKey() {
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() || "";
}

export async function loadPlacesLibrary(): Promise<google.maps.PlacesLibrary | null> {
  const key = getMapsApiKey();
  if (!key || typeof window === "undefined") return null;

  if (!configured) {
    setOptions({
      key,
      v: "weekly",
    });
    configured = true;
  }

  if (!placesPromise) {
    placesPromise = importLibrary("places").catch((err: unknown) => {
      placesPromise = null;
      console.warn("[maps] Failed to load Google Places", err);
      throw err;
    });
  }
  return placesPromise;
}

function component(
  components: google.maps.GeocoderAddressComponent[] | undefined,
  type: string,
  short = false,
) {
  const match = components?.find((c) => c.types.includes(type));
  if (!match) return "";
  return short ? match.short_name : match.long_name;
}

export function parsePlaceResult(
  place: google.maps.places.PlaceResult,
): ParsedAddress {
  const parts = place.address_components || [];
  const streetNumber = component(parts, "street_number");
  const route = component(parts, "route");
  const subpremise = component(parts, "subpremise");
  const city =
    component(parts, "locality") ||
    component(parts, "sublocality") ||
    component(parts, "neighborhood") ||
    component(parts, "administrative_area_level_3");
  const state = component(parts, "administrative_area_level_1", true);
  const postalCode = component(parts, "postal_code");
  const line1 = [streetNumber, route].filter(Boolean).join(" ").trim();

  return {
    line1: line1 || place.name || place.formatted_address?.split(",")[0] || "",
    line2: subpremise || "",
    city,
    state,
    postalCode,
    formatted: place.formatted_address || undefined,
    placeId: place.place_id,
  };
}

/**
 * Ask Address Validation whether a unit/suite looks missing.
 * Falls back gracefully if the API isn't enabled on the key.
 */
export async function checkAddressNeedsUnit(
  address: ParsedAddress,
): Promise<AddressCheck> {
  const key = getMapsApiKey();
  if (!key) {
    return { needsUnit: false, unitHint: null };
  }
  if (address.line2.trim()) {
    return { needsUnit: false, unitHint: null };
  }

  const addressLines = [
    address.line1,
    [address.city, address.state, address.postalCode].filter(Boolean).join(" "),
  ].filter(Boolean);

  try {
    const res = await fetch(
      `https://addressvalidation.googleapis.com/v1:validateAddress?key=${encodeURIComponent(key)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: {
            regionCode: "US",
            addressLines,
          },
        }),
      },
    );

    if (!res.ok) {
      return softUnitHint(address);
    }

    const data = (await res.json()) as {
      result?: {
        address?: {
          missingComponentTypes?: string[];
          unconfirmedComponentTypes?: string[];
        };
      };
    };

    const missing = data.result?.address?.missingComponentTypes || [];
    const unconfirmed = data.result?.address?.unconfirmedComponentTypes || [];
    const needsUnit =
      missing.includes("subpremise") || unconfirmed.includes("subpremise");

    if (needsUnit) {
      return {
        needsUnit: true,
        unitHint:
          "This address looks like it needs an apartment, suite, or unit number.",
      };
    }
    return { needsUnit: false, unitHint: null };
  } catch {
    return softUnitHint(address);
  }
}

function softUnitHint(address: ParsedAddress): AddressCheck {
  if (address.line2.trim()) return { needsUnit: false, unitHint: null };
  if (address.line1 && /\d/.test(address.line1)) {
    return {
      needsUnit: false,
      unitHint:
        "If this is an apartment, suite, or unit — add it below so we can deliver correctly.",
    };
  }
  return { needsUnit: false, unitHint: null };
}
