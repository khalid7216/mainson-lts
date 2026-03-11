// frontend/src/services/api.js
const API_URL =  "https://maison-lite-twos.vercel.app/api";
/* ── Helper: make API request with credentials ───── */
const request = async (endpoint, options = {}) => {
  const config = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include", // Send cookies
  };

  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data     = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

/* ══════════════════════════════════════════════════
   AUTH APIS
══════════════════════════════════════════════════ */
export const authAPI = {
  /* Sign up */
  signup: async (name, email, password) => {
    const data = await request("/auth/signup", {
      method: "POST",
      body:   JSON.stringify({ name, email, password }),
    });
    if (data.token) localStorage.setItem("token", data.token);
    return data;
  },

  /* Login */
  login: async (email, password) => {
    const data = await request("/auth/login", {
      method: "POST",
      body:   JSON.stringify({ email, password }),
    });
    if (data.token) localStorage.setItem("token", data.token);
    return data;
  },

  /* Logout */
  logout: async () => {
    await request("/auth/logout");
    localStorage.removeItem("token");
  },

  /* Get current user */
  getMe: async () => {
    return await request("/auth/me");
  },

  /* Forgot password */
  forgotPassword: async (email) => {
    return await request("/auth/forgot-password", {
      method: "POST",
      body:   JSON.stringify({ email }),
    });
  },

  /* Reset password */
  resetPassword: async (token, password) => {
    return await request(`/auth/reset-password/${token}`, {
      method: "PUT",
      body:   JSON.stringify({ password }),
    });
  },
};
