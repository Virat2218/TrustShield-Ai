import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Key, ArrowRight, AlertCircle, CheckCircle, ArrowLeft, Check } from 'lucide-react';
import { requestPasswordReset, resetPassword } from '../services/api';
import { useLanguage } from '../hooks/useLanguage';

export default function ForgotPassword() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const urlToken = searchParams.get('token') || '';

  const [step, setStep] = useState(urlToken ? 2 : 1);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState(urlToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [requestSentMessage, setRequestSentMessage] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (urlToken) {
      setToken(urlToken);
      setStep(2);
    }
  }, [urlToken]);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please provide a valid email address.');
      return;
    }

    setError('');
    setRequestSentMessage('');
    setLoading(true);

    try {
      const res = await requestPasswordReset({ email: email.trim() });
      setRequestSentMessage(
        res.message || 'If an account exists with this email address, password reset instructions have been sent.'
      );
    } catch (err) {
      console.error(err);
      setRequestSentMessage(
        'If an account exists with this email address, password reset instructions have been sent.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async (e) => {
    e.preventDefault();
    if (!token.trim()) {
      setError('Please enter your reset token.');
      return;
    }

    if (!newPassword) {
      setError('Please enter your new password.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await resetPassword({
        token: token.trim(),
        new_password: newPassword,
      });
      setSuccess(
        res.message || 'Your password has been reset successfully. All previous sessions have been invalidated.'
      );
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Invalid, expired, or already used reset token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xl shadow-slate-200/50 space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-[#0d766e] flex items-center justify-center text-white mx-auto shadow-xs">
            <Check className="w-5 h-5 stroke-[2.5]" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {step === 1 ? 'Reset Password' : 'Confirm New Password'}
          </h1>
          <p className="text-xs text-slate-500">
            {step === 1
              ? 'Request a secure link to reset your account password.'
              : 'Enter the single-use reset token and choose a new password.'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              key="error-box"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              key="success-box"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-2"
            >
              <div className="flex items-center gap-2 font-bold text-emerald-900">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Password Updated Successfully</span>
              </div>
              <p>{success}</p>
              <Link
                to="/login"
                className="inline-block mt-2 font-bold text-[#0d766e] hover:text-[#0f766e] underline"
              >
                Proceed to Sign In &rarr;
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 1: Request Reset Form */}
        {!success && step === 1 && (
          <div className="space-y-4">
            {requestSentMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-900 space-y-2"
              >
                <div className="flex items-center gap-2 font-bold text-[#0d766e]">
                  <CheckCircle className="w-4 h-4 text-[#0d766e]" />
                  <span>Check Your Inbox</span>
                </div>
                <p>{requestSentMessage}</p>
                <p className="text-[11px] text-slate-500">
                  If you do not see the email, please check your spam folder or verify your email address.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setStep(2);
                  }}
                  className="mt-2 text-xs font-bold text-white bg-[#0d766e] hover:bg-[#0f766e] px-3 py-1.5 rounded-lg transition"
                >
                  Enter Reset Token &rarr;
                </button>
              </motion.div>
            )}

            <form onSubmit={handleRequestReset} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0d766e] transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-bold text-white bg-[#0d766e] hover:bg-[#0f766e] shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setStep(2);
                }}
                className="text-xs text-slate-500 hover:text-slate-800 transition"
              >
                Already have a reset token? <span className="text-[#0d766e] font-bold underline">Enter Code</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Set New Password with Token */}
        {!success && step === 2 && (
          <form onSubmit={handleConfirmReset} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Reset Token
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste your reset token"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0d766e] transition font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                New Password (min. 6 characters)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0d766e] transition font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0d766e] transition font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold text-white bg-[#0d766e] hover:bg-[#0f766e] shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Update Password</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setStep(1);
                }}
                className="text-xs text-slate-500 hover:text-slate-800 transition flex items-center justify-center gap-1 mx-auto"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Need a reset link? Request one</span>
              </button>
            </div>
          </form>
        )}

        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
          <Link to="/login" className="text-[#0d766e] hover:text-[#0f766e] font-bold transition">
            &larr; Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
