import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
  Share2,
  Check,
  Calendar,
} from 'lucide-react';
import { getPublicAlertDetail } from '../services/api';

const RISK_BADGES = {
  High: 'bg-rose-50 text-rose-700 border-rose-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export default function AlertDetail() {
  const { id } = useParams();
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchDetail() {
      setLoading(true);
      try {
        const data = await getPublicAlertDetail(id);
        setAlert(data);
      } catch (err) {
        console.error(err);
        setError('The requested advisory could not be found or has been retired.');
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [id]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center gap-3" role="status" aria-label="Loading advisory...">
        <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-t-teal-600 animate-spin" aria-hidden="true"></div>
        <p className="text-slate-500 text-sm">Loading advisory details...</p>
      </div>
    );
  }

  if (error || !alert) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-600 mx-auto" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-slate-900">Advisory Not Found</h1>
        <p className="text-slate-500 text-sm">{error}</p>
        <div className="pt-2">
          <Link
            to="/alerts"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0d766e] hover:bg-[#0f766e] text-white font-semibold text-xs transition"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back to Scam Alerts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 space-y-8">
      {/* Navigation & Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/alerts"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back to All Advisories
        </Link>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs text-slate-700 transition cursor-pointer"
          aria-label="Share this advisory link"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
              <span>Link Copied</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Share Advisory</span>
            </>
          )}
        </button>
      </div>

      {/* Main Advisory Card */}
      <article className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 pb-2">
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${
              RISK_BADGES[alert.risk_level] || RISK_BADGES.Medium
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
            {alert.risk_level} Risk Level
          </span>
          <span className="text-xs font-medium text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            {alert.category}
          </span>
          {alert.created_at && (
            <span className="text-xs text-slate-400 inline-flex items-center gap-1 ml-auto">
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
              {new Date(alert.created_at).toLocaleDateString()}
            </span>
          )}
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
            {alert.title}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-4 leading-relaxed">
            {alert.description}
          </p>
        </div>

        {/* Warning Signs */}
        {alert.warning_signs && alert.warning_signs.length > 0 && (
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" aria-hidden="true" />
              Key Red Flags &amp; Warning Signs
            </h2>
            <ul className="space-y-2">
              {alert.warning_signs.map((sign, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-amber-800"
                >
                  <span className="text-amber-600 font-bold">•</span>
                  <span>{sign}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Prevention Recommendations */}
        {alert.recommendations && alert.recommendations.length > 0 && (
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              Recommended Safety Precautions
            </h2>
            <div className="space-y-2">
              {alert.recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700"
                >
                  <span className="w-5 h-5 rounded-md bg-teal-100 text-teal-800 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Source Attributions */}
        {alert.source_name && (
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-700" aria-hidden="true" />
              <span>Source: <strong className="text-slate-800">{alert.source_name}</strong></span>
            </div>
            {alert.source_url && (
              <a
                href={alert.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-teal-700 hover:text-teal-800 font-medium transition"
              >
                Original Advisory Reference <ExternalLink className="w-3 h-3" aria-hidden="true" />
              </a>
            )}
          </div>
        )}
      </article>
    </div>
  );
}
