"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/lib/apiClient";

type User = {
  id: string;
  name: string;
  email: string;
  role: "CLIENT" | "FREELANCER" | "ADMIN";
} | null;

type AuthContextValue = {
  user: User;
  loaded: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    const data = await apiFetch("/api/auth/me");
    setUser(data.user);
    setLoaded(true);
  }, []);

  const logout = useCallback(async () => {
    await apiFetch("/api/auth/me", { method: "DELETE" });
    setUser(null);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ user, loaded, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
