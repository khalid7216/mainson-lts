import axiosInstance from './axiosInstance';

/**
 * Create a new order
 * @param {Object} orderData - Order details and items
 * @returns {Promise<any>}
 */
export const createOrder = async (orderData) => {
  try {
    const response = await axiosInstance.post('/orders', orderData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all orders for the current user
 * @returns {Promise<any>}
 */
export const getMyOrders = async () => {
  try {
    const response = await axiosInstance.get('/orders');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get order details by ID
 * @param {string} id - The order ID
 * @returns {Promise<any>}
 */
export const getOrderById = async (id) => {
  try {
    const response = await axiosInstance.get(`/orders/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Cancel an order by ID
 * @param {string} id - The order ID
 * @returns {Promise<any>}
 */
export const cancelOrder = async (id) => {
  try {
    const response = await axiosInstance.put(`/orders/${id}/cancel`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
