import { createContext, useContext, useState, useEffect } from "react";
import {
  login as loginService,
  register as registerService,
  logout as logoutService,
  getMe,
  updateProfile as updateProfileService,
} from "../services/authService";

const AuthCtx = createContext(null);

export const useAuth = () => useContext(AuthCtx);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await getMe();
          setUser({ ...(res.user || res.data || res), isAdmin: (res.user?.role || res.data?.role) === "admin" });
          setIsAuthenticated(true);
        } catch (error) {
          localStorage.removeItem("token");
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const data = await loginService(credentials);
      localStorage.setItem("token", data.token);

      const userRes = await getMe();
      const u = userRes.user || userRes.data || userRes;
      setUser({ ...u, isAdmin: u.role === "admin" });
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const register = async (userData) => {
    try {
      const data = await registerService(userData);
      localStorage.setItem("token", data.token);

      const userRes = await getMe();
      const u = userRes.user || userRes.data || userRes;
      setUser({ ...u, isAdmin: u.role === "admin" });
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  };

  const logout = async () => {
    try {
      await logoutService();
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateProfile = async (userData) => {
    try {
      const data = await updateProfileService(userData);
      const u = data.user || data.data || data;
      setUser({ ...u, isAdmin: u.role === "admin" });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Update failed",
      };
    }
  };

  return (
    <AuthCtx.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
};