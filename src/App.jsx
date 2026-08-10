import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { WatchlistProvider } from './context/WatchlistContext';

// Layouts & Guards
import CustomerLayout from './components/CustomerLayout';
import AdminLayout from './components/AdminLayout';
import AdminProtectedRoute from './components/AdminProtectedRoute';

// Storefront Pages
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import OrderSuccess from './pages/OrderSuccess';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Watchlist from './pages/Watchlist';

// Admin Pages
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminUsers from './pages/AdminUsers';
import AdminOrders from './pages/AdminOrders';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminCategories from './pages/AdminCategories';
import AdminSettings from './pages/AdminSettings';

import './App.css';

// Protected Route Component: checks client token existence
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Public Route Component: redirects logged-in users to home
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (token) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. Client Storefront Routes (Wrapped in CustomerLayout) */}
      <Route element={<CustomerLayout />}>
        {/* Public Auth Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          }
        />

        {/* Protected Shopping Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/product/:id"
          element={
            <ProtectedRoute>
              <ProductDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/watchlist"
          element={
            <ProtectedRoute>
              <Watchlist />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-success"
          element={
            <ProtectedRoute>
              <OrderSuccess />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 2. Admin Login - No sidebar layout */}
      <Route path="/admin" element={<AdminLogin />} />

      {/* 3. Protected Admin Routes (Wrapped in AdminLayout) */}
      <Route
        path="/admin"
        element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="settings" element={<AdminSettings />} />

        {/* Map sub-tabs as separate routes for analytics tab-linking */}
        <Route path="business/day" element={<AdminAnalytics />} />
        <Route path="business/month" element={<AdminAnalytics />} />
        <Route path="business/year" element={<AdminAnalytics />} />
        <Route path="business/overall" element={<AdminAnalytics />} />
      </Route>

      {/* Fallback redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AdminAuthProvider>
          <WatchlistProvider>
            <CartProvider>
              <Router>
                <AppRoutes />
              </Router>
            </CartProvider>
          </WatchlistProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
