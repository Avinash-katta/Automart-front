import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminProtectedRoute = ({ children }) => {
  const adminToken = localStorage.getItem('adminToken');
  const adminUserStr = localStorage.getItem('adminUser');
  const adminUser = adminUserStr ? JSON.parse(adminUserStr) : null;

  if (!adminToken) {
    return <Navigate to="/admin" replace />;
  }

  if (!adminUser || adminUser.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="max-w-md w-full border border-red-500/20 bg-slate-900/60 rounded-3xl p-8 space-y-6 shadow-2xl backdrop-blur-md">
          <div className="w-16 h-16 bg-red-950/60 border border-red-500/30 rounded-full flex items-center justify-center mx-auto text-red-500 font-extrabold text-2xl animate-pulse">
            !
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black uppercase tracking-wider text-red-400">403 Access Denied</h2>
            <p className="text-xs text-slate-400 font-light leading-relaxed">
              You do not have the required administrative permissions to access this dashboard.
            </p>
          </div>
          <button
            onClick={() => window.location.href = '/admin'}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold uppercase cursor-pointer transition-colors"
          >
            Go to Admin Login
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminProtectedRoute;
