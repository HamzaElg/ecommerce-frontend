import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

const readStoredUser = () => {
  try {
    const stored = localStorage.getItem("user");

    if (!stored || stored === "undefined" || stored === "null") {
      return null;
    }

    return JSON.parse(stored);
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

const clearStoredAuth = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(readStoredUser());
    setLoading(false);

    const handleForcedLogout = () => {
      setUser(null);
    };

    window.addEventListener("auth:logout", handleForcedLogout);

    return () => {
      window.removeEventListener("auth:logout", handleForcedLogout);
    };
  }, []);

  const persistAuth = (authData) => {
    if (!authData?.accessToken || !authData?.refreshToken) {
      throw new Error("Invalid authentication response from backend.");
    }

    const userData = {
      userId: authData.userId,
      email: authData.email,
      role: authData.role,
    };

    localStorage.setItem("accessToken", authData.accessToken);
    localStorage.setItem("refreshToken", authData.refreshToken);
    localStorage.setItem("user", JSON.stringify(userData));

    setUser(userData);

    return userData;
  };

  const login = useCallback(async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    return persistAuth(response.data.data);
  }, []);

  const register = useCallback(async (payload) => {
    const response = await api.post("/auth/register", payload);
    return persistAuth(response.data.data);
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem("refreshToken");

    try {
      if (refreshToken) {
        await api.post("/auth/logout", { refreshToken });
      }
    } catch {
      // Even if backend logout fails, local logout must still happen.
    }

    clearStoredAuth();
    setUser(null);
  }, []);

  const isAdmin = user?.role === "ADMIN";
  const isCustomer = user?.role === "CUSTOMER";
  const isAuth = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAdmin,
        isCustomer,
        isAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);