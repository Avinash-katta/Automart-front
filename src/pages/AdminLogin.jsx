import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useToast } from '../context/ToastContext';
import { Mail, Lock, Shield, ArrowRight } from 'lucide-react';

const AdminLogin = () => {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both your email and password.', 'error');
      return;
    }

    setLoading(true);
    const success = await login(email, password);
    setLoading(false);

    if (success) {
      navigate('/admin/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full border border-slate-800/80 bg-slate-900/60 rounded-3xl p-6 sm:p-8 space-y-8 shadow-2xl backdrop-blur-md relative overflow-hidden">
        {/* Decorative Light Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Branding header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto text-amber-500 shadow-md">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-widest text-white mt-4">
            AUTO<span className="text-amber-500 font-extrabold">MART</span>
          </h2>
          <p className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">
            Admin Portal Control Panel
          </p>
          <p className="text-xs text-slate-400 font-light max-w-xs mx-auto">
            Please enter your administrator credentials to access dashboard logs.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Admin Email
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="admin@automart.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 text-xs rounded-xl py-3.5 pl-11 pr-4 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-medium"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Security Password
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 text-xs rounded-xl py-3.5 pl-11 pr-4 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-medium"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-slate-950 disabled:opacity-50 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-amber-500/10 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                Sign In to Admin
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Back to Client Storefront Link */}
        <div className="text-center pt-2">
          <button
            onClick={() => navigate('/')}
            className="text-[10px] text-slate-500 hover:text-slate-300 font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            ← Back to Storefront
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
