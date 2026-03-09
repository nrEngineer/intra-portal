import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { apiClient } from "../lib/api/client";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextValue {
  user: User | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  isLoggedIn: boolean;
}

function loadUserFromStorage(): User | null {
  const stored = localStorage.getItem("user");
  return stored ? JSON.parse(stored) : null;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuthState(): AuthContextValue {
  const [user, setUser] = useState<User | null>(loadUserFromStorage);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiClient.post<{ accessToken: string; refreshToken: string; user: User }>(
      "/auth/login",
      { email, password },
    );
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("userId", data.user.id);
    localStorage.setItem("userRole", data.user.role);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      await apiClient.post("/auth/logout", { refreshToken }).catch(() => {});
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  return useMemo(
    () => ({ user, isAdmin: user?.role === "admin", login, logout, isLoggedIn: !!user }),
    [user, login, logout]
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  // When used outside AuthProvider (e.g. in isolated component tests),
  // fall back to a standalone instance that reads/writes localStorage directly.
  const standalone = useAuthState();
  return ctx ?? standalone;
}
