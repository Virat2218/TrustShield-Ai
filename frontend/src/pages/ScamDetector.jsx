import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Trash2, AlertCircle, Lightbulb } from 'lucide-react';
import { analyzeMessage } from '../services/api';
import RiskReport from '../components/RiskReport';
import LoadingSpinner from '../components/LoadingSpinner';
import { useLanguage } from '../hooks/useLanguage';

const SAMPLES = [
  {
    title: 'Bank KYC Suspension Scam',
    text: 'Dear customer, your SBI bank account has been suspended due to pending KYC update. Click http://bit.ly/sbi-kyc-update immediately or your account will be permanently blocked in 24 hours.',
  },
  {
    title: 'Lottery / Prize Scam',
    text: 'Congratulations! You are selected as the lucky winner of ₹50,00,000 in Kaun Banega Crorepati lucky draw. Call WhatsApp customer care at +91-9876543210 and pay ₹2,500 registration fee to claim prize.',
  },
  {
    title: 'Legitimate Delivery Update',
    text: 'Your order #82910 has been shipped and will be delivered by Thursday. Track your package through the official app. Thank you for shopping with us.',
  },
];

export default function ScamDetector() {
  const { t } = useLanguage();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const maxLength = 5000;

  const handleAnalyze = async () => {
    if (!message.trim()) {
      setError(t.errors.emptyMessage);
      return;
    }
    if (message.length > maxLength) {
      setError(t.errors.tooLong);
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);

    try {
      const data = await analyzeMessage(message.trim());
      setResult(data);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        (err.isConfigurationError || err.code === 'ERR_NETWORK' || !err.response
          ? 'Unable to connect to TrustShield backend API. Please verify the backend service is running and VITE_API_URL is configured.'
          : err.message || t.errors.serverError);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessage('');
    setError('');
    setResult(null);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 space-y-8">

      {/* Page header */}
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-[#0d766e] text-xs font-bold uppercase tracking-wider">
          <MessageSquare className="w-4 h-4" aria-hidden="true" />
          <span>Message Scanner</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Check a Message for Scams
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-xl">
          Paste any suspicious SMS, WhatsApp message, email, or chat. We analyze urgency tricks,
          payment demands, and deceptive patterns.
        </p>
      </header>

      {/* Input form */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 md:p-8 shadow-xl shadow-slate-200/40 space-y-5">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="message-input" className="text-sm font-bold text-slate-800">
              Message text to analyze
            </label>
            <span
              className={`text-xs font-mono tabular-nums ${
                message.length > 4500 ? 'text-amber-600 font-bold' : 'text-slate-400'
              }`}
              aria-live="polite"
            >
              {message.length.toLocaleString()} / {maxLength.toLocaleString()}
            </span>
          </div>

          <textarea
            id="message-input"
            rows={7}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (error) setError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) handleAnalyze();
            }}
            placeholder="Paste suspicious text here..."
            className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0d766e] focus:ring-1 focus:ring-[#0d766e]/30 transition leading-relaxed resize-y min-h-[140px]"
          />
        </div>

        {/* Demo Examples */}
        <div className="space-y-2">
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
            Try a sample message
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLES.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setMessage(sample.text);
                  setError('');
                  setResult(null);
                }}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-medium transition cursor-pointer"
              >
                {sample.title}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              role="alert"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleClear}
            disabled={loading || (!message && !result)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Clear</span>
          </button>

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={loading || !message.trim()}
            className="w-full sm:w-auto px-7 py-3 rounded-xl text-sm font-bold text-white bg-[#0d766e] hover:bg-[#0f766e] shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            aria-busy={loading}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" aria-hidden="true" />
                <span>Analyze Message</span>
              </>
            )}
          </button>
        </div>
      </div>

      {loading && <LoadingSpinner text="Analyzing message patterns..." />}

      {result && (
        <RiskReport
          result={result}
          type="message"
          onReset={handleClear}
          submittedContent={message}
        />
      )}
    </div>
  );
}
