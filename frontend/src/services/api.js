// frontend/src/services/api.js
const API_URL = import.meta.env.VITE_API_URL || "https://maison-backend.vercel.app/api";
// const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
/* ── Helper: make API request with credentials ───── */
const request = async (endpoint, options = {}, isFormData = false) => {
  const config = {
    ...options,
    headers: {
      ...options.headers,
    },
    credentials: "include", // Send cookies
  };

  if (!isFormData) {
    config.headers["Content-Type"] = "application/json";
  }


  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json();

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
      body: JSON.stringify({ name, email, password }),
    });
    if (data.token) localStorage.setItem("token", data.token);
    return data;
  },

  /* Login */
  login: async (email, password) => {
    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
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
      body: JSON.stringify({ email }),
    });
  },

  /* Reset password */
  resetPassword: async (token, password) => {
    return await request(`/auth/reset-password/${token}`, {
      method: "PUT",
      body: JSON.stringify({ password }),
    });
  },

  /* Get all customers (Admin) */
  getCustomers: async () => {
    return await request("/users/admin/all");
  },
};

/* ══════════════════════════════════════════════════
   ORDER APIS
══════════════════════════════════════════════════ */
export const orderAPI = {
  /* Create order — sends [{ productId, qty }], server fetches real prices */
  createOrder: async ({ cartItems, shippingAddress, notes = "" }) => {
    return await request("/orders", {
      method: "POST",
      body: JSON.stringify({ cartItems, shippingAddress, notes }),
    });
  },

  /* Get my orders */
  getMyOrders: async () => {
    return await request("/orders");
  },

  /* Get single order */
  getOrder: async (id) => {
    return await request(`/orders/${id}`);
  },

  /* Cancel order */
  cancelOrder: async (id) => {
    return await request(`/orders/${id}/cancel`, { method: "PUT" });
  },

  /* Rollback order — cancel pending/processing order + restore stock */
  rollbackOrder: async (orderId) => {
    return await request(`/orders/${orderId}/rollback`, { method: "POST" });
  },

  /* Get all orders (Admin) */
  getAllOrders: async (status = "All") => {
    const qs = status.toLowerCase() !== "all" ? `?status=${status}` : "";
    return await request(`/orders/admin/all${qs}`);
  },

  /* Update order status (Admin) */
  updateOrderStatus: async (id, status) => {
    return await request(`/orders/admin/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  },

  /* Get analytics (Admin) */
  getAnalytics: async () => {
    return await request("/orders/admin/analytics");
  },
};

/* ══════════════════════════════════════════════════
   PAYMENT APIS
══════════════════════════════════════════════════ */
export const paymentAPI = {
  /* Create payment intent */
  createIntent: async (orderId) => {
    return await request("/payments/create-intent", {
      method: "POST",
      body: JSON.stringify({ orderId }),
    });
  },

  /* Refund payment */
  refund: async (orderId, reason = "") => {
    return await request("/payments/refund", {
      method: "POST",
      body: JSON.stringify({ orderId, reason }),
    });
  },

  /* Verify payment from DB — authoritative success/failure check */
  verifyPayment: async (orderId) => {
    return await request(`/payments/verify/${orderId}`);
  },
};

/* ══════════════════════════════════════════════════
   PRODUCT APIS
   ────────────────────────────────────────────────
   Admin endpoints are protected by adminOnly on server.
══════════════════════════════════════════════════ */
export const productAPI = {
  /* Get all products (supports search/filter) */
  getProducts: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return await request(`/products?${qs}`);
  },

  /* Get single product */
  getProduct: async (slug) => {
    return await request(`/products/${slug}`);
  },

  /* Create product (Admin) */
  create: async (body) => {
    const isFormData = body instanceof FormData;
    return await request("/products", {
      method: "POST",
      body: isFormData ? body : JSON.stringify(body),
    }, isFormData);
  },

  /* Update product (Admin) */
  update: async (id, body) => {
    const isFormData = body instanceof FormData;
    return await request(`/products/${id}`, {
      method: "PUT",
      body: isFormData ? body : JSON.stringify(body),
    }, isFormData);
  },

  /* Delete/Deactivate product (Admin) */
  delete: async (id) => {
    return await request(`/products/${id}`, { method: "DELETE" });
  },
};

/* ══════════════════════════════════════════════════
   CATEGORY APIS
══════════════════════════════════════════════════ */
export const categoryAPI = {
  /* Get all categories */
  getCategories: async () => {
    return await request("/categories");
  },

  /* Create category (Admin) */
  create: async (body) => {
    return await request("/categories", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
};

/* ══════════════════════════════════════════════════
   WISHLIST APIS
══════════════════════════════════════════════════ */
export const wishlistAPI = {
  getWishlist: async () => {
    return await request("/wishlist");
  },
  toggleWishlist: async (productId) => {
    return await request("/wishlist/toggle", {
      method: "POST",
      body: JSON.stringify({ productId }),
    });
  },
};

/* ══════════════════════════════════════════════════
   MEDIA APIS
══════════════════════════════════════════════════ */
export const mediaAPI = {
  // accepts a single File or an array of Files
  upload: async (files, categoryId = "") => {
    const formData = new FormData();
    const fileList = Array.isArray(files) ? files : [files];
    fileList.forEach((f) => formData.append("files", f));
    if (categoryId) formData.append("categoryId", categoryId);
    return await request("/media/upload", { method: "POST", body: formData }, true);
  },
  getAll: async ({ search = "", sort = "newest", source = "all", categoryId = "All" } = {}) => {
    const params = new URLSearchParams({ search, sort, source });
    if (categoryId !== "All") params.append("categoryId", categoryId);
    return await request(`/media?${params.toString()}`);
  },
  delete: async (id) => {
    return await request(`/media/${id}`, { method: "DELETE" });
  },
  bulkDelete: async (ids) => {
    return await request("/media/bulk", {
      method: "DELETE",
      body: JSON.stringify({ ids }),
    });
  },
};

/* ══════════════════════════════════════════════════
   BANNER APIS
══════════════════════════════════════════════════ */
export const bannerAPI = {
  getBanners: async () => {
    return await request("/banners");
  },
  create: async (body) => {
    return await request("/banners", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  update: async (id, body) => {
    return await request(`/banners/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },
  delete: async (id) => {
    return await request(`/banners/${id}`, { method: "DELETE" });
  },
};

/* ══════════════════════════════════════════════════
   PAGE APIS
══════════════════════════════════════════════════ */
/* ══════════════════════════════════════════════════
   SEO APIS
══════════════════════════════════════════════════ */
export const seoAPI = {
  /* Fetch SEO config for a specific page (public) */
  getByPage: async (pageName) => {
    return await request(`/seo/${pageName}`);
  },

  /* Fetch all SEO configs (Admin only) */
  getAll: async () => {
    return await request("/seo");
  },

  /* Create or update SEO config for a page (Admin) */
  upsert: async (payload) => {
    return await request("/seo/update", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

export const pageAPI = {
  getPages: async () => {
    return await request("/pages");
  },
  getPageBySlug: async (slug) => {
    return await request(`/pages/${slug}`);
  },
  create: async (body) => {
    return await request("/pages", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  update: async (id, body) => {
    return await request(`/pages/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },
  delete: async (id) => {
    return await request(`/pages/${id}`, { method: "DELETE" });
  },
};
