import {
  fetchCurrentUser,
  loginDemoAdmin,
  type AuthUser,
} from "@/services/authService";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function bootstrapAuth() {
    try {
      await loginDemoAdmin();
      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
    } finally {
      setLoading(false);
    }
  }

  async function refreshUser() {
    const currentUser = await fetchCurrentUser();
    setUser(currentUser);
  }

  useEffect(() => {
    bootstrapAuth();
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: Boolean(user?.isAdmin),
      refreshUser,
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
