import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Link2,
  QrCode,
  Image as ImageIcon,
  Mail,
  PhoneCall,
  Newspaper,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  Search,
} from 'lucide-react';

export default function QuickCheck() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const tools = [
    {
      id: 'message',
      title: 'Suspicious Message or SMS',
      desc: 'Verify text messages, WhatsApp alerts, prize claims, or lottery notices.',
      icon: MessageSquare,
      path: '/scan',
      tag: 'Most Popular',
      color: 'teal',
    },
    {
      id: 'link',
      title: 'Website or Link (URL)',
      desc: 'Check if a web address is safe, an impersonation clone, or phishing.',
      icon: Link2,
      path: '/url-checker',
      tag: 'Link Check',
      color: 'teal',
    },
    {
      id: 'qr',
      title: 'QR Code Safety Scan',
      desc: 'Decode payment or poster QR codes to uncover hidden URLs or UPI debit traps.',
      icon: QrCode,
      path: '/qr-checker',
      tag: 'UPI & Web',
      color: 'teal',
    },
    {
      id: 'screenshot',
      title: 'Screenshot of Chat or App',
      desc: 'Upload an image of a payment receipt, Telegram group, or conversation.',
      icon: ImageIcon,
      path: '/screenshot',
      tag: 'OCR Vision',
      color: 'teal',
    },
    {
      id: 'email',
      title: 'Email Sender & Headers',
      desc: 'Inspect display-name spoofing, fake banking domains, and SPF/DKIM verdicts.',
      icon: Mail,
      path: '/email-checker',
      tag: 'Phishing',
      color: 'teal',
    },
    {
      id: 'call',
      title: 'Call & Voicemail Transcript',
      desc: 'Review police "digital arrest", electricity cutoff, or customs impersonation calls.',
      icon: PhoneCall,
      path: '/call-checker',
      tag: 'Vishing',
      color: 'teal',
    },
    {
      id: 'news',
      title: 'Viral Claim or News Story',
      desc: 'Fact-check viral forwards, government announcements, or scheme claims.',
      icon: Newspaper,
      path: '/news-check',
      tag: 'Fact Check',
      color: 'teal',
    },
  ];

  // Quick smart detect based on user typing
  const handleSmartSearch = (e) => {
    e.preventDefault();
    const clean = query.trim();
    if (!clean) return;

    if (clean.startsWith('http://') || clean.startsWith('https://') || clean.includes('.com') || clean.includes('.in')) {
      navigate('/url-checker');
    } else if (clean.includes('@') && clean.includes('.')) {
      navigate('/email-checker');
    } else {
      navigate('/scan');
    }
  };

  const filteredTools = query.trim()
    ? tools.filter(
        (t) =>
          t.title.toLowerCase().includes(query.toLowerCase()) ||
          t.desc.toLowerCase().includes(query.toLowerCase()) ||
          t.tag.toLowerCase().includes(query.toLowerCase())
      )
    : tools;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs font-semibold text-[#0d766e]">
            <ShieldCheck className="w-4 h-4" />
            <span>Fast Safety Wizard</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Quick Safety Check
          </h1>
          <p className="text-slate-600 max-w-xl mx-auto text-sm sm:text-base">
            Select the kind of item you received, or type what you have to route directly to the best safety inspector.
          </p>
        </div>

        {/* Quick Input Box */}
        <form onSubmit={handleSmartSearch} className="max-w-2xl mx-auto">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tools or paste a link / text to route instantly..."
              className="w-full pl-12 pr-28 py-3.5 bg-white border border-slate-300 rounded-2xl shadow-sm text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d766e] focus:border-transparent transition"
            />
            <button
              type="submit"
              className="absolute right-2 px-4 py-2 bg-[#0d766e] hover:bg-[#0f766e] text-white text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Start Check
            </button>
          </div>
        </form>

        {/* Emergency Alert Banner */}
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 flex-shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-amber-900">
                Already sent money, shared an OTP, or installed an app?
              </h3>
              <p className="text-xs text-amber-800 leading-relaxed mt-0.5">
                Don't panic. Follow our emergency triage guide to block cards, revoke permissions, and reach the 1930 cybercrime helpline immediately.
              </p>
            </div>
          </div>
          <Link
            to="/incident-response"
            className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition"
          >
            <span>Emergency Action Guide</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.id}
                to={tool.path}
                className="group p-6 rounded-2xl bg-white border border-slate-200 hover:border-teal-400 hover:shadow-lg transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0d766e] group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                      {tool.tag}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0d766e] transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {tool.desc}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0d766e] group-hover:text-[#0f766e] transition-colors pt-2">
                  <span>Open scanner</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer Guidance */}
        <div className="text-center pt-6">
          <p className="text-xs text-slate-500">
            TrustShield AI provides educational risk analysis based on scam signatures and safety heuristics. Never enter account passwords or personal PINs.
          </p>
        </div>

      </div>
    </div>
  );
}
