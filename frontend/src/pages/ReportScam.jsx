import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Send,
  UploadCloud,
  FileImage,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Shield,
  FileText,
  Phone,
  Globe,
  Calendar,
} from 'lucide-react';
import { submitCommunityReport } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';

const SCAM_CATEGORIES = [
  'Phishing',
  'UPI Fraud',
  'Fake Job Scam',
  'Investment Fraud',
  'OTP Scam',
  'Fake Website',
  'Social Media Scam',
  'Other',
];

export default function ReportScam() {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [category, setCategory] = useState('Phishing');
  const [suspiciousUrl, setSuspiciousUrl] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [suspiciousMessage, setSuspiciousMessage] = useState('');
  const [description, setDescription] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submittedReport, setSubmittedReport] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
      setError('Please upload a valid PNG, JPG, or WEBP image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Screenshot must be smaller than 5 MB.');
      return;
    }

    setError('');
    setScreenshot(file);
    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setScreenshot(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/report-scam' } } });
      return;
    }

    if (!description.trim()) {
      setError('Please provide an incident description.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('category', category);
      formData.append('description', description.trim());
      if (suspiciousUrl.trim()) formData.append('suspicious_url', suspiciousUrl.trim());
      if (phoneNumber.trim()) formData.append('phone_number', phoneNumber.trim());
      if (suspiciousMessage.trim()) formData.append('message', suspiciousMessage.trim());
      if (incidentDate) formData.append('incident_date', incidentDate);
      if (screenshot) formData.append('screenshot', screenshot);

      const res = await submitCommunityReport(formData);
      setSubmittedReport(res);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to submit scam report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyRef = () => {
    if (!submittedReport) return;
    navigator.clipboard.writeText(submittedReport.reference_id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleResetForm = () => {
    setCategory('Phishing');
    setSuspiciousUrl('');
    setPhoneNumber('');
    setSuspiciousMessage('');
    setDescription('');
    setIncidentDate('');
    handleRemoveFile();
    setSubmittedReport(null);
    setError('');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-8">
      {/* Toast */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-xl border border-emerald-400/30 text-sm font-medium"
          >
            <Check className="w-4 h-4" />
            <span>Reference ID copied to clipboard!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>Community Defense Network</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Report a Scam Incident
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
          Help protect thousands of fellow users by reporting active fraud campaigns, fake callers, and malicious links.
        </p>

        {isAuthenticated && (
          <div className="pt-2">
            <Link
              to="/my-reports"
              className="inline-flex items-center space-x-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium"
            >
              <span>View My Submitted Reports &rarr;</span>
            </Link>
          </div>
        )}
      </div>

      {!isAuthenticated && (
        <div className="p-4 rounded-2xl bg-amber-500/[0.08] border border-amber-500/30 text-xs text-amber-200 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <span>Sign in to track your reported incidents and receive moderation updates.</span>
          </div>
          <Link
            to="/login"
            className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 font-semibold text-white whitespace-nowrap"
          >
            Sign In
          </Link>
        </div>
      )}

      {/* Success View */}
      {submittedReport ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl bg-[#0d1635]/80 backdrop-blur-xl border border-white/10 p-6 sm:p-8 shadow-2xl space-y-6 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Report Successfully Logged</h2>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Thank you for contributing to digital safety. Your report has been assigned a permanent reference identifier and queued for threat review.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 max-w-sm mx-auto flex items-center justify-between">
            <div className="text-left">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-mono">Reference ID</span>
              <span className="text-base font-bold text-cyan-400 font-mono">{submittedReport.reference_id}</span>
            </div>
            <button
              onClick={handleCopyRef}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
              title="Copy Reference ID"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/my-reports"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/10 transition"
            >
              View In My Reports
            </Link>
            <button
              onClick={handleResetForm}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 to-cyan-500 shadow-md shadow-cyan-500/20 transition"
            >
              Submit Another Report
            </button>
          </div>
        </motion.div>
      ) : (
        /* Report Form */
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl bg-[#0d1635]/80 backdrop-blur-xl border border-white/10 p-6 sm:p-8 shadow-2xl space-y-6"
        >
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Scam Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Scam Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500 font-sans"
            >
              {SCAM_CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-[#0a0e1a] text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>Suspicious URL (Optional)</span>
              </label>
              <input
                type="text"
                value={suspiciousUrl}
                onChange={(e) => setSuspiciousUrl(e.target.value)}
                placeholder="https://fake-bank-login.xyz"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-cyan-400" />
                <span>Caller / WhatsApp Number (Optional)</span>
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91-9876543210"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          {/* Suspicious Message */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Exact Scam Message Text (Optional)</span>
            </label>
            <textarea
              rows={3}
              value={suspiciousMessage}
              onChange={(e) => setSuspiciousMessage(e.target.value)}
              placeholder="Paste the SMS, email body, or chat message here..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans resize-y"
            />
          </div>

          {/* Incident Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Incident Description &amp; How It Happened *
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe how you or someone else were contacted, what the scammer claimed, and any financial demands made..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans resize-y"
            />
          </div>

          {/* Date & Screenshot row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>Date Incident Occurred</span>
              </label>
              <input
                type="date"
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <FileImage className="w-3.5 h-3.5 text-cyan-400" />
                <span>Supporting Screenshot (Optional)</span>
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/jpg, image/webp"
                className="hidden"
              />
              {!screenshot ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-dashed border-white/20 text-xs text-slate-400 hover:text-white transition flex items-center justify-center space-x-2"
                >
                  <UploadCloud className="w-4 h-4 text-cyan-400" />
                  <span>Attach Image (PNG/JPG &lt; 5MB)</span>
                </button>
              ) : (
                <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/10 text-xs">
                  <span className="truncate max-w-[180px] text-slate-200">{screenshot.name}</span>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1 text-rose-400 hover:text-rose-300"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-4 border-t border-white/10 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 via-cyan-600 to-cyan-500 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.01] transition disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Scam Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

