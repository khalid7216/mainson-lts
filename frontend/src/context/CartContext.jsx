import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart as clearCartService } from '../services/cartService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getCart();
      // Adjust based on the actual response structure, expecting [{ _id, product: { ... }, quantity }] inside data.cart or data.items
      setCartItems(data.cart?.items || data.items || data.cart || []);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      if (toast && typeof toast === "function") {
      }
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCartItems([]);
    }
  }, [isAuthenticated, fetchCart]);

  const addItem = async (productId, quantity) => {
    setIsLoading(true);
    try {
      await addToCart(productId, quantity);
      await fetchCart();
      if (toast && typeof toast === "function") {
        toast("Added to bag", "ok");
      }
    } catch (error) {
      console.error(error);
      if (toast && typeof toast === "function") {
        toast(error.response?.data?.message || "Failed to add to bag", "err");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateItem = async (productId, quantity) => {
    setIsLoading(true);
    try {
      await updateCartItem(productId, quantity);
      await fetchCart();
    } catch (error) {
      console.error(error);
      if (toast && typeof toast === "function") {
        toast(error.response?.data?.message || "Failed to update item", "err");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (productId) => {
    setIsLoading(true);
    try {
      await removeFromCart(productId);
      await fetchCart();
    } catch (error) {
      console.error(error);
      if (toast && typeof toast === "function") {
        toast(error.response?.data?.message || "Failed to remove item", "err");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearCartItems = async () => {
    setIsLoading(true);
    try {
      await clearCartService();
      setCartItems([]);
    } catch (error) {
      console.error(error);
      if (toast && typeof toast === "function") {
        toast(error.response?.data?.message || "Failed to clear bag", "err");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const totalItems = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
  }, [cartItems]);

  const totalPrice = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const price = item.product?.price || item.price || 0;
      const qty = item.quantity || 1;
      return acc + (price * qty);
    }, 0);
  }, [cartItems]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isLoading,
        totalItems,
        totalPrice,
        fetchCart,
        addItem,
        updateItem,
        removeItem,
        clearCartItems
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
