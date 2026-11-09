"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  cartItemCount,
  cartMerchandiseTotal,
  emptyCart,
  newCartItemId,
  readCart,
  writeCart,
  type CartItem,
  type CartState,
} from "@/lib/cart";

type CartContextValue = {
  items: CartItem[];
  hydrated: boolean;
  itemCount: number;
  merchandiseTotal: number;
  addItem: (item: Omit<CartItem, "id" | "addedAt">) => CartItem;
  addItems: (items: Omit<CartItem, "id" | "addedAt">[]) => CartItem[];
  removeItem: (id: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CartState>(emptyCart);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(readCart());
    setHydrated(true);

    const sync = () => setState(readCart());
    window.addEventListener("storage", sync);
    window.addEventListener("poc-cart-change", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("poc-cart-change", sync);
    };
  }, []);

  const persist = useCallback((next: CartState) => {
    setState(next);
    writeCart(next);
  }, []);

  const addItem = useCallback(
    (draft: Omit<CartItem, "id" | "addedAt">) => {
      const item: CartItem = {
        ...draft,
        id: newCartItemId(),
        addedAt: new Date().toISOString(),
      };
      persist({ items: [...readCart().items, item] });
      return item;
    },
    [persist],
  );

  const addItems = useCallback(
    (drafts: Omit<CartItem, "id" | "addedAt">[]) => {
      const now = new Date().toISOString();
      const next = drafts.map((draft) => ({
        ...draft,
        id: newCartItemId(),
        addedAt: now,
      }));
      persist({ items: [...readCart().items, ...next] });
      return next;
    },
    [persist],
  );

  const removeItem = useCallback(
    (id: string) => {
      const current = readCart();
      persist({ items: current.items.filter((item) => item.id !== id) });
    },
    [persist],
  );

  const clear = useCallback(() => {
    persist(emptyCart());
  }, [persist]);

  const value = useMemo<CartContextValue>(
    () => ({
      items: state.items,
      hydrated,
      itemCount: cartItemCount(state.items),
      merchandiseTotal: cartMerchandiseTotal(state.items),
      addItem,
      addItems,
      removeItem,
      clear,
    }),
    [state.items, hydrated, addItem, addItems, removeItem, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
