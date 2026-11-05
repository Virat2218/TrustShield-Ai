import { useState } from 'react';
import {
  ShieldAlert,
  PhoneCall,
  Clock,
  ExternalLink,
  CreditCard,
  KeyRound,
  Download,
  Link2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export default function IncidentResponse() {
  const [activeTab, setActiveTab] = useState('money');
  const [completedSteps, setCompletedSteps] = useState({});
  const [copiedHelpline, setCopiedHelpline] = useState(false);

  const toggleStep = (stepId) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepId]: !prev[stepId],
    }));
  };

  const copyNumber = (num) => {
    navigator.clipboard.writeText(num);
    setCopiedHelpline(true);
    setTimeout(() => setCopiedHelpline(false), 2000);
  };

  const scenarios = [
    {
      id: 'money',
      title: 'Transferred Money / Paid Scammer',
      icon: CreditCard,
      badge: 'Time-Critical: First 2 Hours',
      badgeColor: 'rose',
      summary:
        'The first 2 hours after a fraudulent transaction are the "Golden Hour". Immediate reporting can freeze funds in transit before the scammer withdraws them.',
      steps: [
        {
          id: 'm1',
          title: 'Dial 1930 Immediately (National Cyber Crime Helpline)',
          desc: 'Call 1930 right away. Keep transaction reference numbers (UTR, UPI reference ID, or bank SMS details) ready. The operator initiates an immediate freeze request with the beneficiary bank.',
        },
        {
          id: 'm2',
          title: 'Call Your Bank to Block Accounts and Cards',
          desc: 'Contact your bank branch or 24x7 toll-free helpline. Request them to flag the transaction as unauthorized fraud and temporarily freeze outbound debit.',
        },
        {
          id: 'm3',
          title: 'File an Official Complaint on cybercrime.gov.in',
          desc: 'Register the incident under "Financial Fraud" on the official National Cyber Crime Reporting Portal. Save the acknowledgement slip (NCFR number) for police follow-up.',
        },
        {
          id: 'm4',
          title: 'Save All Evidence Before It Is Deleted',
          desc: 'Take complete screenshots of WhatsApp / Telegram chats, scammer phone numbers, transaction SMS receipts, and payment app history. Do NOT delete the chat.',
        },
      ],
    },
    {
      id: 'otp',
      title: 'Shared OTP or Bank Credentials',
      icon: KeyRound,
      badge: 'Immediate Action Needed',
      badgeColor: 'amber',
      summary:
        'If you inadvertently gave an SMS OTP, CVV, or net banking password to a caller, act immediately before funds are moved.',
      steps: [
        {
          id: 'o1',
          title: 'Lock Net Banking & Cards from Mobile App',
          desc: 'Log in to your authentic bank mobile app immediately. Use the "Card Controls" setting to disable online transactions, international usage, and ATM withdrawals.',
        },
        {
          id: 'o2',
          title: 'Change Net Banking & Email Passwords',
          desc: 'Change your net banking login and transaction passwords immediately from a secure separate device. Also reset your primary email password.',
        },
        {
          id: 'o3',
          title: 'Notify Your Bank Fraud Department',
          desc: 'Call the official bank fraud cell to report credential compromise and request temporary net banking suspension.',
        },
        {
          id: 'o4',
          title: 'Enable Multi-Factor Authentication (MFA)',
          desc: 'Ensure your email and financial accounts have authenticator app (TOTP) based verification turned on instead of plain SMS where possible.',
        },
      ],
    },
    {
      id: 'apk',
      title: 'Installed Unknown App / APK',
      icon: Download,
      badge: 'Device Security Risk',
      badgeColor: 'rose',
      summary:
        'Scammers trick victims into installing APKs via WhatsApp or links (e.g., fake "SBI Yono", "AnyDesk", "TeamViewer", or "E-Challan APK") to read SMS OTPs and control the screen.',
      steps: [
        {
          id: 'a1',
          title: 'Turn on Airplane Mode Immediately',
          desc: 'Switch your phone to Airplane Mode (disable Wi-Fi and Mobile Data) right away. This cuts off the scammer’s remote connection and prevents them from reading your SMS OTPs.',
        },
        {
          id: 'a2',
          title: 'Revoke Device Administrator & Accessibility Permissions',
          desc: 'Go to Settings > Apps > Special App Access > Device Admin Apps. Look for the newly installed app and deactivate its permissions so it cannot block uninstallation.',
        },
        {
          id: 'a3',
          title: 'Uninstall the Malicious App',
          desc: 'Locate the app in Settings > Apps and uninstall it. If the app is invisible or prevents uninstallation, reboot your phone into Safe Mode and uninstall from there.',
        },
        {
          id: 'a4',
          title: 'Perform a Factory Reset if Compromised',
          desc: 'If unauthorized transactions occurred or a remote access tool was granted full root access, back up only your photos/contacts and factory reset the phone.',
        },
      ],
    },
    {
      id: 'link',
      title: 'Clicked Suspicious Link / Phishing',
      icon: Link2,
      badge: 'Account Protection',
      badgeColor: 'teal',
      summary:
        'If you tapped an unknown link and saw a fake login page, verify what was submitted.',
      steps: [
        {
          id: 'l1',
          title: 'Did You Enter Any Passwords or PINs?',
          desc: 'If you entered your password on the page, navigate directly to the official authentic website (by typing its URL yourself) and change your password immediately.',
        },
        {
          id: 'l2',
          title: 'Did Any File Automatically Download?',
          desc: 'Check your browser downloads folder. If an .apk, .exe, or .zip file was downloaded, delete it immediately without opening or installing it.',
        },
        {
          id: 'l3',
          title: 'Clear Browser Cookies and Cache',
          desc: 'Clear your browser storage to terminate any rogue session tokens or deceptive popups.',
        },
      ],
    },
  ];

  const currentScenario = scenarios.find((s) => s.id === activeTab) || scenarios[0];

  const bankHelplines = [
    { name: 'State Bank of India (SBI)', num: '1800 1234 / 1800 2100' },
    { name: 'HDFC Bank Fraud Helpline', num: '1800 1600 / 1800 266 4060' },
    { name: 'ICICI Bank Fraud Reporting', num: '1800 266 7777' },
    { name: 'Axis Bank Emergency Helpline', num: '1800 103 5577' },
    { name: 'Punjab National Bank (PNB)', num: '1800 180 2222' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
            <ShieldAlert className="w-4 h-4" />
            <span>Emergency Triage Assistance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            "What Should I Do Now?" Incident Guide
          </h1>
          <p className="text-slate-600 max-w-xl mx-auto text-sm sm:text-base">
            Clear, step-by-step containment instructions for when you've sent money, shared an OTP, or installed a suspicious app.
          </p>
        </div>

        {/* Golden Emergency Helpline Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-rose-900 via-rose-800 to-slate-900 text-white p-6 sm:p-7 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                National Cyber Crime Helpline (India)
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Dial 1930 for Financial Fraud
              </h2>
              <p className="text-xs text-rose-100 max-w-md">
                Government 24x7 helpline to report online cyber fraud and initiate emergency fund freezing with banks.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="tel:1930"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-rose-900 font-bold text-sm hover:bg-rose-50 transition shadow-sm"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call 1930</span>
              </a>
              <a
                href="https://cybercrime.gov.in"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl bg-rose-800/80 hover:bg-rose-700/80 text-white font-semibold text-xs border border-rose-600 transition"
              >
                <span>cybercrime.gov.in</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Scenario Switcher Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {scenarios.map((sc) => {
            const Icon = sc.icon;
            const isSelected = sc.id === activeTab;
            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => setActiveTab(sc.id)}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between space-y-2 cursor-pointer ${
                  isSelected
                    ? 'bg-white border-[#0d766e] ring-2 ring-[#0d766e]/20 shadow-sm'
                    : 'bg-white/60 border-slate-200 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-teal-50 text-[#0d766e]' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h3
                    className={`text-xs font-bold ${
                      isSelected ? 'text-[#0d766e]' : 'text-slate-800'
                    }`}
                  >
                    {sc.title}
                  </h3>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Scenario Checklist */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Action Protocol
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
                {currentScenario.title}
              </h2>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                currentScenario.badgeColor === 'rose'
                  ? 'bg-rose-100 text-rose-800'
                  : currentScenario.badgeColor === 'amber'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-teal-100 text-teal-800'
              }`}
            >
              {currentScenario.badge}
            </span>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            {currentScenario.summary}
          </p>

          {/* Interactive Steps Checklist */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Step-by-Step Recovery Checklist
            </h3>
            {currentScenario.steps.map((st, i) => {
              const isDone = !!completedSteps[st.id];
              return (
                <div
                  key={st.id}
                  onClick={() => toggleStep(st.id)}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex items-start gap-3.5 ${
                    isDone
                      ? 'bg-emerald-50/60 border-emerald-200'
                      : 'bg-slate-50/80 border-slate-200 hover:border-teal-300'
                  }`}
                >
                  <button
                    type="button"
                    className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition ${
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : 'border-2 border-slate-300 bg-white text-transparent hover:border-teal-500'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                  <div className="space-y-1 flex-1">
                    <h4
                      className={`text-sm font-bold ${
                        isDone ? 'line-through text-slate-500' : 'text-slate-900'
                      }`}
                    >
                      Step {i + 1}: {st.title}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {st.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Major Bank Helplines Reference */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#0d766e]" />
              <span>Direct Bank Fraud Reporting Numbers</span>
            </h3>
            <span className="text-[11px] text-slate-500">Call to freeze cards immediately</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {bankHelplines.map((b, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between space-y-1"
              >
                <span className="text-xs font-bold text-slate-800">{b.name}</span>
                <span className="font-mono text-xs font-semibold text-[#0d766e]">
                  {b.num}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
