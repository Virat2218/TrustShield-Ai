import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Trash2,
  AlertCircle,
  Sparkles,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import { analyzeMessage } from '../services/api';
import RiskReport from '../components/RiskReport';
import LoadingSpinner from '../components/LoadingSpinner';
import { useLanguage } from '../hooks/useLanguage';

const SAMPLES = [
  {
    title: 'Bank KYC Urgent Suspension Scam',
    text: 'Dear customer, your SBI bank account has been suspended due to pending KYC update. Click http://bit.ly/sbi-kyc-update immediately or your account will be permanently blocked in 24 hours.',
  },
  {
    title: 'Lottery / Prize Claim Scam',
    text: 'Congratulations! You are selected as the lucky winner of ₹50,00,000 in Kaun Banega Crorepati lucky draw. Call WhatsApp customer care at +91-9876543210 and pay ₹2,500 registration fee to claim prize.',
  },
  {
    title: 'Legitimate Informational Message',
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
      console.error(err);
      const msg =
        err.response?.data?.detail ||
        (err.code === 'ERR_NETWORK' ? t.errors.network : t.errors.serverError);
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Text Analysis Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {t.scamDetector.title}
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
          {t.scamDetector.subtitle}
        </p>
      </div>

      {/* Input Form Section */}
      <div className="relative rounded-3xl bg-[#0d1635]/70 backdrop-blur-md border border-white/10 p-6 md:p-8 shadow-2xl shadow-black/40">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <label htmlFor="message-input" className="font-semibold text-slate-300">
              Suspicious Message Content
            </label>
            <span
              className={`font-mono ${
                message.length > 4500 ? 'text-amber-400 font-bold' : 'text-slate-500'
              }`}
            >
              {message.length} / {maxLength} {t.scamDetector.characters}
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
            placeholder={t.scamDetector.placeholder}
            className="w-full rounded-2xl bg-black/40 border border-white/10 p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition font-sans leading-relaxed resize-y min-h-[140px]"
          />

          {/* Sample quick picks */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1">
              <Lightbulb className="w-3 h-3 text-cyan-400" />
              Try a realistic sample:
            </span>
            <div className="flex flex-wrap gap-2">
              {SAMPLES.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setMessage(sample.text);
                    setError('');
                  }}
                  className="text-xs px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-cyan-500/30 text-slate-300 hover:text-cyan-300 transition text-left"
                >
                  {sample.title}
                </button>
              ))}
            </div>
          </div>

          {/* Error Banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center space-x-2 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={handleClear}
              disabled={loading || (!message && !result)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t.scamDetector.clear}</span>
            </button>

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={loading || !message.trim()}
              className="w-full sm:w-auto px-7 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 via-cyan-600 to-cyan-500 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.01] transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>{t.scamDetector.analyzing}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{t.scamDetector.analyze}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && <LoadingSpinner text={t.scamDetector.analyzing} />}

      {/* Results Display */}
      {result && (
        <RiskReport
          result={result}
          type="message"
          onReset={handleClear}
        />
      )}
    </div>
  );
}

