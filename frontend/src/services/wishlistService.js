import axiosInstance from './axiosInstance';

/**
 * Get current user's wishlist
 * @returns {Promise<any>}
 */
export const getWishlist = async () => {
  try {
    const response = await axiosInstance.get('/wishlist');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Add a product to the wishlist
 * @param {string} productId - Product ID to add
 * @returns {Promise<any>}
 */
export const addToWishlist = async (productId) => {
  try {
    const response = await axiosInstance.post('/wishlist', { productId });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Remove a product from the wishlist
 * @param {string} productId - Product ID to remove
 * @returns {Promise<any>}
 */
export const removeFromWishlist = async (productId) => {
  try {
    const response = await axiosInstance.delete(`/wishlist/${productId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
