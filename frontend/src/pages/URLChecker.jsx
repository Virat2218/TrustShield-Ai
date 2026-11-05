import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Send, Trash2, AlertCircle, Lightbulb, Lock } from 'lucide-react';
import { analyzeUrl } from '../services/api';
import RiskReport from '../components/RiskReport';
import LoadingSpinner from '../components/LoadingSpinner';
import { useLanguage } from '../hooks/useLanguage';

const URL_SAMPLES = [
  { title: 'IP-address phishing site', url: 'http://192.168.1.105/login-verification' },
  { title: 'Suspicious TLD fake bank', url: 'http://sbi-secure-update.xyz/kyc' },
  { title: 'URL shortener (hidden target)', url: 'https://bit.ly/3xY9kL2' },
  { title: 'Legitimate HTTPS website', url: 'https://en.wikipedia.org/wiki/Computer_security' },
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 space-y-8">

      {/* Page header */}
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-widest">
          <Globe className="w-3.5 h-3.5" aria-hidden="true" />
          URL Safety Check
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {t.urlChecker.title}
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-xl">
          Enter any website address you received in a message, email, or QR code. The
          checker analyses structural patterns and, when configured, checks Google Safe Browsing.
          A passing result does not guarantee a site is safe — always use caution with
          unexpected links.
        </p>
      </header>

      {/* Input form */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-6 md:p-8 space-y-5">
        <div>
          <label htmlFor="url-input" className="block text-sm font-medium text-slate-200 mb-2">
            Website address to check
          </label>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Lock className="w-4 h-4 text-slate-500" aria-hidden="true" />
            </div>
            <input
              id="url-input"
              type="url"
              inputMode="url"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAnalyze();
              }}
              placeholder="https://example.com or paste any link…"
              aria-describedby="url-hint"
              className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-black/30 border border-white/[0.08] text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40 transition font-mono"
            />
          </div>
          <p id="url-hint" className="mt-1.5 text-xs text-slate-500">
            The URL is sent to our backend for analysis. We do not visit or load the page on
            your behalf.
          </p>
        </div>

        {/* Safe display of the entered URL — no clickable link */}
        {url.trim() && !error && (
          <div className="text-xs text-slate-500 font-mono bg-black/20 border border-white/[0.05] rounded-lg px-3 py-2 truncate" aria-label="Entered URL preview">
            <span className="text-slate-600 mr-1">Checking:</span>
            <span className="text-slate-300">{url.trim()}</span>
          </div>
        )}

        {/* Sample buttons */}
        <div className="space-y-2">
          <span className="flex items-center gap-1 text-[11px] uppercase tracking-wider font-semibold text-slate-500">
            <Lightbulb className="w-3 h-3 text-cyan-400/70" aria-hidden="true" />
            Try a demo example
          </span>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Demo URL examples">
            {URL_SAMPLES.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setUrl(sample.url);
                  setError('');
                  setResult(null);
                }}
                className="text-xs px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-cyan-500/30 text-slate-400 hover:text-cyan-300 transition"
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
            disabled={loading || (!url && !result)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            {t.urlChecker.clear}
          </button>

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={loading || !url.trim()}
            className="w-full sm:w-auto px-7 py-3 rounded-xl text-sm font-bold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md shadow-cyan-900/30 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            aria-busy={loading}
          >
            {loading ? (
              <>
                <span
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full motion-safe:animate-spin"
                  aria-hidden="true"
                />
                {t.urlChecker.analyzing}
              </>
            ) : (
              <>
                <Send className="w-4 h-4" aria-hidden="true" />
                {t.urlChecker.analyze}
              </>
            )}
          </button>
        </div>
      </div>

      {loading && <LoadingSpinner text={t.urlChecker.analyzing} />}

      {result && (
        <RiskReport result={result} type="url" onReset={handleClear} submittedContent={url} />
      )}
    </div>
  );
}
