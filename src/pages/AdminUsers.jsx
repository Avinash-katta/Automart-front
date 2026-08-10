import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useToast } from '../context/ToastContext';
import { Search, Edit2, ShieldAlert, X, Loader2 } from 'lucide-react';

const AdminUsers = () => {
  const { adminUser } = useAdminAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    role: 'CUSTOMER',
    status: 'ACTIVE',
    password: ''
  });
  const [formPending, setFormPending] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to load users:', error);
      showToast('Error loading user directory logs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [showToast]);

  const handleOpenEdit = (user) => {
    setCurrentUserId(user.userId);
    setFormData({
      username: user.username || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'CUSTOMER',
      status: user.status || 'ACTIVE',
      password: ''
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username.trim()) {
      showToast('Username is required', 'error');
      return;
    }
    if (!formData.email.trim()) {
      showToast('Email address is required', 'error');
      return;
    }

    // Self deactivation safety block
    const isSelf = adminUser && adminUser.email === formData.email;
    if (isSelf && formData.status !== 'ACTIVE') {
      showToast('Safety Alert: You cannot deactivate your own active session!', 'error');
      return;
    }
    if (isSelf && formData.role !== 'ADMIN') {
      showToast('Safety Alert: You cannot downgrade your own administrative role!', 'error');
      return;
    }

    const payload = {
      username: formData.username.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      role: formData.role,
      status: formData.status,
      password: formData.password.trim() === '' ? null : formData.password.trim()
    };

    setFormPending(true);
    try {
      await api.put(`/admin/users/${currentUserId}`, payload);
      showToast('User directory entry updated.', 'success');
      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to update user profile.';
      showToast(errorMsg, 'error');
    } finally {
      setFormPending(false);
    }
  };

  // Filter computation
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (u.phone && u.phone.includes(searchQuery));
    const matchesRole = roleFilter === '' || u.role === roleFilter;
    const matchesStatus = statusFilter === '' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Loading user records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">User Directory</h1>
        <p className="text-xs text-slate-400 font-light mt-0.5">Control system permissions, role access, and account status toggles</p>
      </div>

      {/* Filter Row */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search email, username, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-2.5 pl-9 pr-4 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-semibold"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Role Filter */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-xs rounded-xl py-2.5 px-3 outline-none focus:border-amber-500 font-semibold"
        >
          <option value="">All Roles</option>
          <option value="CUSTOMER">CUSTOMER</option>
          <option value="ADMIN">ADMIN</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-xs rounded-xl py-2.5 px-3 outline-none focus:border-amber-500 font-semibold"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="DEACTIVATED">DEACTIVATED</option>
        </select>
      </div>

      {/* Directory Table */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="p-4 pl-6">Profile</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Registered Date</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredUsers.map((u) => (
                <tr key={u.userId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-black flex items-center justify-center border border-slate-200/60 uppercase">
                        {u.username?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-950">{u.username}</p>
                        <p className="text-[10px] text-slate-400 font-medium">User ID: #{u.userId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-slate-950">{u.email}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{u.phone || 'No phone registered'}</p>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                      u.role === 'ADMIN' ? 'bg-amber-50 text-amber-600 border-amber-500/20' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      u.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400 font-medium">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Pending'}
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <button
                      onClick={() => handleOpenEdit(u)}
                      className="p-1.5 text-slate-500 hover:text-amber-500 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer inline-flex items-center"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full border border-slate-100 shadow-2xl p-6 sm:p-8 space-y-6 text-slate-850 animate-slide-in relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-6 top-6 p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Edit Profile</h3>
              <p className="text-xs text-slate-400 font-light mt-0.5">Modify system authentication parameters and user scopes.</p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Username */}
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

              {/* Email */}
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

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone</label>
                <input
                  type="text"
                  placeholder="e.g. +91 9988776655"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-3 px-4 outline-none focus:border-amber-500 font-semibold"
                />
              </div>

              {/* Security Password Override */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">New Password Override</label>
                  <span className="text-[8px] text-slate-400 font-bold uppercase">Optional</span>
                </div>
                <input
                  type="password"
                  placeholder="Leave empty to keep unchanged"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-3 px-4 outline-none focus:border-amber-500 font-semibold"
                />
              </div>

              {/* Roles & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-3 px-4 outline-none font-semibold"
                  >
                    <option value="CUSTOMER">CUSTOMER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-3 px-4 outline-none font-semibold"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="DEACTIVATED">DEACTIVATED</option>
                  </select>
                </div>
              </div>

              {/* Safety notice for self */}
              {adminUser && adminUser.email === formData.email && (
                <div className="flex gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-700 text-[10px] leading-relaxed font-bold">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                  <span>Safety Lock: You are currently logged in as this administrator. Role and Status toggles are locked for this record.</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={formPending}
                  className="flex-1 py-3.5 border border-slate-200 hover:border-slate-800 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formPending}
                  className="flex-1 py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-amber-500/10 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {formPending ? <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span> : 'Update user'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
