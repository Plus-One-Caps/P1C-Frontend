/** Customer account API — passwordless sessions stored in Firestore via Cloud Functions. */

const TOKEN_KEY = "poc-customer-token";

function apiBase() {
  return (
    process.env.NEXT_PUBLIC_CATALOG_API_URL || "http://localhost:4001"
  ).replace(/\/$/, "");
}

export type CustomerAddress = {
  id?: string;
  label?: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  formatted?: string | null;
  placeId?: string | null;
};

export type CustomerUser = {
  id: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  company?: string | null;
  address?: CustomerAddress | null;
  shippingAddresses?: CustomerAddress[];
  defaultShippingAddressId?: string | null;
  profileComplete?: boolean;
  createdAt?: string | null;
  lastLoginAt?: string | null;
};

export type CustomerOrderItem = {
  productId?: string;
  productName?: string;
  productSlug?: string;
  imageUrl?: string;
  variants?: Array<{
    color: { name: string; hex?: string };
    sizes: Array<{ size: string; qty: number }>;
  }>;
  decoration?: {
    method?: string;
    locations?: string[];
    frontPlacement?: string;
    extraLocations?: Array<{
      location: string;
      artworkUrl?: string;
      notes?: string;
    }>;
    colors?: number;
    embroideryStyle?: string;
    preferredThreads?: string[];
    threadPins?: Array<{
      threadName: string;
      hex: string;
      x: number;
      y: number;
    }>;
    threadNotes?: string;
    notes?: string;
  };
  design?: {
    hasArtwork?: boolean;
    notes?: string;
    artworkUrl?: string;
  };
};

export type CustomerOrder = {
  id: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  estimatedTotal?: number;
  productName?: string;
  productSlug?: string;
  imageUrl?: string;
  totalQty?: number;
  itemCount?: number;
  items?: CustomerOrderItem[];
  decoration?: CustomerOrderItem["decoration"];
  design?: CustomerOrderItem["design"];
  contact?: {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
  };
  shipping?: CustomerAddress | null;
  delivery?: {
    speed?: string;
    needByDate?: string;
    notes?: string;
  };
  specialInstructions?: string;
  payment?: {
    status?: string;
    amount?: number;
    amountCents?: number;
    captureMethod?: string;
  };
  proof?: {
    status?: string;
    note?: string;
    customerNote?: string;
    mockup?: { url?: string; fileName?: string } | null;
    sewOut?: { url?: string; fileName?: string } | null;
  };
  totals?: {
    merchandise?: number;
    expedite?: number;
    shipping?: number;
    discount?: number;
    total?: number;
  };
};

export type CustomerDesign = {
  id: string;
  artworkUrl?: string | null;
  notes?: string | null;
  hasArtwork: boolean;
  method?: string | null;
  locations?: string[];
  productNames: string[];
  orderIds: string[];
  lastUsedAt?: string | null;
  lastOrderId?: string;
  previewImageUrl?: string | null;
};

export function getCustomerToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setCustomerToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearCustomerToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

async function customerFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers || {});
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  const token = getCustomerToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${apiBase()}${path}`, { ...init, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(
      typeof data?.error === "string" ? data.error : "Request failed",
    ) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return data as T;
}

export async function requestCustomerCode(email: string) {
  return customerFetch<{
    ok: boolean;
    email: string;
    expiresAt: string;
    message?: string;
  }>("/api/customer/auth/request", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function verifyCustomerLogin(input: {
  email: string;
  code?: string;
  token?: string;
}) {
  return customerFetch<{ ok: boolean; token: string; user: CustomerUser }>(
    "/api/customer/auth/verify",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export async function fetchCustomerMe() {
  return customerFetch<{ ok: boolean; user: CustomerUser }>(
    "/api/customer/auth/me",
  );
}

export async function logoutCustomer() {
  try {
    await customerFetch<{ ok: boolean }>("/api/customer/auth/logout", {
      method: "POST",
    });
  } finally {
    clearCustomerToken();
  }
}

export async function updateCustomerProfile(profile: {
  name: string;
  phone: string;
  company: string;
  address: CustomerAddress;
}) {
  return customerFetch<{ ok: boolean; user: CustomerUser }>(
    "/api/customer/profile",
    {
      method: "PATCH",
      body: JSON.stringify(profile),
    },
  );
}

export async function fetchCustomerOrders() {
  return customerFetch<{ orderRequests: CustomerOrder[] }>(
    "/api/customer/order-requests",
  );
}

export async function fetchCustomerOrder(id: string) {
  return customerFetch<{ orderRequest: CustomerOrder }>(
    `/api/customer/order-requests/${encodeURIComponent(id)}`,
  );
}

export async function respondToOrderProof(
  id: string,
  body: { decision: "approve" | "changes"; note?: string },
) {
  return customerFetch<{ ok: boolean; orderRequest: CustomerOrder }>(
    `/api/customer/order-requests/${encodeURIComponent(id)}/proof`,
    { method: "POST", body: JSON.stringify(body) },
  );
}

export type PublicProof = {
  id: string;
  productName?: string;
  status?: string;
  proof: {
    status?: string;
    note?: string;
    customerNote?: string;
    mockup?: { url?: string; fileName?: string } | null;
    sewOut?: { url?: string; fileName?: string } | null;
    approvedAt?: string | null;
  };
};

export async function fetchPublicProof(id: string, token: string) {
  return customerFetch<{ proof: PublicProof }>(
    `/api/order-requests/${encodeURIComponent(id)}/proof?token=${encodeURIComponent(token)}`,
  );
}

export async function respondPublicProof(
  id: string,
  body: { token: string; decision: "approve" | "changes"; note?: string },
) {
  return customerFetch<{ success: boolean; status?: string; proofStatus?: string }>(
    `/api/order-requests/${encodeURIComponent(id)}/proof/respond`,
    { method: "POST", body: JSON.stringify(body) },
  );
}

export async function fetchCustomerDesigns() {
  return customerFetch<{ designs: CustomerDesign[] }>("/api/customer/designs");
}
