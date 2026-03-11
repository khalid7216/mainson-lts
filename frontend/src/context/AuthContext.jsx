// frontend/src/context/AuthContext.jsx
// ═════════════════════════════════════════════════════════════
//  UPDATED: Signup no longer auto-logs in user
// ═════════════════════════════════════════════════════════════

import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthCtx = createContext(null);

export const useAuth = () => useContext(AuthCtx);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ── Load user on mount if token exists ─────── */
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await authAPI.getMe();
        setUser({ ...data.user, isAdmin: data.user.role === "admin" });
      } catch (error) {
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  /* ── Login ──────────────────────────────────── */
  const login = async (email, password) => {
    try {
      const data = await authAPI.login(email, password);
      setUser({ ...data.user, isAdmin: data.user.role === "admin" });
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  /* ── Signup (UPDATED: no auto-login) ────────── */
  const signup = async (name, email, password) => {
    try {
      await authAPI.signup(name, email, password);
      // ✅ NEW: Just return success, don't set user
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  /* ── Logout ─────────────────────────────────── */
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
    }
  };

  /* ── Update User (for settings page) ────────── */
  const updateUser = (updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  return (
    <AuthCtx.Provider value={{ user, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthCtx.Provider>
  );
};