import { createContext, useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { portalFetch } from "./api.js";

const PortalContext = createContext(null);

export function usePortal() {
  return useContext(PortalContext);
}

export function PortalAuth({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("hwmc-portal-token");
    if (!token) {
      setReady(true);
      return;
    }
    portalFetch("/api/portal/me")
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("hwmc-portal-token");
        setUser(null);
      })
      .finally(() => setReady(true));
  }, []);

  if (!ready) return <p className="portal-wait">Opening the desk…</p>;
  if (!user) return <Navigate to="/portal/login" replace />;

  return <PortalContext.Provider value={{ user, setUser }}>{children}</PortalContext.Provider>;
}
