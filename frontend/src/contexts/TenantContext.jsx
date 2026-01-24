import React, { createContext, useState, useEffect } from "react";
import {getTenant} from "../api/tenant";

export const TenantContext = createContext();

export const TenantProvider = ({ children }) => {
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTenant = async () => {
      try {
        const data = await getTenant(); // fetch current tenant info from backend
        setTenant(data);
      } catch (err) {
        console.error("Failed to load tenant:", err);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchTenant();
  }, []);

  const refetch = async () => {
    setLoading(true);
    await fetchTenant();
  }

  return (
    <TenantContext.Provider value={{ tenant, setTenant, loading, refetch }}>
      {children}
    </TenantContext.Provider>
  );
};
