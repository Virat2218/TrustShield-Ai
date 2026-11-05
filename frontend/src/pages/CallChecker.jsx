import { useState } from 'react';
import {
  PhoneCall,
  AlertTriangle,
  ShieldCheck,
  CheckCircle,
  Clock,
  Sparkles,
  RefreshCw,
  PhoneOff,
  Info,
  HelpCircle,
} from 'lucide-react';
import { analyzeMessage } from '../services/api';

export default function CallChecker() {
  const [transcript, setTranscript] = useState('');
  const [callerClaim, setCallerClaim] = useState('police');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [apiError, setApiError] = useState(null);

  const sampleScams = [
    {
      title: 'Digital Arrest / Police Impersonation',
      type: 'police',
      text: 'This is Officer Sharma from Delhi Police Crime Branch. A package in your name containing illegal passports and drugs was seized by Customs. A warrant has been issued against your Aadhaar. You are under digital arrest. Stay on this Skype video call and transfer funds to the court reserve account for verification or the team will raid your house in 1 hour.',
    },
    {
      title: 'Electricity Power Disconnection',
      type: 'utility',
      text: 'Dear consumer, your electricity power supply will be disconnected tonight at 9:30 PM because your previous month bill was not updated. Immediately call our electricity distribution officer at 9876543210 to update your bill or pay via the given link.',
    },
    {
      title: 'Bank Manager KYC / Account Freeze',
      type: 'bank',
      text: 'Hello, I am calling from State Bank head office. Your debit card and net banking are suspended due to pending KYC documents. Kindly tell me the 6-digit verification code sent to your mobile right now to renew your service and avoid permanent blockage.',
    },
    {
      title: 'Courier Parcel Interception',
      type: 'courier',
      text: 'This is automated notice from DHL FedEx international logistics. A parcel sent by you from Mumbai to Taiwan was intercepted with illegal chemicals. Press 9 to connect with investigation officer immediately to clear your name.',
    },
  ];

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!transcript.trim()) return;

    setIsAnalyzing(true);
    setApiError(null);
    setResult(null);

    try {
      const response = await analyzeMessage(transcript.trim());
      setResult(response);
    } catch (err) {
      setApiError(
        'Unable to connect to the analysis engine. Please verify the backend is running or review the manual safety guidelines below.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadSample = (sample) => {
    setTranscript(sample.text);
    setCallerClaim(sample.type);
    setResult(null);
    setApiError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs font-semibold text-[#0d766e]">
            <PhoneCall className="w-4 h-4" />
            <span>Vishing & Phone Fraud Inspector</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Scam Call & Voice Message Checker
          </h1>
          <p className="text-slate-600 max-w-xl mx-auto text-sm sm:text-base">
            Paste notes or transcripts from a suspicious call (police "digital arrest", bank manager, electricity cutoff, courier alert) to evaluate risk patterns.
          </p>
        </div>

        {/* Sample Templates */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Try a common scam call pattern:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sampleScams.map((sample, i) => (
              <button
                key={i}
                type="button"
                onClick={() => loadSample(sample)}
                className="text-left p-3 rounded-xl bg-white border border-slate-200 hover:border-teal-300 hover:bg-teal-50/30 transition text-xs font-medium text-slate-800 flex items-center justify-between cursor-pointer"
              >
                <span>{sample.title}</span>
                <span className="text-teal-700 font-bold ml-2">Load</span>
              </button>
            ))}
          </div>
        </div>

        {/* Analysis Form */}
        <form onSubmit={handleAnalyze} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="transcript" className="text-sm font-bold text-slate-900">
                Call Conversation or Voicemail Notes
              </label>
              <span className="text-xs text-slate-500">
                {transcript.length} characters
              </span>
            </div>
            <textarea
              id="transcript"
              rows={5}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="What did the caller say? E.g., 'They claimed to be from Mumbai Cyber Police saying my Aadhaar is involved in money laundering and told me not to cut the call...'"
              className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d766e] focus:bg-white transition"
              required
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <PhoneOff className="w-4 h-4 text-slate-400" />
              <span>Never share OTPs, Aadhaar numbers, or bank passwords on a call</span>
            </div>

            <div className="flex items-center gap-3">
              {transcript && (
                <button
                  type="button"
                  onClick={() => {
                    setTranscript('');
                    setResult(null);
                    setApiError(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Clear
                </button>
              )}
              <button
                type="submit"
                disabled={isAnalyzing || !transcript.trim()}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0d766e] hover:bg-[#0f766e] text-white font-semibold text-xs shadow-sm transition cursor-pointer disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing Call Transcript...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Inspect Call Transcript</span>
                  </>
                )}
              </button>
            </div>
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
                  Risk Assessment Verdict
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                  {result.risk_level === 'High'
                    ? 'High-Risk Scam Call Detected'
                    : result.risk_level === 'Medium'
                    ? 'Suspicious Pressure Tactics Found'
                    : 'Low Risk Indicators'}
                </h3>
              </div>
              <div className="flex items-center gap-3">
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

            {/* Critical "Digital Arrest" Call Warning */}
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
              <h4 className="text-xs font-bold text-rose-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Golden Rules for Phone & Video Calls</span>
              </h4>
              <ul className="text-xs text-rose-800 space-y-1 list-disc list-inside">
                <li><strong>No "Digital Arrest" exists in law:</strong> No police department, CBI, ED, or judge ever conducts an arrest or interrogation over Skype, WhatsApp, or phone.</li>
                <li><strong>No government agency asks for funds transfer:</strong> "Transfer money to RBI/Court reserve account for verification" is ALWAYS a scam.</li>
                <li><strong>Hang up immediately:</strong> Legitimate law enforcement sends formal written summons or visits in person with proper jurisdiction.</li>
              </ul>
            </div>

            {/* Summary */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Summary of Findings
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed font-normal">
                {result.summary}
              </p>
            </div>

            {/* Warning Signs */}
            {result.warning_signs?.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Specific Pressure Tactics & Flags ({result.warning_signs.length})
                </h4>
                <div className="space-y-2">
                  {result.warning_signs.map((sign, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700"
                    >
                      <span className="w-5 h-5 rounded-full bg-teal-100 text-[#0d766e] flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{sign}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations?.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Recommended Immediate Steps
                </h4>
                <div className="space-y-2">
                  {result.recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 text-xs text-slate-700"
                    >
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
