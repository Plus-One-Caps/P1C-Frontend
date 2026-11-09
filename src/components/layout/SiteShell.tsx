"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/components/cart/CartProvider";
import { CustomerAuthProvider } from "@/components/account/CustomerAuthProvider";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCheckout = pathname === "/checkout" || pathname?.startsWith("/checkout/");

  return (
    <CustomerAuthProvider>
      <CartProvider>
        <div className="flex min-h-dvh w-full flex-1 flex-col">
          {!isCheckout ? <Header /> : null}
          <main className="flex flex-1 flex-col overflow-x-clip bg-background">
            {children}
          </main>
          {!isCheckout ? <Footer /> : null}
        </div>
      </CartProvider>
    </CustomerAuthProvider>
  );
}
