"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Tenant } from "@lms-mocks/types";
import { defaultTenant } from "@lms-mocks/tenant";
import { getStoredTenant, setStoredTenant } from "@lms-mocks/storage";

type TenantContextValue = {
  tenant: Tenant;
  setTenant: (tenant: Tenant) => void;
};

const TenantContext = createContext<TenantContextValue | null>(null);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenantState] = useState<Tenant>(defaultTenant);

  useEffect(() => {
    setTenantState(getStoredTenant());
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--tenant-primary", tenant.primaryColor);
    root.style.setProperty("--tenant-secondary", tenant.secondaryColor);
    root.style.setProperty("--primary", tenant.primaryColor);
  }, [tenant]);

  const setTenant = useCallback((next: Tenant) => {
    setStoredTenant(next);
    setTenantState(next);
  }, []);

  const value = useMemo(() => ({ tenant, setTenant }), [tenant, setTenant]);

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error("useTenant must be used within TenantProvider");
  return ctx;
}
