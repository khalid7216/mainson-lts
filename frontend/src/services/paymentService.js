import axiosInstance from './axiosInstance';

/**
 * Create a configuration for a payment intent
 * @param {number} amount - Amount to charge
 * @returns {Promise<any>}
 */
export const createPaymentIntent = async (payload) => {
  try {
    const response = await axiosInstance.post('/payments/create-intent', payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Confirm a processed payment
 * @param {string} paymentIntentId - Payment intent ID from Stripe
 * @param {Object} orderData - Corresponding order data
 * @returns {Promise<any>}
 */
export const confirmPayment = async (paymentIntentId, orderData) => {
  try {
    const response = await axiosInstance.post('/payments/confirm', { paymentIntentId, orderData });
    return response.data;
  } catch (error) {
    throw error;
  }
};
