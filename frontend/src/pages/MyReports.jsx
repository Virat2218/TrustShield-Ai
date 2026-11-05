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
  Paperclip,
} from 'lucide-react';
import { getUserReports, deleteUserReport, getReportAttachmentBlobUrl } from '../services/api';

export default function MyReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [attachmentLoading, setAttachmentLoading] = useState(null);

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

  const handleViewAttachment = async (reportId) => {
    setAttachmentLoading(reportId);
    try {
      const blobUrl = await getReportAttachmentBlobUrl(reportId);
      window.open(blobUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('Failed to load attachment:', err);
    } finally {
      setAttachmentLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Verified':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Under Review':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            My Submitted Scam Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track investigation statuses and moderation outcomes of your submitted threat intelligence.
          </p>
        </div>

        <Link
          to="/report-scam"
          className="self-start sm:self-auto inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-[#0d766e] hover:bg-[#0f766e] shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Scam Report</span>
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-500 flex flex-col items-center justify-center space-y-2">
          <span className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></span>
          <span>Loading your reports...</span>
        </div>
      ) : reports.length === 0 ? (
        <div className="p-12 rounded-2xl bg-white border border-slate-200 text-center space-y-4 shadow-sm">
          <FileText className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No Scam Reports Logged Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven't reported any suspicious calls, links, or messages yet. If you encounter active fraud, log it here to alert the community.
          </p>
          <Link
            to="/report-scam"
            className="inline-block px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition"
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
              className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-50 border border-teal-200 text-teal-700">
                    {rep.category}
                  </span>
                  <div className="flex items-center space-x-1.5 text-xs font-mono text-slate-600">
                    <span>ID: {rep.reference_id}</span>
                    <button
                      onClick={() => handleCopyRef(rep.reference_id)}
                      className="p-1 hover:text-teal-700 transition"
                      title="Copy Reference ID"
                    >
                      {copiedId === rep.reference_id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
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
                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition text-xs"
                    title="Delete report"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {rep.description}
              </p>

              {/* Metadata chips */}
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                {rep.suspicious_url && (
                  <span className="flex items-center gap-1 font-mono text-teal-700 truncate max-w-xs">
                    <Globe className="w-3 h-3" />
                    {rep.suspicious_url}
                  </span>
                )}
                {rep.phone_number && (
                  <span className="flex items-center gap-1 font-mono text-teal-700">
                    <Phone className="w-3 h-3" />
                    {rep.phone_number}
                  </span>
                )}
                {rep.has_attachment && (
                  <button
                    onClick={() => handleViewAttachment(rep.id)}
                    disabled={attachmentLoading === rep.id}
                    className="flex items-center gap-1 text-teal-700 hover:text-teal-800 transition disabled:opacity-50 cursor-pointer"
                    title="View screenshot attachment"
                  >
                    <Paperclip className="w-3 h-3" />
                    {attachmentLoading === rep.id ? 'Loading…' : 'Screenshot'}
                  </button>
                )}
                <span className="flex items-center gap-1 text-slate-400 ml-auto">
                  <Calendar className="w-3 h-3" />
                  Logged {new Date(rep.created_at).toLocaleDateString()}
                </span>
              </div>

              {rep.moderation_notes && (
                <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-800">
                  <strong className="text-teal-900">Security Analyst Note: </strong>
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

