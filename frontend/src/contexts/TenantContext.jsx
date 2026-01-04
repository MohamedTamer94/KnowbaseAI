import React, { createContext, useState, useEffect } from "react";
import {getTenant} from "../api/tenant";

export const TenantContext = createContext();

export const TenantProvider = ({ children }) => {
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    fetchTenant();
  }, []);

  return (
    <TenantContext.Provider value={{ tenant, setTenant, loading }}>
      {children}
    </TenantContext.Provider>
  );
};
