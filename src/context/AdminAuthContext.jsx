import React, { createContext, useContext, useState } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';

const AdminAuthContext = createContext(null);

export const useAdminAuth = () => useContext(AdminAuthContext);

export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(() => {
    const savedUser = localStorage.getItem('adminUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const { showToast } = useToast();

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, userId, username, email: userEmail, role } = response.data;

      if (role !== 'ADMIN') {
        showToast('Access Denied: Not an Admin user', 'error');
        return false;
      }

      localStorage.setItem('adminToken', token);
      
      const userProfile = { userId, username, email: userEmail, role };
      localStorage.setItem('adminUser', JSON.stringify(userProfile));
      setAdminUser(userProfile);

      showToast('Admin logged in successfully', 'success');
      return true;
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Invalid admin credentials';
      showToast(errorMsg, 'error');
      return false;
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      await api.post('/auth/logout', {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      showToast('Admin Logout Successful', 'success');
      return true;
    } catch (error) {
      console.error('Backend admin logout failed:', error);
      showToast('Logout Completed', 'success'); // fallback
      return true;
    } finally {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      setAdminUser(null);
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        login,
        logout,
        isAdminAuthenticated: !!adminUser,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};
