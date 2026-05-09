import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);   // { userId, email, role }
  const [loading, setLoading] = useState(true);

  // Rehydrate user from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored && stored !== "undefined") setUser(JSON.parse(stored));
    } catch (_) {
      localStorage.removeItem("user");
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data: res } = await api.post("/auth/login", { email, password });
    const { accessToken, refreshToken, userId, email: userEmail, role } = res.data;
    const user = { userId, email: userEmail, role };
    localStorage.setItem("accessToken",  accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
    return user;
  }, []);

  const register = useCallback(async (payload) => {
    const { data: res } = await api.post("/auth/register", payload);
    const { accessToken, refreshToken, userId, email: userEmail, role } = res.data;
    const user = { userId, email: userEmail, role };
    localStorage.setItem("accessToken",  accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    try {
      if (refreshToken) await api.post("/auth/logout", { refreshToken });
    } catch (_) { /* ignore */ }
    localStorage.clear();
    setUser(null);
  }, []);

  const isAdmin  = user?.role === "ADMIN";
  const isAuth   = !!user;

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, isAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
