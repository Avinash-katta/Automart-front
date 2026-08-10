import React, { createContext, useContext, useState } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const { showToast } = useToast();

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, userId, username, email: userEmail, role } = response.data;

      localStorage.setItem('token', token);
      
      const userProfile = { userId, username, email: userEmail, role };
      localStorage.setItem('user', JSON.stringify(userProfile));
      setUser(userProfile);

      showToast('Logged in successfully', 'success');
      return true;
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Invalid credentials';
      showToast(errorMsg, 'error');
      return false;
    }
  };

  const register = async (username, email, password, confirmPassword) => {
    try {
      const response = await api.post('/auth/register', {
        username,
        email,
        password,
        confirmPassword,
      });
      showToast(response.data.message || 'Registration successful', 'success');
      return true;
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Registration failed';
      showToast(errorMsg, 'error');
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      showToast('Logout Successful', 'success');
      return true;
    } catch (error) {
      console.error('Backend logout failed:', error);
      showToast('Logout Failed. Please try again.', 'error');
      return false;
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      showToast(response.data.message || 'Reset link sent to email', 'success');
      return true;
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to request reset link';
      showToast(errorMsg, 'error');
      return false;
    }
  };

  const resetPassword = async (token, newPassword, confirmPassword) => {
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        newPassword,
        confirmPassword,
      });
      showToast(response.data.message || 'Password reset successful', 'success');
      return true;
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to reset password';
      showToast(errorMsg, 'error');
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
