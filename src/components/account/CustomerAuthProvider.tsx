"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clearCustomerToken,
  fetchCustomerMe,
  getCustomerToken,
  logoutCustomer,
  setCustomerToken,
  type CustomerUser,
  verifyCustomerLogin,
} from "@/lib/customerApi";

type CustomerAuthState = {
  user: CustomerUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  refresh: () => Promise<void>;
  loginWithCredentials: (input: {
    email: string;
    code?: string;
    token?: string;
  }) => Promise<CustomerUser>;
  logout: () => Promise<void>;
  setUser: (user: CustomerUser | null) => void;
};

const CustomerAuthContext = createContext<CustomerAuthState | null>(null);

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = getCustomerToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await fetchCustomerMe();
      setUser(data.user);
    } catch {
      clearCustomerToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const loginWithCredentials = useCallback(
    async (input: { email: string; code?: string; token?: string }) => {
      const data = await verifyCustomerLogin(input);
      setCustomerToken(data.token);
      setUser(data.user);
      setLoading(false);
      return data.user;
    },
    [],
  );

  const logout = useCallback(async () => {
    await logoutCustomer();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      refresh,
      loginWithCredentials,
      logout,
      setUser,
    }),
    [user, loading, refresh, loginWithCredentials, logout],
  );

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) {
    throw new Error("useCustomerAuth must be used within CustomerAuthProvider");
  }
  return ctx;
}
