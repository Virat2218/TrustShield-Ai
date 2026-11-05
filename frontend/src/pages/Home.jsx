import { Link } from 'react-router-dom';
import {
  MessageSquare,
  Link2,
  Image as ImageIcon,
  Newspaper,
  ArrowRight,
  PlayCircle,
  AlertTriangle,
  ShieldCheck,
  ChevronRight,
  Check,
} from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="relative overflow-hidden bg-white pb-20">
      {/* ── Soft organic background shape washes ────────────────── */}
      <div
        className="absolute top-0 right-0 w-[550px] h-[550px] pointer-events-none -z-10 opacity-70"
        style={{
          background: 'radial-gradient(ellipse at 80% 20%, rgba(204, 251, 241, 0.6) 0%, rgba(207, 250, 254, 0.3) 50%, transparent 70%)',
        }}
        aria-hidden="true"
      />
      <div
        className="absolute top-[250px] left-0 w-[450px] h-[450px] pointer-events-none -z-10 opacity-50"
        style={{
          background: 'radial-gradient(circle at 10% 40%, rgba(204, 251, 241, 0.45) 0%, transparent 60%)',
        }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 md:pt-16 space-y-20">

        {/* ─── Hero Section (2 Columns) ─────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center" aria-labelledby="hero-title">

          {/* Left Column */}
          <div className="lg:col-span-6 space-y-6">
            <h1
              id="hero-title"
              className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold text-slate-900 tracking-tight leading-[1.12]"
            >
              Check before you{' '}
              <span className="relative inline-block whitespace-nowrap">
                click.
                {/* Hand-drawn curved teal underline stroke beneath "click." */}
                <svg
                  className="absolute -bottom-2 left-0 w-full h-3 text-[#14b8a6]"
                  viewBox="0 0 100 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 8C25 2 75 2 98 9"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-lg font-normal">
              Understand suspicious messages, links, screenshots, and claims in seconds.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/scan"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm text-white bg-[#0d766e] hover:bg-[#0f766e] shadow-sm hover:shadow-md transition cursor-pointer"
              >
                <span>Start a free scan</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>

              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
              >
                <PlayCircle className="w-4 h-4 text-slate-700" aria-hidden="true" />
                <span>How it works</span>
              </a>
            </div>
          </div>

          {/* Right Column: Hero Graphic Card (Pixel-match to design) */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[460px]">

              {/* Floating Shield Badge top right */}
              <div className="absolute -top-4 -right-2 z-20 flex flex-col items-center">
                {/* Subtle rays/motion lines above shield */}
                <div className="flex gap-1.5 mb-1 opacity-70" aria-hidden="true">
                  <span className="w-1 h-2 bg-[#0d766e] rounded-full transform -rotate-25"></span>
                  <span className="w-1 h-3 bg-[#0d766e] rounded-full"></span>
                  <span className="w-1 h-2 bg-[#0d766e] rounded-full transform rotate-25"></span>
                </div>
                {/* 3D Shield */}
                <div className="w-14 h-16 rounded-2xl bg-gradient-to-b from-[#2dd4bf] to-[#0d766e] p-0.5 shadow-lg shadow-teal-900/15 flex items-center justify-center">
                  <div className="w-full h-full rounded-[14px] bg-gradient-to-br from-[#14b8a6] to-[#0f766e] flex items-center justify-center text-white">
                    <Check className="w-7 h-7 stroke-[3]" />
                  </div>
                </div>
              </div>

              {/* Main Card Container */}
              <div className="relative rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-xl shadow-slate-200/60 space-y-4">

                {/* Card Header: Speech bubble icon + "Message analysis" */}
                <div className="flex items-center gap-2 text-slate-900">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0d766e]">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm tracking-tight">Message analysis</h3>
                </div>

                {/* Suspicious Message Snippet */}
                <div className="p-3.5 rounded-xl bg-slate-100/80 text-xs sm:text-[13px] text-slate-700 leading-relaxed font-normal">
                  Your bank account will be blocked today. Verify now:{' '}
                  <span className="text-blue-600 underline font-medium">bit.ly/bank-verify</span>
                </div>

                {/* Alert Box */}
                <div className="rounded-xl bg-[#fffbeb] border border-amber-200 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-xs sm:text-sm">
                      <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <span>Suspicious message detected</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#fef08a] text-amber-900 shadow-2xs">
                      Use caution
                    </span>
                  </div>

                  <div className="space-y-2 pt-1">
                    <p className="text-xs font-bold text-slate-900">Why?</p>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      <li className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-[#0d766e] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          1
                        </span>
                        <span>Uses an urgent threat to create pressure.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-[#0d766e] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          2
                        </span>
                        <span>Contains a shortened link (bit.ly) that hides the real website.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-[#0d766e] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          3
                        </span>
                        <span>Asks you to verify sensitive account details.</span>
                      </li>
                    </ul>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* ─── "What would you like to check?" (4 Cards Grid) ────── */}
        <section className="space-y-8 pt-6" aria-labelledby="check-options-title">
          <div className="text-center">
            <h2
              id="check-options-title"
              className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight"
            >
              What would you like to check?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

            {/* Card 1: Message */}
            <Link
              to="/scan"
              className="group p-6 rounded-2xl bg-white border border-slate-200 hover:border-teal-400 hover:shadow-lg transition-all flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#f0fdfa] border border-teal-100 flex items-center justify-center text-[#0d766e] group-hover:scale-105 transition-transform">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Message</h3>
                <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed">
                  Check texts, emails, or app messages for possible scams, phishing or fraud.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#0d766e] group-hover:text-[#0f766e] transition-colors">
                <span>Check now</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            {/* Card 2: Website link */}
            <Link
              to="/url-checker"
              className="group p-6 rounded-2xl bg-white border border-slate-200 hover:border-teal-400 hover:shadow-lg transition-all flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#f0fdfa] border border-teal-100 flex items-center justify-center text-[#0d766e] group-hover:scale-105 transition-transform">
                  <Link2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Website link</h3>
                <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed">
                  Analyze a link to see if it's safe, fake, or potentially harmful.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#0d766e] group-hover:text-[#0f766e] transition-colors">
                <span>Check now</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            {/* Card 3: Screenshot */}
            <Link
              to="/screenshot"
              className="group p-6 rounded-2xl bg-white border border-slate-200 hover:border-teal-400 hover:shadow-lg transition-all flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#f0fdfa] border border-teal-100 flex items-center justify-center text-[#0d766e] group-hover:scale-105 transition-transform">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Screenshot</h3>
                <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed">
                  Upload a screenshot (e.g., a message, post, or offer) to check if it's trustworthy.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#0d766e] group-hover:text-[#0f766e] transition-colors">
                <span>Check now</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            {/* Card 4: News claim */}
            <Link
              to="/news-check"
              className="group p-6 rounded-2xl bg-white border border-slate-200 hover:border-teal-400 hover:shadow-lg transition-all flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#f0fdfa] border border-teal-100 flex items-center justify-center text-[#0d766e] group-hover:scale-105 transition-transform">
                  <Newspaper className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">News claim</h3>
                <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed">
                  Check if a news story, viral message, or popular claim is likely true or false.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#0d766e] group-hover:text-[#0f766e] transition-colors">
                <span>Check now</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

          </div>
        </section>

        {/* ─── "Simple steps to stay safer" Strip (Horizontal sequence) ── */}
        <section id="how-it-works" className="pt-4">
          <div className="rounded-2xl bg-[#f0fdfa] border border-teal-100 p-6 sm:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-2xs">

            {/* Title on left */}
            <div className="lg:max-w-[180px] flex-shrink-0">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">
                Simple steps to stay safer
              </h2>
            </div>

            {/* Steps Sequence with chevrons */}
            <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 lg:gap-4">

              {/* Step 1 */}
              <div className="flex items-start gap-3.5 flex-1">
                <span className="w-7 h-7 rounded-full bg-[#0d766e] text-white font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  1
                </span>
                <div className="space-y-0.5">
                  <h3 className="font-bold text-sm text-slate-900">Paste</h3>
                  <p className="text-xs text-slate-600 leading-snug">
                    Add a message, link, screenshot or claim.
                  </p>
                </div>
              </div>

              <ChevronRight className="hidden sm:block w-5 h-5 text-slate-400 flex-shrink-0" aria-hidden="true" />

              {/* Step 2 */}
              <div className="flex items-start gap-3.5 flex-1">
                <span className="w-7 h-7 rounded-full bg-[#0d766e] text-white font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  2
                </span>
                <div className="space-y-0.5">
                  <h3 className="font-bold text-sm text-slate-900">Review</h3>
                  <p className="text-xs text-slate-600 leading-snug">
                    Get a clear, easy-to-understand safety analysis in seconds.
                  </p>
                </div>
              </div>

              <ChevronRight className="hidden sm:block w-5 h-5 text-slate-400 flex-shrink-0" aria-hidden="true" />

              {/* Step 3 */}
              <div className="flex items-start gap-3.5 flex-1">
                <span className="w-7 h-7 rounded-full bg-[#0d766e] text-white font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  3
                </span>
                <div className="space-y-0.5">
                  <h3 className="font-bold text-sm text-slate-900">Decide</h3>
                  <p className="text-xs text-slate-600 leading-snug">
                    Use the result to choose your next step with confidence.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ─── Bottom Guidance Note ────────────────────────────── */}
        <div className="text-center pt-2 pb-6">
          <p className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-normal">
            <ShieldCheck className="w-4 h-4 text-slate-400" aria-hidden="true" />
            <span>Your scan results are guidance. Verify important decisions with official sources.</span>
          </p>
        </div>

      </div>
    </div>
  );
}
