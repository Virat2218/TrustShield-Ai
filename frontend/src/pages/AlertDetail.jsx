import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
  PhoneCall,
  Globe,
  Share2,
  Check,
  Calendar,
  Lock,
} from 'lucide-react';
import { getPublicAlertDetail } from '../services/api';

const RISK_BADGES = {
  High: 'bg-red-500/10 text-red-400 border-red-500/30',
  Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  Low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
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
      <div className="min-h-screen bg-[#0a0e1a] text-white pt-24 pb-20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-3 border-cyan-400 border-t-transparent animate-spin"></div>
          <p className="text-gray-400 text-sm">Loading verified advisory...</p>
        </div>
      </div>
    );
  }

  if (error || !alert) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] text-white pt-28 pb-20 px-4">
        <div className="max-w-xl mx-auto text-center space-y-4">
          <ShieldAlert className="w-16 h-16 text-rose-400 mx-auto" />
          <h2 className="text-2xl font-bold text-white">Advisory Not Found</h2>
          <p className="text-gray-400 text-sm">{error}</p>
          <Link
            to="/alerts"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 text-black font-semibold text-sm hover:bg-cyan-400 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Scam Alerts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link
            to="/alerts"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to All Advisories
          </Link>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-gray-300 hover:text-white transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied Link!
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" /> Share Advisory
              </>
            )}
          </button>
        </div>

        {/* Title Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0f172a]/80 border border-gray-800 backdrop-blur-md space-y-4 shadow-xl">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${
                RISK_BADGES[alert.risk_level] || RISK_BADGES.Medium
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              {alert.risk_level} Risk Threat
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {alert.category}
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1 ml-auto">
              <Calendar className="w-3.5 h-3.5" />
              Published: {new Date(alert.published_at).toLocaleDateString()}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
            {alert.title}
          </h1>

          <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
            {alert.description}
          </p>

          <div className="pt-2 flex items-center gap-2 text-xs text-cyan-400">
            <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span>Official Reporting Source: <strong className="text-white">{alert.source_name}</strong></span>
          </div>
        </div>

        {/* Modus Operandi */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0f172a]/70 border border-gray-800 space-y-4">
          <div className="flex items-center gap-2 text-lg font-bold text-white">
            <Lock className="w-5 h-5 text-cyan-400" />
            How the Fraud Works (Modus Operandi)
          </div>
          <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800 text-sm text-gray-300 leading-relaxed space-y-3">
            <p>{alert.how_it_works}</p>
          </div>
        </div>

        {/* Warning Signs & Red Flags */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0f172a]/70 border border-rose-500/20 space-y-4">
          <div className="flex items-center gap-2 text-lg font-bold text-rose-300">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            Critical Red Flags & Warning Signs
          </div>
          <div className="grid grid-cols-1 gap-3">
            {alert.warning_signs && alert.warning_signs.map((sign, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-2xl bg-rose-500/5 border border-rose-500/20 text-sm text-gray-200"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center text-xs">
                  !
                </span>
                <span className="leading-relaxed">{sign}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Prevention Tips & Best Practices */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0f172a]/70 border border-emerald-500/20 space-y-4">
          <div className="flex items-center gap-2 text-lg font-bold text-emerald-300">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Recommended Safety Actions & Safeguards
          </div>
          <div className="grid grid-cols-1 gap-3">
            {alert.prevention_tips && alert.prevention_tips.map((tip, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-sm text-gray-200"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                  ✓
                </span>
                <span className="leading-relaxed">{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Helplines & Citation */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-gray-900 to-[#0f172a] border border-gray-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-cyan-400" />
            Official Incident Reporting & Verification Contacts
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-gray-900/80 border border-gray-800 space-y-1">
              <span className="text-gray-400">National Cyber Crime Helpline:</span>
              <p className="text-lg font-bold text-cyan-400 font-mono">1930</p>
              <p className="text-gray-500 text-[11px]">24x7 toll-free financial fraud immediate reporting</p>
            </div>
            <div className="p-3.5 rounded-xl bg-gray-900/80 border border-gray-800 space-y-1">
              <span className="text-gray-400">Government Cyber Portal:</span>
              <p className="text-base font-semibold text-white font-mono">cybercrime.gov.in</p>
              <p className="text-gray-500 text-[11px]">Official Ministry of Home Affairs incident portal</p>
            </div>
          </div>

          {alert.source_url && (
            <div className="pt-2 flex justify-end">
              <a
                href={alert.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-200 transition"
              >
                View Regulatory Advisory Reference <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

