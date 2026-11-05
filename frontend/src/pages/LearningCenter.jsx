import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export default function LearningCenter() {
  const [selectedTopic, setSelectedTopic] = useState('urgency');

  const topics = [
    {
      id: 'urgency',
      title: 'Artificial Urgency & Fear',
      tag: 'Core Scam Tactic',
      icon: AlertTriangle,
      hook: 'Why scammers rush you: fear bypasses critical thinking.',
      explanation:
        'Scammers consistently manufacture time pressure: "Account blocked in 2 hours", "Power cut at 9:30 PM", or "Police raid in 30 minutes". They do this because panic prevents you from consulting family, checking official websites, or calling your bank.',
      redFlags: [
        'Demands immediate action within hours or minutes',
        'Threatens dire consequences (arrest, court warrant, utility cutoff)',
        'Insists you stay on the call and not talk to anyone else',
      ],
      defenseTip:
        'When pressure spikes, pause. Legitimate organizations give formal written notice and reasonable time to resolve discrepancies.',
    },
    {
      id: 'upi',
      title: 'UPI "Scan to Receive" Fraud',
      tag: 'Payment Traps',
      icon: Lock,
      hook: 'The golden rule of UPI: You never enter a PIN to receive money.',
      explanation:
        'A scammer poses as a buyer on OLX or Facebook Marketplace. They send a QR code or payment request saying: "Scan this in PhonePe / Google Pay to receive ₹5,000". The moment you scan and enter your UPI PIN, money leaves your account.',
      redFlags: [
        'Caller sends a QR code claiming it is for "crediting" or "refunding" you',
        'Any prompt asking for your 4 or 6-digit secret UPI PIN to receive money',
        'Payment requests marked "Refund Approval" or "Cashback Voucher"',
      ],
      defenseTip:
        'To receive money on UPI, the sender only needs your mobile number or VPA. Never scan a code or enter a PIN to get paid.',
    },
    {
      id: 'digital-arrest',
      title: 'Fake Police & "Digital Arrest"',
      tag: 'Impersonation',
      icon: ShieldCheck,
      hook: 'There is no such thing as "Digital Arrest" under Indian law.',
      explanation:
        'Impostors dressed in police or judicial uniforms make Skype or WhatsApp video calls claiming illegal contraband or drugs were seized with your Aadhaar. They demand fund transfers to a "safe government verification account".',
      redFlags: [
        'Police or CBI officers conducting interrogations over Skype/WhatsApp video',
        'Demands to transfer money to "reserve funds" to prove innocence',
        'Showing fake arrest warrants with Supreme Court or CBI seals',
      ],
      defenseTip:
        'Police never make video calls to conduct trials or demand online money transfers. Hang up and report immediately to 1930.',
    },
    {
      id: 'apk',
      title: 'Fake APKs & Remote Tools',
      tag: 'Device Security',
      icon: BookOpen,
      hook: 'Why you should never install apps sent via WhatsApp links.',
      explanation:
        'Criminals send direct download links or APK files disguised as "E-Challan payment", "SBI Yono update", or "Gas bill payment". Once installed, the APK requests accessibility and SMS permissions to intercept OTPs silently.',
      redFlags: [
        'Files ending in .apk sent through WhatsApp, Telegram, or SMS',
        'Websites that prompt you to turn on "Install unknown apps" in Settings',
        'Callers asking you to install AnyDesk, TeamViewer, or RustDesk to "assist" you',
      ],
      defenseTip:
        'Only install apps directly from Google Play Store or Apple App Store. Never allow "Install unknown apps" for browser or messaging apps.',
    },
    {
      id: 'part-time',
      title: 'YouTube Likes & Task Scams',
      tag: 'Financial Fraud',
      icon: Lightbulb,
      hook: 'Work-from-home tasks that pay small amounts first to steal large amounts later.',
      explanation:
        'You receive a message offering ₹150 per YouTube video liked or Google review posted. They actually pay you ₹300-₹500 initially to gain trust. Then, you are added to a Telegram group and asked to invest ₹5,000 to unlock "VIP commissions", culminating in total loss.',
      redFlags: [
        'Unsolicited WhatsApp job offers from international numbers (+62, +234, etc.)',
        'Earning high daily income simply by liking videos or rating hotels',
        'Requirement to deposit your own money to withdraw "earned" balances',
      ],
      defenseTip:
        'Legitimate jobs never require you to pay upfront fees or deposit funds to withdraw salary.',
    },
  ];

  const currentTopic = topics.find((t) => t.id === selectedTopic) || topics[0];

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs font-semibold text-[#0d766e]">
            <GraduationCap className="w-4 h-4" />
            <span>Fraud Prevention Academy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Safe Learning Center
          </h1>
          <p className="text-slate-600 max-w-xl mx-auto text-sm sm:text-base">
            Master the psychological tricks and technical traps scammers use, explained in plain language for everyday users.
          </p>
        </div>

        {/* Quick CTA Banners */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/practice"
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-teal-400 hover:shadow-md transition flex items-center justify-between group"
          >
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#0d766e] uppercase tracking-wider">
                Hands-on Simulator
              </span>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0d766e] transition-colors">
                Interactive Scam Practice
              </h3>
              <p className="text-xs text-slate-500">
                Test your instincts on realistic scenarios with zero risk.
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-[#0d766e] group-hover:translate-x-1 transition" />
          </Link>

          <Link
            to="/quiz"
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-teal-400 hover:shadow-md transition flex items-center justify-between group"
          >
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#0d766e] uppercase tracking-wider">
                Knowledge Check
              </span>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0d766e] transition-colors">
                Scam Awareness Quiz
              </h3>
              <p className="text-xs text-slate-500">
                Earn badges and track your digital security awareness.
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-[#0d766e] group-hover:translate-x-1 transition" />
          </Link>
        </div>

        {/* Main Learning Hub Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Topic Menu (Left 4 cols) */}
          <div className="lg:col-span-4 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
              Key Scam Patterns
            </span>
            {topics.map((t) => {
              const Icon = t.icon;
              const isSelected = t.id === selectedTopic;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTopic(t.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition flex items-start gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-white border-[#0d766e] ring-2 ring-[#0d766e]/20 shadow-sm'
                      : 'bg-white/70 border-slate-200 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      isSelected ? 'bg-teal-50 text-[#0d766e]' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {t.tag}
                    </span>
                    <h4
                      className={`text-xs font-bold leading-snug ${
                        isSelected ? 'text-[#0d766e]' : 'text-slate-800'
                      }`}
                    >
                      {t.title}
                    </h4>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Topic Detail Card (Right 8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
            
            <div className="space-y-1 pb-4 border-b border-slate-100">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-[#0d766e] border border-teal-100">
                {currentTopic.tag}
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 pt-1">
                {currentTopic.title}
              </h2>
              <p className="text-sm font-semibold text-slate-700">
                {currentTopic.hook}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                How It Works
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                {currentTopic.explanation}
              </p>
            </div>

            {/* Red Flags Box */}
            <div className="space-y-2.5 p-4 rounded-2xl bg-rose-50/70 border border-rose-100">
              <h4 className="text-xs font-bold text-rose-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Tell-Tale Red Flags</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-rose-900">
                {currentTopic.redFlags.map((flag, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Defense Tip Box */}
            <div className="space-y-2 p-4 rounded-2xl bg-[#f0fdfa] border border-teal-100">
              <h4 className="text-xs font-bold text-[#0d766e] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0d766e]" />
                <span>Actionable Defense Rule</span>
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed font-normal">
                {currentTopic.defenseTip}
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
