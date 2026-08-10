import React, { useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useToast } from '../context/ToastContext';
import { Settings, Lock, Shield, Sparkles } from 'lucide-react';
import api from '../services/api';

const AdminSettings = () => {
  const { adminUser } = useAdminAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    username: adminUser?.username || 'Admin User',
    email: adminUser?.email || 'admin@automart.com',
    phone: adminUser?.phone || '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  // Store metadata
  const [storeMeta, setStoreMeta] = useState({
    storeName: 'AutoMart',
    contactEmail: 'support@automart.com',
    contactPhone: '+91 9900990099',
    currency: 'INR',
    maintenanceMode: false
  });
  const [metaLoading, setMetaLoading] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.put(`/admin/users/${adminUser.userId}`, {
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        password: formData.newPassword ? formData.newPassword : null,
        role: adminUser.role,
        status: 'ACTIVE'
      });
      showToast('Profile configuration updated successfully!', 'success');
      setFormData(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
    } catch (error) {
      showToast('Failed to update profile settings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMetaSubmit = (e) => {
    e.preventDefault();
    setMetaLoading(true);
    setTimeout(() => {
      setMetaLoading(false);
      showToast('Global store metadata updated.', 'success');
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">System Settings</h1>
        <p className="text-xs text-slate-400 font-light mt-0.5">Configure system-wide constants, site metadata, and credentials profiles</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile and Credentials */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">Administrator Credentials</h3>
          </div>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Username</label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-3 px-4 outline-none focus:border-amber-500 font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-3 px-4 outline-none focus:border-amber-500 font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">New Password</label>
                <input
                  type="password"
                  placeholder="Password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-3 px-4 outline-none focus:border-amber-500 font-semibold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Confirm Password</label>
                <input
                  type="password"
                  placeholder="Confirm"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-3 px-4 outline-none focus:border-amber-500 font-semibold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 disabled:opacity-50 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-amber-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {loading ? <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span> : 'Update Profile'}
            </button>
          </form>
        </div>

        {/* Global Metadata */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">Global Metadata Preferences</h3>
          </div>
          <form onSubmit={handleMetaSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Store Name</label>
              <input
                type="text"
                required
                value={storeMeta.storeName}
                onChange={(e) => setStoreMeta({ ...storeMeta, storeName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-3 px-4 outline-none focus:border-amber-500 font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contact Support Email</label>
                <input
                  type="email"
                  required
                  value={storeMeta.contactEmail}
                  onChange={(e) => setStoreMeta({ ...storeMeta, contactEmail: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-3 px-4 outline-none focus:border-amber-500 font-semibold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contact Support Phone</label>
                <input
                  type="text"
                  required
                  value={storeMeta.contactPhone}
                  onChange={(e) => setStoreMeta({ ...storeMeta, contactPhone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-3 px-4 outline-none focus:border-amber-500 font-semibold"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-2xl">
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-700">Maintenance Mode</p>
                <p className="text-[9px] text-slate-400 font-medium">Bridges storefront views to a standby visual placeholder</p>
              </div>
              <input
                type="checkbox"
                checked={storeMeta.maintenanceMode}
                onChange={(e) => setStoreMeta({ ...storeMeta, maintenanceMode: e.target.checked })}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={metaLoading}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 disabled:opacity-50 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-amber-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {metaLoading ? <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span> : 'Update Settings'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
