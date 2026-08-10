import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Mail, Lock, Star, Sparkles, ArrowLeft } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.history.pushState(null, null, window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, null, window.location.href);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    setLoading(true);
    const success = await login(email, password);
    setLoading(false);

    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#eef2ff] via-[#f8fbff] to-[#ffffff]">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 rounded-[32px] overflow-hidden border border-gray-150/50 shadow-2xl bg-white min-h-[600px]">
        
        {/* Left Side: Brand Panel (Hidden on Mobile) */}
        <div className="hidden md:flex flex-col justify-between p-16 bg-gradient-to-br from-[#0F6FFF] to-[#0041B5] text-white relative overflow-hidden">
          {/* Subtle grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-40"></div>
          
          <div className="relative z-10 space-y-4">
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-100 hover:text-white transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
            </Link>
            <h1 className="text-4xl font-extrabold tracking-tight uppercase leading-tight pt-4">
              Start Your Global <br />Car Trading Journey
            </h1>
            <p className="text-sm text-blue-100 font-light leading-relaxed max-w-sm">
              Log in to your AutoMart garage and keep track of your basket, checkout securely, and review orders.
            </p>
          </div>

          {/* Luxury White Sedan Image */}
          <div className="relative z-10 my-4 transform hover:scale-102 transition-transform duration-500">
            <img
              src="https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=600"
              alt="Premium White Car"
              className="w-full h-auto object-cover rounded-2xl shadow-lg border border-white/10"
            />
          </div>

          {/* Testimonial bubble */}
          <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex items-center justify-between w-fit gap-6 shadow-md">
            <div className="flex -space-x-2">
              <img
                className="inline-block h-8 w-8 rounded-full ring-2 ring-[#0F6FFF] object-cover"
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt="User 1"
              />
              <img
                className="inline-block h-8 w-8 rounded-full ring-2 ring-[#0F6FFF] object-cover"
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt="User 2"
              />
              <img
                className="inline-block h-8 w-8 rounded-full ring-2 ring-[#0F6FFF] object-cover"
                src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt="User 3"
              />
            </div>
            <div>
              <div className="flex gap-0.5 text-amber-400">
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
              </div>
              <span className="text-[10px] font-bold tracking-wider block text-white/95 uppercase mt-0.5">
                50k+ Happy Customers
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Form Panel */}
        <div className="p-8 sm:p-12 flex flex-col justify-center bg-blue-50">
          <div className="max-w-md w-full mx-auto space-y-6">
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-1.5">
                Welcome Back <Sparkles className="w-5 h-5 text-[#0F6FFF]" />
              </h2>
              <p className="text-xs text-gray-400 font-light mt-1.5">
                Welcome back. Sign in to access your premium automobile dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-1">
                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-[#0F6FFF] focus:ring-1 focus:ring-blue-100 rounded-xl px-4 py-3 pl-11 text-sm outline-none transition-all"
                    placeholder="Enter Your Email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-gray-400 hover:text-[#0F6FFF] transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-[#0F6FFF] focus:ring-1 focus:ring-blue-100 rounded-xl px-4 py-3 pl-11 text-sm outline-none transition-all"
                    placeholder="Password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-semibold text-white bg-[#0F6FFF] hover:bg-[#0051D4] focus:outline-none transition-all cursor-pointer disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed shadow-md shadow-blue-100 transform active:scale-99 mt-6"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="text-center text-xs pt-4 border-t border-gray-50">
              <span className="text-gray-400 font-light">Don't have an account? </span>
              <Link to="/register" className="font-bold text-[#0F6FFF] hover:underline">
                Register Now
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
