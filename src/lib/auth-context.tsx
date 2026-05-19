"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { USERS } from "./mock-data";
import type { User } from "./types";

interface AuthContextValue {
  user: User | null;
  login: (email: string) => boolean;
  logout: () => void;
  isAdmin: boolean;
  canApprove: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "o2h_travel_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const found = USERS.find((u) => u.userId === stored);
      if (found) setUser(found);
    }
    setReady(true);
  }, []);

  const login = useCallback((email: string) => {
    const found = USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (!found) return false;
    setUser(found);
    localStorage.setItem(STORAGE_KEY, found.userId);
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAdmin: user?.role === "admin",
        canApprove:
          user?.role === "admin" ||
          user?.role === "hod" ||
          user?.role === "finance" ||
          user?.role === "manager",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
