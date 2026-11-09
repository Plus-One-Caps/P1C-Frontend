import type { Metadata } from "next";
import { SecureCheckout } from "@/components/checkout/SecureCheckout";

export const metadata: Metadata = {
  title: "Secure checkout",
  description:
    "Complete your Plus One Caps custom hat order — contact, shipping, production timing, and payment.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return <SecureCheckout />;
}
