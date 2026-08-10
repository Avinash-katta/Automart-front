import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const token = localStorage.getItem('token');

  const fetchCart = useCallback(async () => {
    const isAdminPath = window.location.pathname.startsWith('/admin');
    if (isAdminPath || !localStorage.getItem('token')) {
      setCartItems([]);
      return;
    }
    setLoading(true);
    try {
      const response = await api.get('/cart');
      setCartItems(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [token, fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    if (!localStorage.getItem('token')) {
      showToast('Please log in to add items to cart', 'error');
      return false;
    }
    try {
      const response = await api.post('/cart', { productId, quantity });
      showToast('Added to Cart Successfully', 'success');
      fetchCart(); // refresh local cart
      return true;
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to add item to cart';
      showToast(errorMsg, 'error');
      return false;
    }
  };

  const updateQuantity = async (cartId, quantity) => {
    try {
      await api.put(`/cart/${cartId}?quantity=${quantity}`);
      showToast('Quantity Updated', 'success');
      fetchCart();
      return true;
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to update quantity';
      showToast(errorMsg, 'error');
      return false;
    }
  };

  const removeFromCart = async (cartId) => {
    try {
      await api.delete(`/cart/${cartId}`);
      showToast('Removed from Cart', 'success');
      fetchCart();
      return true;
    } catch (error) {
      showToast('Failed to remove item', 'error');
      return false;
    }
  };

  const clearCartState = useCallback(() => {
    setCartItems([]);
    localStorage.removeItem('cart'); // Clear cached cart if any
  }, []);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        cartCount,
        cartTotal,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCartState,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
