import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ArrowLeft, Mail } from 'lucide-react';

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter your email', 'error');
      return;
    }

    setLoading(true);
    const success = await forgotPassword(email);
    setLoading(false);

    if (success) {
      setSubmitted(true);
    }
  };

  return (
    <div className="bg-white min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-8 border border-gray-100 rounded-2xl shadow-sm">
        {/* Back Link */}
        <div className="text-left">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-black">
            <ArrowLeft className="w-4 h-4 text-[#0F6FFF]" /> Back to Sign In
          </Link>
        </div>

        {/* Content depending on submission */}
        {!submitted ? (
          <>
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-black uppercase tracking-tight">
                Forgot Password
              </h2>
              <p className="mt-2 text-sm text-gray-500 font-light">
                Enter your registered email below. We'll send you a link to reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div>
                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-gray-200 hover:border-gray-300 focus:border-[#0F6FFF] focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-3 text-sm outline-none transition-all"
                  placeholder="name@example.com"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-semibold text-white bg-[#0F6FFF] hover:bg-[#0051D4] focus:outline-none transition-all cursor-pointer disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed shadow-md shadow-blue-100 transform active:scale-99"
                >
                  {loading ? 'Sending Link...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-[#0F6FFF]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Check your email</h3>
            <p className="mt-2 text-sm text-gray-500 font-light">
              We have sent a password reset link to <span className="font-semibold text-gray-700">{email}</span>. Please check your inbox and spam folders.
            </p>
            <Link
              to="/login"
              className="mt-6 inline-block text-sm font-semibold text-[#0F6FFF] hover:underline"
            >
              Return to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
