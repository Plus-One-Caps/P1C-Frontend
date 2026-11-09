import type { Metadata } from "next";
import { OrderWizard } from "@/components/order/OrderWizard";
import {
  fetchCatalogProducts,
  fetchDecorationMethods,
  fetchOrderBlankGroups,
} from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Start your order",
  description:
    "Build a custom hat order: pick blanks, upload artwork, choose decoration, then add to cart and check out securely.",
};

type Props = {
  searchParams: Promise<{
    hat?: string;
    method?: string;
    color?: string;
    qty?: string;
    size?: string;
    step?: string;
  }>;
};

export default async function OrderPage({ searchParams }: Props) {
  const { hat, method, color, qty, size, step } = await searchParams;
  const [products, methods] = await Promise.all([
    fetchCatalogProducts(),
    fetchDecorationMethods(),
  ]);
  const blankGroups = await fetchOrderBlankGroups(products);
  const qtyNum = qty ? Number(qty) : undefined;

  return (
    <OrderWizard
      products={products}
      methods={methods}
      blankGroups={blankGroups}
      initialHat={hat}
      initialMethod={method}
      initialColor={color}
      initialQty={
        Number.isFinite(qtyNum) && qtyNum && qtyNum > 0
          ? Math.min(5000, Math.floor(qtyNum))
          : undefined
      }
      initialSize={size}
      initialStep={step}
    />
  );
}
