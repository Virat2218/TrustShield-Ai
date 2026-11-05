import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Send, Trash2, AlertCircle, Lightbulb, Lock } from 'lucide-react';
import { analyzeUrl } from '../services/api';
import RiskReport from '../components/RiskReport';
import LoadingSpinner from '../components/LoadingSpinner';
import { useLanguage } from '../hooks/useLanguage';

const URL_SAMPLES = [
  { title: 'IP-address link', url: 'http://192.168.1.105/login-verification' },
  { title: 'Suspicious fake bank', url: 'http://sbi-secure-update.xyz/kyc' },
  { title: 'Shortened link', url: 'https://bit.ly/3xY9kL2' },
  { title: 'Legitimate website', url: 'https://en.wikipedia.org/wiki/Computer_security' },
];

export default function URLChecker() {
  const { t } = useLanguage();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setError(t.errors.emptyUrl);
      return;
    }

    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    try {
      new URL(cleanUrl);
    } catch {
      setError(t.errors.invalidUrl);
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);

    try {
      const data = await analyzeUrl(cleanUrl);
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
    setUrl('');
    setError('');
    setResult(null);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 space-y-8">

      {/* Page header */}
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-[#0d766e] text-xs font-bold uppercase tracking-wider">
          <Globe className="w-4 h-4" aria-hidden="true" />
          <span>Website Link Checker</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Check a Website Link Before You Click
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-xl">
          Enter any link from an email, SMS, or QR code. We inspect the domain structure,
          redirect traps, and reputation indicators.
        </p>
      </header>

      {/* Input form */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 md:p-8 shadow-xl shadow-slate-200/40 space-y-5">
        <div>
          <label htmlFor="url-input" className="block text-sm font-bold text-slate-800 mb-2">
            Website link or URL
          </label>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" aria-hidden="true" />
            </div>
            <input
              id="url-input"
              type="url"
              inputMode="url"
              autoComplete="off"
              spellCheck={false}
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAnalyze();
              }}
              placeholder="https://example.com or paste any link..."
              className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0d766e] focus:ring-1 focus:ring-[#0d766e]/30 transition font-mono"
            />
          </div>
        </div>

        {/* Safe preview (non-clickable) */}
        {url.trim() && !error && (
          <div className="text-xs text-slate-500 font-mono bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 truncate">
            <span className="text-slate-400 mr-1.5 font-sans font-medium">Checking:</span>
            <span className="text-slate-800">{url.trim()}</span>
          </div>
        )}

        {/* Demo examples */}
        <div className="space-y-2">
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
            Try a sample link
          </span>
          <div className="flex flex-wrap gap-2">
            {URL_SAMPLES.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setUrl(sample.url);
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
            disabled={loading || (!url && !result)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Clear</span>
          </button>

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={loading || !url.trim()}
            className="w-full sm:w-auto px-7 py-3 rounded-xl text-sm font-bold text-white bg-[#0d766e] hover:bg-[#0f766e] shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            aria-busy={loading}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Checking link...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" aria-hidden="true" />
                <span>Analyze Link</span>
              </>
            )}
          </button>
        </div>
      </div>

      {loading && <LoadingSpinner text="Analyzing domain indicators..." />}

      {result && (
        <RiskReport result={result} type="url" onReset={handleClear} submittedContent={url} />
      )}
    </div>
  );
}
