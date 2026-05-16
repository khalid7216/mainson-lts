import axiosInstance from './axiosInstance';

/**
 * Get a list of products with optional filters
 * @param {Object} filters - Query parameters for filtering
 * @returns {Promise<any>}
 */
export const getProducts = async (filters) => {
  try {
    const response = await axiosInstance.get('/products', { params: filters });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get a single product by Slug
 * @param {string} slug - Product Slug
 * @returns {Promise<any>}
 */
export const getProductBySlug = async (slug) => {
  try {
    const response = await axiosInstance.get(`/products/${slug}`);
    return response.data.product || response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all product categories
 * @returns {Promise<any>}
 */
export const getCategories = async () => {
  try {
    const response = await axiosInstance.get('/categories');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Search products by query string
 * @param {string} query - The search query string
 * @returns {Promise<any>}
 */
export const searchProducts = async (query) => {
  try {
    const response = await axiosInstance.get('/products', { params: { search: query } });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get reviews for a specific product
 * @param {string} id - Product ID
 * @returns {Promise<any>}
 */
export const getProductReviews = async (id) => {
  try {
    const response = await axiosInstance.get(`/products/${id}/reviews`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Add a review to a product
 * @param {string} id - Product ID
 * @param {Object} reviewData - Review contents
 * @returns {Promise<any>}
 */
export const addReview = async (id, reviewData) => {
  try {
    const response = await axiosInstance.post(`/products/${id}/reviews`, reviewData);
    return response.data;
  } catch (error) {
    throw error;
  }
};
