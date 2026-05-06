import axiosInstance from './axiosInstance';

export const getAnalytics = async () => {
  const response = await axiosInstance.get('/admin/analytics');
  return response.data;
};

export const getAllOrders = async (filters = {}) => {
  const response = await axiosInstance.get('/admin/orders', { params: filters });
  return response.data;
};

export const updateOrderStatus = async (orderId, status) => {
  const response = await axiosInstance.put(`/admin/orders/${orderId}`, { status });
  return response.data;
};

export const getAllUsers = async (page = 1) => {
  const response = await axiosInstance.get('/admin/users', { params: { page } });
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await axiosInstance.delete(`/admin/users/${userId}`);
  return response.data;
};

export const getAllProducts = async (page = 1) => {
  const response = await axiosInstance.get('/admin/products', { params: { page } });
  return response.data;
};

export const createProduct = async (formData) => {
  const response = await axiosInstance.post('/admin/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateProduct = async (id, formData) => {
  const response = await axiosInstance.put(`/admin/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await axiosInstance.delete(`/admin/products/${id}`);
  return response.data;
};

export const getAllCoupons = async () => {
  const response = await axiosInstance.get('/admin/coupons');
  return response.data;
};

export const createCoupon = async (data) => {
  const response = await axiosInstance.post('/admin/coupons', data);
  return response.data;
};

export const deleteCoupon = async (id) => {
  const response = await axiosInstance.delete(`/admin/coupons/${id}`);
  return response.data;
};
