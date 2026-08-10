import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { LayoutDashboard, Box, Users, ShoppingBag, TrendingUp, LogOut, Bell, Search, Settings, Menu, X, Shield } from 'lucide-react';

const AdminLayout = () => {
  const { adminUser, logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products Inventory', path: '/admin/products', icon: Box },
    { name: 'User Directory', path: '/admin/users', icon: Users },
    { name: 'Orders & Sales', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Business Analytics', path: '/admin/analytics', icon: TrendingUp },
    { name: 'Admin Settings', path: '/admin/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    setLogoutPending(true);
    await logout();
    setLogoutPending(false);
    setShowLogoutConfirm(false);
    navigate('/admin', { replace: true });
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex-shrink-0">
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
          <Link to="/admin/dashboard" className="flex items-center gap-2 font-black tracking-wider text-white uppercase text-sm">
            <Shield className="w-5 h-5 text-amber-500" />
            AUTO<span className="text-amber-500">MART</span> <span className="text-[10px] bg-slate-800 text-amber-500 px-1.5 py-0.5 rounded border border-slate-700">ADMIN</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                  active
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-xs z-10">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Title / Search */}
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="Quick search dashboard..."
                className="bg-slate-50 text-xs border border-slate-200 focus:border-amber-500 rounded-full px-4 py-2 pl-9 outline-none w-64 transition-all"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Right Header items */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="p-2 rounded-full hover:bg-slate-100 text-slate-500 relative cursor-pointer">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
            </button>

            {/* Profile */}
            <div className="flex items-center gap-2.5 border-l border-slate-200 pl-4">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-extrabold flex items-center justify-center text-xs uppercase shadow-sm border border-slate-200">
                A
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-900">{adminUser?.username || 'Admin User'}</p>
                <p className="text-[10px] text-slate-400 font-medium capitalize">{adminUser?.role?.toLowerCase() || 'Administrator'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Inner Page Outlet */}
        <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto bg-slate-50/50">
          <Outlet />
        </main>
      </div>

      {/* Sidebar - Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/60 backdrop-blur-xs">
          <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full animate-slide-in">
            {/* Mobile Brand */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950">
              <span className="font-black tracking-wider text-white uppercase text-sm flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-500" />
                AUTO<span className="text-amber-500">MART</span>
              </span>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Nav */}
            <nav className="flex-grow px-4 py-6 space-y-1 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                      active
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Logout */}
            <div className="p-4 border-t border-slate-800 bg-slate-950">
              <button
                onClick={() => {
                  setMobileSidebarOpen(false);
                  setShowLogoutConfirm(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-slate-100 shadow-2xl space-y-6 text-slate-850 animate-slide-in">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Confirm Admin Logout</h3>
              <p className="text-xs text-slate-400 font-light leading-relaxed">
                Are you sure you want to end your current administrative session?
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                disabled={logoutPending}
                className="flex-1 py-3 border border-slate-200 hover:border-slate-800 rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                disabled={logoutPending}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-md shadow-red-100"
              >
                {logoutPending ? 'Confirming...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
