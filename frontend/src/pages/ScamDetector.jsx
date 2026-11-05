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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 space-y-8">

      {/* Page header */}
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-widest">
          <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
          Scam Message Detection
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {t.scamDetector.title}
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-xl">
          Paste any suspicious SMS, WhatsApp message, email, or online chat. The analysis
          looks for common patterns used in scams — but always use your own judgement too.
        </p>
      </header>

      {/* Input form */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-6 md:p-8 space-y-5">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="message-input" className="text-sm font-medium text-slate-200">
              Paste the suspicious message here
            </label>
            <span
              className={`text-xs font-mono tabular-nums ${
                message.length > 4500 ? 'text-amber-400 font-bold' : 'text-slate-500'
              }`}
              aria-live="polite"
              aria-label={`${message.length} of ${maxLength} characters`}
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
            placeholder="e.g. 'Your account will be suspended. Click this link to verify…'"
            aria-describedby="message-hint"
            className="w-full rounded-xl bg-black/30 border border-white/[0.08] p-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40 transition font-sans leading-relaxed resize-y min-h-[140px]"
          />
          <p id="message-hint" className="mt-1.5 text-xs text-slate-500">
            English and Hindi text supported. Press <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[11px]">Ctrl&nbsp;+&nbsp;Enter</kbd> to analyze.
          </p>
        </div>

        {/* Sample buttons */}
        <div className="space-y-2">
          <span className="flex items-center gap-1 text-[11px] uppercase tracking-wider font-semibold text-slate-500">
            <Lightbulb className="w-3 h-3 text-cyan-400/70" aria-hidden="true" />
            Try a demo example
          </span>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Demo examples">
            {SAMPLES.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setMessage(sample.text);
                  setError('');
                  setResult(null);
                }}
                className="text-xs px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-cyan-500/30 text-slate-400 hover:text-cyan-300 transition"
              >
                {sample.title}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-600">
            These are realistic demo texts — labeled clearly so results can be compared.
          </p>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              role="alert"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={handleClear}
            disabled={loading || (!message && !result)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            {t.scamDetector.clear}
          </button>

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={loading || !message.trim()}
            className="w-full sm:w-auto px-7 py-3 rounded-xl text-sm font-bold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md shadow-cyan-900/30 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            aria-busy={loading}
          >
            {loading ? (
              <>
                <span
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full motion-safe:animate-spin"
                  aria-hidden="true"
                />
                {t.scamDetector.analyzing}
              </>
            ) : (
              <>
                <Send className="w-4 h-4" aria-hidden="true" />
                {t.scamDetector.analyze}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && <LoadingSpinner text={t.scamDetector.analyzing} />}

      {/* Result */}
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
