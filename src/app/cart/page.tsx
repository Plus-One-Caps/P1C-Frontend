import { Suspense } from "react";
import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your custom hat order before secure checkout.",
};

export default function CartPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-canvas/40 py-16 md:py-24">
          <div className="mx-auto h-40 max-w-3xl animate-pulse rounded-[var(--radius-md)] border border-border bg-white" />
        </div>
      }
    >
      <CartView />
    </Suspense>
  );
}
