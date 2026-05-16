import axiosInstance from './axiosInstance';

/**
 * Get the current user's cart
 * @returns {Promise<any>}
 */
export const getCart = async () => {
  try {
    const response = await axiosInstance.get('/cart');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Add a product to the cart
 * @param {string} productId - The ID of the product
 * @param {number} quantity - The quantity to add
 * @returns {Promise<any>}
 */
export const addToCart = async (productId, quantity) => {
  try {
    const response = await axiosInstance.post('/cart/add', { productId, quantity });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update the quantity of a cart item
 * @param {string} itemId - The ID of the item in the cart
 * @param {number} quantity - The new quantity
 * @returns {Promise<any>}
 */
export const updateCartItem = async (itemId, quantity) => {
  try {
    const response = await axiosInstance.put(`/cart/item/${itemId}`, { quantity });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Remove a specific item from the cart
 * @param {string} itemId - The ID of the item to remove
 * @returns {Promise<any>}
 */
export const removeFromCart = async (itemId) => {
  try {
    const response = await axiosInstance.delete(`/cart/item/${itemId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Clear the entire cart
 * @returns {Promise<any>}
 */
export const clearCart = async () => {
  try {
    const response = await axiosInstance.delete('/cart');
    return response.data;
  } catch (error) {
    throw error;
  }
};
