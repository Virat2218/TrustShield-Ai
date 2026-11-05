import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  Check,
  HelpCircle,
} from 'lucide-react';

export default function ScamPractice() {
  const scenarios = [
    {
      id: 1,
      type: 'SMS Message',
      sender: 'VK-SBIINB',
      content:
        'Dear Customer, your SBI account has been blocked due to pending PAN card verification. Update your PAN immediately at https://sbi-pan-update.online/verify to continue banking services.',
      isScam: true,
      explanation:
        'Scam: The link leads to "sbi-pan-update.online", not the authentic official bank domain "onlinesbi.sbi". State Bank of India never sends links asking customers to update PAN or Aadhaar via SMS.',
      markers: ['Urgent block threat', 'Unofficial .online domain', 'Unsolicited PAN update request'],
    },
    {
      id: 2,
      type: 'Email Notification',
      sender: 'no-reply@accounts.google.com',
      content:
        'Security alert: A new sign-in was detected on Windows from Bangalore, India. If this was you, you don\'t need to do anything. If this wasn\'t you, check your activity at https://myaccount.google.com/notifications.',
      isScam: false,
      explanation:
        'Legitimate: The link points directly to the genuine google.com domain. The notification does not panic you or ask you to reply with your password or verification code.',
      markers: ['Official google.com domain', 'Informational only', 'No pressure to reply with secrets'],
    },
    {
      id: 3,
      type: 'WhatsApp Message',
      sender: '+62 838-1234-5678',
      content:
        'Hi! I am HR from Global Media Works. We offer part-time jobs liking YouTube videos. Earn ₹150 for each like, up to ₹4,500/day. No experience required. Reply YES to start now.',
      isScam: true,
      explanation:
        'Scam: Classic task scam from an overseas international number (+62 Indonesia). They pay small amounts first to earn trust, then direct you to Telegram to invest thousands into fake crypto schemes.',
      markers: ['Overseas international phone number', 'Unrealistic pay for trivial task', 'Precursor to Telegram investment fraud'],
    },
    {
      id: 4,
      type: 'Electricity Disconnection Notice',
      sender: '+91 98200 99999 (Personal Mobile)',
      content:
        'Dear consumer, your electricity power supply will be disconnected at 9:30 PM tonight because your previous month bill was not updated. Contact power officer immediately at 98200 99999.',
      isScam: true,
      explanation:
        'Scam: Power distribution companies never send disconnection threats from personal 10-digit mobile numbers with immediate same-night cutoffs. Authentic bills arrive via official postal or registered SMS sender IDs.',
      markers: ['Personal 10-digit mobile sender', 'Urgent same-day cutoff threat', 'Directs to call personal number'],
    },
    {
      id: 5,
      type: 'E-Commerce Delivery SMS',
      sender: 'AM-AMAZON',
      content:
        'Your Amazon order #402-1234567-8901234 is out for delivery with agent Ramesh (Phone: 9811122233). Share delivery OTP 4821 with driver ONLY when package is handed to you.',
      isScam: false,
      explanation:
        'Legitimate: Standard delivery OTP notification. Crucially, it instructs you to share OTP *only* when the physical package is handed over, and does not ask you to click any external link.',
      markers: ['Valid order ID format', 'Instructs NOT to share OTP over the phone', 'Legitimate sender ID'],
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null); // true = scam, false = real
  const [score, setScore] = useState(0);
  const [drillCompleted, setDrillCompleted] = useState(false);

  const currentScenario = scenarios[currentIndex];

  const handleAnswer = (userGuessScam) => {
    if (selectedAnswer !== null) return; // already answered this card
    setSelectedAnswer(userGuessScam);
    if (userGuessScam === currentScenario.isScam) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < scenarios.length) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
    } else {
      setDrillCompleted(true);
    }
  };

  const restartDrill = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setDrillCompleted(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs font-semibold text-[#0d766e]">
            <Sparkles className="w-4 h-4" />
            <span>Interactive Simulator</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Scam or Real? Practice Drill
          </h1>
          <p className="text-slate-600 max-w-lg mx-auto text-sm sm:text-base">
            Train your scam detection reflexes on real-world examples without any danger to your accounts.
          </p>
        </div>

        {/* Progress Tracker */}
        {!drillCompleted && (
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
            <span>
              Scenario {currentIndex + 1} of {scenarios.length}
            </span>
            <span>Score: {score}</span>
          </div>
        )}

        {/* Simulator Card */}
        {!drillCompleted ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
            
            {/* Meta row */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                {currentScenario.type}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                From: <strong className="text-slate-800">{currentScenario.sender}</strong>
              </span>
            </div>

            {/* Message Display Bubble */}
            <div className="p-5 rounded-2xl bg-slate-100/80 border border-slate-200/80 text-sm sm:text-base text-slate-900 leading-relaxed font-normal">
              {currentScenario.content}
            </div>

            {/* Decision Buttons (Before answering) */}
            {selectedAnswer === null ? (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => handleAnswer(false)}
                  className="py-4 px-6 rounded-2xl bg-white border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-slate-900 hover:text-emerald-900 font-bold text-sm transition cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
                >
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span>Real / Legitimate</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAnswer(true)}
                  className="py-4 px-6 rounded-2xl bg-white border-2 border-slate-200 hover:border-rose-500 hover:bg-rose-50/40 text-slate-900 hover:text-rose-900 font-bold text-sm transition cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
                >
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  <span>Scam / Phishing</span>
                </button>
              </div>
            ) : (
              /* Feedback Box (After answering) */
              <div className="space-y-5 pt-2">
                
                {/* Result banner */}
                <div
                  className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
                    selectedAnswer === currentScenario.isScam
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                      : 'bg-rose-50 border-rose-200 text-rose-950'
                  }`}
                >
                  {selectedAnswer === currentScenario.isScam ? (
                    <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-sm">
                      {selectedAnswer === currentScenario.isScam ? 'Correct Spot!' : 'Not quite!'}
                    </h3>
                    <p className="text-xs leading-relaxed font-normal">
                      This scenario is{' '}
                      <strong>{currentScenario.isScam ? 'a SCAM' : 'LEGITIMATE'}</strong>.
                    </p>
                  </div>
                </div>

                {/* Explanation */}
                <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Why?
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                    {currentScenario.explanation}
                  </p>
                  <div className="pt-2 flex flex-wrap gap-2">
                    {currentScenario.markers.map((m, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold text-slate-700"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Next button */}
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0d766e] hover:bg-[#0f766e] text-white font-semibold text-xs shadow-sm transition cursor-pointer"
                  >
                    <span>
                      {currentIndex + 1 < scenarios.length ? 'Next Scenario' : 'View Final Score'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            )}

          </div>
        ) : (
          /* Final Score Summary Screen */
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 text-center space-y-6 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-teal-50 text-[#0d766e] flex items-center justify-center mx-auto">
              <ShieldCheck className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-900">
                Drill Completed!
              </h2>
              <p className="text-slate-600 text-sm">
                You correctly identified {score} out of {scenarios.length} scenarios.
              </p>
            </div>

            <div className="inline-block p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-3xl font-extrabold text-[#0d766e]">
                {Math.round((score / scenarios.length) * 100)}%
              </span>
              <p className="text-xs text-slate-500 mt-1 font-medium">Accuracy Rating</p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={restartDrill}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>
              <Link
                to="/quiz"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0d766e] text-white text-xs font-semibold hover:bg-[#0f766e] transition shadow-xs"
              >
                <span>Take Full Quiz</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
