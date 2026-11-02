import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  Send,
  Trash2,
  AlertCircle,
  Lightbulb,
  ShieldAlert,
} from 'lucide-react';
import { analyzeUrl } from '../services/api';
import RiskReport from '../components/RiskReport';
import LoadingSpinner from '../components/LoadingSpinner';
import { useLanguage } from '../hooks/useLanguage';

const URL_SAMPLES = [
  {
    title: 'IP Address Phishing Site',
    url: 'http://192.168.1.105/login-verification',
  },
  {
    title: 'Suspicious TLD Fake Bank',
    url: 'http://sbi-secure-update.xyz/kyc',
  },
  {
    title: 'URL Shortener (Hidden Target)',
    url: 'https://bit.ly/3xY9kL2',
  },
  {
    title: 'Legitimate HTTPS Website',
    url: 'https://en.wikipedia.org/wiki/Computer_security',
  },
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

    // Basic client validation
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
    setUrl('');
    setError('');
    setResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
          <Globe className="w-3.5 h-3.5" />
          <span>Domain & Link Intelligence</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {t.urlChecker.title}
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
          {t.urlChecker.subtitle}
        </p>
      </div>

      {/* Input Form Section */}
      <div className="relative rounded-3xl bg-[#0d1635]/70 backdrop-blur-md border border-white/10 p-6 md:p-8 shadow-2xl shadow-black/40">
        <div className="space-y-4">
          <label htmlFor="url-input" className="block text-xs font-semibold text-slate-300">
            Target Website URL
          </label>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Globe className="w-5 h-5 text-slate-500" />
            </div>
            <input
              id="url-input"
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAnalyze();
              }}
              placeholder={t.urlChecker.placeholder}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-black/40 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition font-mono"
            />
          </div>

          {/* Sample quick picks */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1">
              <Lightbulb className="w-3 h-3 text-cyan-400" />
              Try a sample link:
            </span>
            <div className="flex flex-wrap gap-2">
              {URL_SAMPLES.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setUrl(sample.url);
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
              disabled={loading || (!url && !result)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t.urlChecker.clear}</span>
            </button>

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={loading || !url.trim()}
              className="w-full sm:w-auto px-7 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 via-cyan-600 to-cyan-500 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.01] transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>{t.urlChecker.analyzing}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{t.urlChecker.analyze}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && <LoadingSpinner text={t.urlChecker.analyzing} />}

      {/* Results Display */}
      {result && (
        <RiskReport
          result={result}
          type="url"
          onReset={handleClear}
        />
      )}
    </div>
  );
}

