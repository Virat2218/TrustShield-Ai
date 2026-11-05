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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 space-y-8">
      {/* Toast */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 flex items-center gap-2 bg-emerald-700 text-white px-4 py-2.5 rounded-xl shadow-xl text-sm font-medium"
            role="status"
          >
            <Check className="w-4 h-4" />
            <span>Reference ID copied!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-[#0d766e] text-xs font-bold uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>Community Threat Registry</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Report a Scam Incident
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-xl">
          Log suspicious phone numbers, deceptive links, or fraudulent payment demands to
          help others stay alert.
        </p>

        {isAuthenticated && (
          <div className="pt-1">
            <Link
              to="/my-reports"
              className="inline-flex items-center gap-1.5 text-xs text-[#0d766e] hover:text-[#0f766e] font-bold"
            >
              <span>View My Submitted Reports &rarr;</span>
            </Link>
          </div>
        )}
      </header>

      {!isAuthenticated && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>An account is required to log and track your incident reports.</span>
          </div>
          <Link
            to="/login"
            state={{ from: { pathname: '/report-scam' } }}
            className="px-3.5 py-1.5 rounded-xl bg-[#0d766e] text-white font-bold whitespace-nowrap shadow-xs hover:bg-[#0f766e] transition"
          >
            Sign In to Continue
          </Link>
        </div>
      )}

      {/* Success View */}
      {submittedReport ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xl space-y-6 text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold text-slate-900">Report Successfully Logged</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Your incident report has been recorded with a permanent tracking reference.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-sm mx-auto flex items-center justify-between">
            <div className="text-left">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-mono">Reference ID</span>
              <span className="text-base font-bold text-[#0d766e] font-mono">{submittedReport.reference_id}</span>
            </div>
            <button
              type="button"
              onClick={handleCopyRef}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition"
              title="Copy Reference ID"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/my-reports"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition"
            >
              View In My Reports
            </Link>
            <button
              type="button"
              onClick={handleResetForm}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-[#0d766e] hover:bg-[#0f766e] shadow-sm transition"
            >
              Submit Another Report
            </button>
          </div>
        </motion.div>
      ) : (
        /* Report Form */
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-xl shadow-slate-200/40 space-y-6"
        >
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Scam Category */}
          <div>
            <label htmlFor="scam-category" className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Scam Category <span className="text-rose-500">*</span>
            </label>
            <select
              id="scam-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#0d766e] font-sans"
            >
              {SCAM_CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-white text-slate-900">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="suspicious-url" className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#0d766e]" />
                <span>Suspicious URL (Optional)</span>
              </label>
              <input
                id="suspicious-url"
                type="text"
                value={suspiciousUrl}
                onChange={(e) => setSuspiciousUrl(e.target.value)}
                placeholder="https://suspicious-site.example"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0d766e] font-mono"
              />
            </div>

            <div>
              <label htmlFor="phone-number" className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#0d766e]" />
                <span>Caller / WhatsApp Number (Optional)</span>
              </label>
              <input
                id="phone-number"
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91-9876543210"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0d766e] font-mono"
              />
            </div>
          </div>

          {/* Suspicious Message */}
          <div>
            <label htmlFor="suspicious-message" className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#0d766e]" />
              <span>Exact Scam Message Text (Optional)</span>
            </label>
            <textarea
              id="suspicious-message"
              rows={3}
              value={suspiciousMessage}
              onChange={(e) => setSuspiciousMessage(e.target.value)}
              placeholder="Paste the message content here..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0d766e] font-sans resize-y"
            />
          </div>

          {/* Incident Description */}
          <div>
            <label htmlFor="incident-description" className="block text-xs font-bold text-slate-700 mb-1.5">
              Incident Description &amp; What Happened <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="incident-description"
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what occurred, what claims were made, and any money or info requested..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0d766e] font-sans resize-y"
            />
          </div>

          {/* Date & Screenshot row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
            <div>
              <label htmlFor="incident-date" className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#0d766e]" />
                <span>Date Incident Occurred</span>
              </label>
              <input
                id="incident-date"
                type="date"
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#0d766e]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <FileImage className="w-3.5 h-3.5 text-[#0d766e]" />
                <span>Supporting Screenshot (Optional)</span>
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/jpg, image/webp"
                className="hidden"
                id="screenshot-attachment"
              />
              {!screenshot ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 text-xs text-slate-600 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4 text-[#0d766e]" />
                  <span>Attach Image (PNG/JPG &lt; 5MB)</span>
                </button>
              ) : (
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="truncate max-w-[180px] text-slate-800">{screenshot.name}</span>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1 text-rose-600 hover:text-rose-800"
                    aria-label="Remove attached image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-7 py-3 rounded-xl text-sm font-bold text-white bg-[#0d766e] hover:bg-[#0f766e] shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  <Send className="w-4 h-4" aria-hidden="true" />
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
