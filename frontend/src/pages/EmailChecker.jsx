import { useState } from 'react';
import {
  Mail,
  AlertTriangle,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles,
  Info,
  Check,
  X,
} from 'lucide-react';
import { analyzeEmail } from '../services/api';

export default function EmailChecker() {
  const [senderEmail, setSenderEmail] = useState('');
  const [senderDisplayName, setSenderDisplayName] = useState('');
  const [replyToEmail, setReplyToEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [headersText, setHeadersText] = useState('');
  const [showHeaders, setShowHeaders] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [apiError, setApiError] = useState(null);

  const samples = [
    {
      title: 'Fake PayPal Account Suspension',
      name: 'PayPal Customer Security',
      email: 'support@paypal.account-verify-center.top',
      replyTo: 'phish-collector@gmail.com',
      subject: 'URGENT: Your PayPal Account has been temporarily restricted',
      headers:
        'Received-SPF: fail (domain of account-verify-center.top does not designate 192.0.2.1)\nAuthentication-Results: mx.google.com; dkim=fail; dmarc=fail (p=REJECT)',
    },
    {
      title: 'Bank KYC Urgent Update',
      name: 'HDFC Bank Alerts',
      email: 'kyc-update-noreply@hdfc-netbanking-portal.xyz',
      replyTo: '',
      subject: 'Mandatory PAN card re-verification required within 12 hours',
      headers:
        'Received-SPF: softfail\nAuthentication-Results: mx.google.com; dkim=none; dmarc=fail',
    },
    {
      title: 'Legitimate Corporate Notification',
      name: 'GitHub Security',
      email: 'support@github.com',
      replyTo: '',
      subject: '[GitHub] A personal access token has expired',
      headers:
        'Received-SPF: pass (domain of github.com designates 192.30.252.0)\nAuthentication-Results: mx.google.com; dkim=pass; dmarc=pass',
    },
  ];

  const loadSample = (s) => {
    setSenderDisplayName(s.name);
    setSenderEmail(s.email);
    setReplyToEmail(s.replyTo);
    setSubject(s.subject);
    setHeadersText(s.headers);
    if (s.headers) setShowHeaders(true);
    setResult(null);
    setApiError(null);
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!senderEmail.trim() && !headersText.trim() && !senderDisplayName.trim()) return;

    setIsAnalyzing(true);
    setApiError(null);
    setResult(null);

    try {
      const response = await analyzeEmail({
        sender_email: senderEmail.trim(),
        sender_display_name: senderDisplayName.trim(),
        reply_to_email: replyToEmail.trim(),
        subject: subject.trim(),
        headers_text: headersText.trim(),
      });
      setResult(response);
    } catch (err) {
      setApiError(
        'Unable to complete email analysis. Please verify your internet connection or check backend status.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearForm = () => {
    setSenderEmail('');
    setSenderDisplayName('');
    setReplyToEmail('');
    setSubject('');
    setHeadersText('');
    setResult(null);
    setApiError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs font-semibold text-[#0d766e]">
            <Mail className="w-4 h-4" />
            <span>Phishing & Sender Identity Inspector</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Email Sender & Header Checker
          </h1>
          <p className="text-slate-600 max-w-xl mx-auto text-sm sm:text-base">
            Detect spoofed sender names, fake banking domains, reply-to traps, and SPF/DKIM/DMARC authentication failures.
          </p>
        </div>

        {/* Sample Templates */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Test with a sample email:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {samples.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => loadSample(s)}
                className="text-left p-3 rounded-xl bg-white border border-slate-200 hover:border-teal-300 hover:bg-teal-50/30 transition text-xs font-medium text-slate-800 flex items-center justify-between cursor-pointer"
              >
                <span className="truncate">{s.title}</span>
                <span className="text-teal-700 font-bold ml-1 flex-shrink-0">Load</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleAnalyze} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="space-y-1.5">
              <label htmlFor="display-name" className="text-xs font-bold text-slate-700">
                Sender Display Name
              </label>
              <input
                id="display-name"
                type="text"
                value={senderDisplayName}
                onChange={(e) => setSenderDisplayName(e.target.value)}
                placeholder="e.g. PayPal Security or State Bank"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d766e] focus:bg-white transition"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="sender-email" className="text-xs font-bold text-slate-700">
                Sender Email Address <span className="text-teal-600">*</span>
              </label>
              <input
                id="sender-email"
                type="text"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="e.g. support@paypal.security-center.top"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d766e] focus:bg-white transition"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reply-to" className="text-xs font-bold text-slate-700">
                Reply-To Address (Optional)
              </label>
              <input
                id="reply-to"
                type="text"
                value={replyToEmail}
                onChange={(e) => setReplyToEmail(e.target.value)}
                placeholder="e.g. phish-inbox@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d766e] focus:bg-white transition"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="subject" className="text-xs font-bold text-slate-700">
                Email Subject Line (Optional)
              </label>
              <input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Urgent: Account Restricted"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d766e] focus:bg-white transition"
              />
            </div>

          </div>

          {/* Collapsible Headers Box */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowHeaders(!showHeaders)}
              className="flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 cursor-pointer"
            >
              {showHeaders ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              <span>{showHeaders ? 'Hide Raw Email Headers' : 'Paste Raw Email Headers (Optional SPF / DKIM verification)'}</span>
            </button>

            {showHeaders && (
              <div className="mt-3 space-y-1.5">
                <textarea
                  rows={4}
                  value={headersText}
                  onChange={(e) => setHeadersText(e.target.value)}
                  placeholder="Paste Received-SPF, Authentication-Results, or full header block here..."
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d766e] focus:bg-white transition"
                />
                <p className="text-[11px] text-slate-500">
                  Tip: In Gmail, click the three dots &gt; "Show original" to find headers.
                </p>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={clearForm}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Clear
            </button>

            <button
              type="submit"
              disabled={isAnalyzing || (!senderEmail && !headersText && !senderDisplayName)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0d766e] hover:bg-[#0f766e] text-white font-semibold text-xs shadow-sm transition cursor-pointer disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing Email Security...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Inspect Email Sender</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* API Error Notification */}
        {apiError && (
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-amber-900">Service Notice</h3>
              <p className="text-xs text-amber-800 leading-relaxed">{apiError}</p>
            </div>
          </div>
        )}

        {/* Analysis Result */}
        {result && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
            
            {/* Verdict Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Email Authentication Verdict
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                  {result.risk_level === 'High'
                    ? 'Phishing or Sender Spoofing Detected'
                    : result.risk_level === 'Medium'
                    ? 'Suspicious Sender Indicators Found'
                    : 'Sender Looks Legitimate & Verified'}
                </h3>
              </div>
              <div>
                <span
                  className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                    result.risk_level === 'Low'
                      ? 'bg-emerald-100 text-emerald-800'
                      : result.risk_level === 'Medium'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {result.risk_level} Risk ({result.risk_score}/100)
                </span>
              </div>
            </div>

            {/* Protocol Verdict Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* SPF Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">SPF Verdict</span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      result.spf_status?.status === 'PASS'
                        ? 'bg-emerald-100 text-emerald-800'
                        : result.spf_status?.status === 'FAIL'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {result.spf_status?.status || 'UNKNOWN'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {result.spf_status?.details || 'Validates whether sending IP is authorized.'}
                </p>
              </div>

              {/* DKIM Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">DKIM Signature</span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      result.dkim_status?.status === 'PASS'
                        ? 'bg-emerald-100 text-emerald-800'
                        : result.dkim_status?.status === 'FAIL'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {result.dkim_status?.status || 'UNKNOWN'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {result.dkim_status?.details || 'Cryptographic signature from sending server.'}
                </p>
              </div>

              {/* DMARC Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">DMARC Policy</span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      result.dmarc_status?.status === 'PASS'
                        ? 'bg-emerald-100 text-emerald-800'
                        : result.dmarc_status?.status === 'FAIL'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {result.dmarc_status?.status || 'UNKNOWN'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {result.dmarc_status?.details || 'Domain alignment and anti-spoofing policy.'}
                </p>
              </div>

            </div>

            {/* Summary */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Summary of Findings
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed font-normal">
                {result.summary}
              </p>
            </div>

            {/* Warning Signs */}
            {result.warning_signs?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Warning Signs & Inconsistencies ({result.warning_signs.length})
                </h4>
                <div className="space-y-1.5">
                  {result.warning_signs.map((sign, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50/70 border border-rose-100 text-xs text-rose-900"
                    >
                      <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                      <span>{sign}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Recommended Action
                </h4>
                <div className="space-y-1.5">
                  {result.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle className="w-4 h-4 text-[#0d766e] flex-shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
