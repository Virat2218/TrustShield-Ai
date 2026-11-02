import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Trash2,
  Copy,
  Check,
  Plus,
  Calendar,
  Phone,
  Globe,
  ExternalLink,
} from 'lucide-react';
import { getUserReports, deleteUserReport } from '../services/api';

export default function MyReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    async function loadReports() {
      try {
        const data = await getUserReports();
        setReports(data);
      } catch (err) {
        console.error('Failed to load user reports:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  const handleDelete = async (id, refId) => {
    if (!window.confirm(`Are you sure you want to withdraw report ${refId}?`)) return;
    try {
      await deleteUserReport(id);
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error('Failed to delete report:', err);
    }
  };

  const handleCopyRef = (refId) => {
    navigator.clipboard.writeText(refId).then(() => {
      setCopiedId(refId);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Verified':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Under Review':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'Rejected':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      default:
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            My Submitted Scam Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track investigation statuses and moderation outcomes of your submitted threat intelligence.
          </p>
        </div>

        <Link
          to="/report-scam"
          className="self-start sm:self-auto inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 to-cyan-500 shadow-md shadow-cyan-500/20 hover:scale-[1.01] transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Scam Report</span>
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400 flex flex-col items-center justify-center space-y-2">
          <span className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></span>
          <span>Loading your reports...</span>
        </div>
      ) : reports.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#0d1635]/60 border border-white/10 text-center space-y-4">
          <FileText className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Scam Reports Logged Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You haven't reported any suspicious calls, links, or messages yet. If you encounter active fraud, log it here to alert the community.
          </p>
          <Link
            to="/report-scam"
            className="inline-block px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition"
          >
            Report an Incident Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((rep) => (
            <motion.div
              key={rep.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 sm:p-6 rounded-3xl bg-[#0d1635]/70 backdrop-blur-xl border border-white/10 shadow-lg space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-cyan-400">
                    {rep.category}
                  </span>
                  <div className="flex items-center space-x-1.5 text-xs font-mono text-slate-300">
                    <span>ID: {rep.reference_id}</span>
                    <button
                      onClick={() => handleCopyRef(rep.reference_id)}
                      className="p-1 hover:text-cyan-400 transition"
                      title="Copy Reference ID"
                    >
                      {copiedId === rep.reference_id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(
                      rep.status
                    )}`}
                  >
                    {rep.status}
                  </span>
                  <button
                    onClick={() => handleDelete(rep.id, rep.reference_id)}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition text-xs"
                    title="Delete report"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {rep.description}
              </p>

              {/* Metadata chips */}
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-2 border-t border-white/5">
                {rep.suspicious_url && (
                  <span className="flex items-center gap-1 font-mono text-cyan-400/90 truncate max-w-xs">
                    <Globe className="w-3 h-3" />
                    {rep.suspicious_url}
                  </span>
                )}
                {rep.phone_number && (
                  <span className="flex items-center gap-1 font-mono text-cyan-400/90">
                    <Phone className="w-3 h-3" />
                    {rep.phone_number}
                  </span>
                )}
                <span className="flex items-center gap-1 text-slate-500 ml-auto">
                  <Calendar className="w-3 h-3" />
                  Logged {new Date(rep.created_at).toLocaleDateString()}
                </span>
              </div>

              {rep.moderation_notes && (
                <div className="p-3 rounded-xl bg-cyan-500/[0.05] border border-cyan-500/20 text-xs text-cyan-300">
                  <strong className="text-white">Security Analyst Note: </strong>
                  {rep.moderation_notes}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

