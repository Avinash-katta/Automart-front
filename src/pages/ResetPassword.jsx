import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      showToast('Reset token is missing in URL', 'error');
    }
  }, [token, showToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      showToast('Cannot reset password without a token', 'error');
      return;
    }

    if (!newPassword || !confirmPassword) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setLoading(true);
    const successResult = await resetPassword(token, newPassword, confirmPassword);
    setLoading(false);

    if (successResult) {
      setSuccess(true);
    }
  };

  return (
    <div className="bg-white min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-8 border border-gray-100 rounded-2xl shadow-sm">
        {!success ? (
          <>
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-black uppercase tracking-tight">
                Reset Password
              </h2>
              <p className="mt-2 text-sm text-gray-500 font-light">
                Choose a secure new password for your account below.
              </p>
            </div>

            {!token && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex gap-2 items-start">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>Reset token is missing from the URL. Please verify the link you clicked in your email.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="newPassword" className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    required
                    disabled={!token}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-white border border-gray-200 hover:border-gray-300 focus:border-[#0F6FFF] focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-3 text-sm outline-none transition-all disabled:bg-gray-50"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    disabled={!token}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-white border border-gray-200 hover:border-gray-300 focus:border-[#0F6FFF] focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-3 text-sm outline-none transition-all disabled:bg-gray-50"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading || !token}
                  className="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-semibold text-white bg-[#0F6FFF] hover:bg-[#0051D4] focus:outline-none transition-all cursor-pointer disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed shadow-md shadow-blue-100 transform active:scale-99"
                >
                  {loading ? 'Resetting Password...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Password Reset Successful</h3>
            <p className="mt-2 text-sm text-gray-500 font-light">
              Your password has been changed. You can now use your new password to sign in.
            </p>
            <Link
              to="/login"
              className="mt-6 inline-block w-full text-center py-3.5 px-4 rounded-xl text-sm font-semibold text-white bg-[#0F6FFF] hover:bg-[#0051D4] transition-colors shadow-md shadow-blue-200"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
