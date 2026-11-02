import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Mail, Lock, Key, ArrowRight, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { requestPasswordReset, resetPassword } from '../services/api';
import { useLanguage } from '../hooks/useLanguage';

export default function ForgotPassword() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const urlToken = searchParams.get('token') || '';

  // Step 1: Request reset link | Step 2: Enter token & new password
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
      // Ensure generic response behavior even if network errors occur
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 rounded-3xl bg-[#0d1635]/80 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50 space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {step === 1 ? t.auth.resetTitle : t.auth.enterTokenTitle}
          </h1>
          <p className="text-xs text-slate-400">
            {step === 1 ? t.auth.resetSubtitle : t.auth.enterTokenSubtitle}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              key="error-box"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center space-x-2 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              key="success-box"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 space-y-2"
            >
              <div className="flex items-center space-x-2 font-semibold">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Password Updated</span>
              </div>
              <p>{success}</p>
              <Link
                to="/login"
                className="inline-block mt-2 font-bold text-cyan-400 hover:text-cyan-300 underline"
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
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-200 space-y-2"
              >
                <div className="flex items-center space-x-2 font-semibold text-cyan-300">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  <span>Check Your Inbox</span>
                </div>
                <p>{requestSentMessage}</p>
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setStep(2);
                  }}
                  className="mt-2 text-xs font-bold text-white bg-cyan-600/60 hover:bg-cyan-600 px-3 py-1.5 rounded-lg transition"
                >
                  Enter Reset Token &rarr;
                </button>
              </motion.div>
            )}

            <form onSubmit={handleRequestReset} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t.auth.email}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 via-cyan-600 to-cyan-500 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.01] transition disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>{t.auth.sendResetButton}</span>
                    <ArrowRight className="w-4 h-4" />
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
                className="text-xs text-slate-400 hover:text-cyan-300 transition"
              >
                {t.auth.haveTokenPrompt} <span className="text-cyan-400 font-semibold underline">Enter Code</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Set New Password with Token */}
        {!success && step === 2 && (
          <form onSubmit={handleConfirmReset} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.auth.resetToken}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder={t.auth.resetTokenPlaceholder}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.auth.newPassword}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.auth.confirmPassword}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 via-cyan-600 to-cyan-500 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.01] transition disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>{t.auth.resetButton}</span>
                  <ArrowRight className="w-4 h-4" />
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
                className="text-xs text-slate-400 hover:text-cyan-300 transition flex items-center justify-center space-x-1 mx-auto"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t.auth.needTokenPrompt} {t.auth.requestReset}</span>
              </button>
            </div>
          </form>
        )}

        <div className="text-center pt-2 border-t border-white/10 text-xs text-slate-400">
          <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold transition">
            &larr; {t.auth.backToLogin}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
