import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Shield,
  Check,
  ChevronDown,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  FileText,
  ShieldAlert,
} from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [learnOpen, setLearnOpen] = useState(false);
  const { lang, toggleLanguage, t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;
  const closeAll = () => {
    setMobileMenuOpen(false);
    setToolsOpen(false);
    setLearnOpen(false);
  };

  return (
    <nav
      className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-100"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* ── Logo ──────────────────────────────────── */}
          <Link
            to="/"
            onClick={closeAll}
            className="flex items-center gap-2.5 group flex-shrink-0"
            aria-label="TrustShield AI — Home"
          >
            {/* Green/Teal Shield with White Checkmark */}
            <div className="w-9 h-9 rounded-xl bg-[#0d766e] flex items-center justify-center text-white shadow-sm group-hover:bg-[#0f766e] transition">
              <Check className="w-5 h-5 stroke-[2.5]" aria-hidden="true" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">
              TrustShield <span className="text-slate-900">AI</span>
            </span>
          </Link>

          {/* ── Desktop Center Links ─────────────────── */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-700">
            {/* Tools Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setToolsOpen((v) => !v);
                  setLearnOpen(false);
                }}
                onBlur={(e) => {
                  if (!e.currentTarget.parentElement.contains(e.relatedTarget)) {
                    setToolsOpen(false);
                  }
                }}
                className={`flex items-center gap-1 hover:text-[#0d766e] transition-colors py-2 cursor-pointer ${
                  ['/quick-check', '/scan', '/url-checker', '/qr-checker', '/email-checker', '/call-checker', '/screenshot', '/news-check'].includes(location.pathname)
                    ? 'text-[#0d766e] font-semibold'
                    : 'text-slate-700'
                }`}
                aria-expanded={toolsOpen}
              >
                Tools
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${toolsOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </button>

              {toolsOpen && (
                <div
                  className="absolute left-0 top-full mt-1 w-64 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50 text-xs font-normal"
                  role="menu"
                >
                  <Link
                    to="/quick-check"
                    onClick={() => setToolsOpen(false)}
                    className="flex flex-col px-4 py-2 hover:bg-slate-50 transition"
                  >
                    <span className="font-semibold text-[#0d766e] text-xs">Quick Safety Wizard</span>
                    <span className="text-slate-500 text-[11px]">Instant check router</span>
                  </Link>
                  <div className="h-[1px] bg-slate-100 my-1 mx-3" />
                  <Link
                    to="/scan"
                    onClick={() => setToolsOpen(false)}
                    className="flex flex-col px-4 py-2 hover:bg-slate-50 transition"
                  >
                    <span className="font-semibold text-slate-900 text-xs">Message Scanner</span>
                    <span className="text-slate-500 text-[11px]">Check texts, SMS & WhatsApp</span>
                  </Link>
                  <Link
                    to="/url-checker"
                    onClick={() => setToolsOpen(false)}
                    className="flex flex-col px-4 py-2 hover:bg-slate-50 transition"
                  >
                    <span className="font-semibold text-slate-900 text-xs">Website Link Checker</span>
                    <span className="text-slate-500 text-[11px]">Verify suspicious links & URLs</span>
                  </Link>
                  <Link
                    to="/qr-checker"
                    onClick={() => setToolsOpen(false)}
                    className="flex flex-col px-4 py-2 hover:bg-slate-50 transition"
                  >
                    <span className="font-semibold text-slate-900 text-xs">QR Code Safety Scan</span>
                    <span className="text-slate-500 text-[11px]">Detect UPI traps & hidden URLs</span>
                  </Link>
                  <Link
                    to="/email-checker"
                    onClick={() => setToolsOpen(false)}
                    className="flex flex-col px-4 py-2 hover:bg-slate-50 transition"
                  >
                    <span className="font-semibold text-slate-900 text-xs">Email Sender & Headers</span>
                    <span className="text-slate-500 text-[11px]">Verify SPF/DKIM & fake domains</span>
                  </Link>
                  <Link
                    to="/call-checker"
                    onClick={() => setToolsOpen(false)}
                    className="flex flex-col px-4 py-2 hover:bg-slate-50 transition"
                  >
                    <span className="font-semibold text-slate-900 text-xs">Scam Call & Voicemail</span>
                    <span className="text-slate-500 text-[11px]">Review digital arrest & threats</span>
                  </Link>
                  <Link
                    to="/screenshot"
                    onClick={() => setToolsOpen(false)}
                    className="flex flex-col px-4 py-2 hover:bg-slate-50 transition"
                  >
                    <span className="font-semibold text-slate-900 text-xs">Screenshot Analyzer</span>
                    <span className="text-slate-500 text-[11px]">OCR scan of payment or chat</span>
                  </Link>
                  <Link
                    to="/news-check"
                    onClick={() => setToolsOpen(false)}
                    className="flex flex-col px-4 py-2 hover:bg-slate-50 transition"
                  >
                    <span className="font-semibold text-slate-900 text-xs">News Claim Verifier</span>
                    <span className="text-slate-500 text-[11px]">Fact-check viral headlines</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Learn Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setLearnOpen((v) => !v);
                  setToolsOpen(false);
                }}
                onBlur={(e) => {
                  if (!e.currentTarget.parentElement.contains(e.relatedTarget)) {
                    setLearnOpen(false);
                  }
                }}
                className={`flex items-center gap-1 hover:text-[#0d766e] transition-colors py-2 cursor-pointer ${
                  ['/learning-center', '/practice', '/quiz', '/incident-response'].includes(location.pathname)
                    ? 'text-[#0d766e] font-semibold'
                    : 'text-slate-700'
                }`}
                aria-expanded={learnOpen}
              >
                Learn
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${learnOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </button>

              {learnOpen && (
                <div
                  className="absolute left-0 top-full mt-1 w-60 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50 text-xs font-normal"
                  role="menu"
                >
                  <Link
                    to="/learning-center"
                    onClick={() => setLearnOpen(false)}
                    className="flex flex-col px-4 py-2 hover:bg-slate-50 transition"
                  >
                    <span className="font-semibold text-slate-900 text-xs">Safe Learning Center</span>
                    <span className="text-slate-500 text-[11px]">Guides on urgency & APK traps</span>
                  </Link>
                  <Link
                    to="/practice"
                    onClick={() => setLearnOpen(false)}
                    className="flex flex-col px-4 py-2 hover:bg-slate-50 transition"
                  >
                    <span className="font-semibold text-slate-900 text-xs">Scam Practice Simulator</span>
                    <span className="text-slate-500 text-[11px]">Interactive "Real or Scam?" drill</span>
                  </Link>
                  <Link
                    to="/quiz"
                    onClick={() => setLearnOpen(false)}
                    className="flex flex-col px-4 py-2 hover:bg-slate-50 transition"
                  >
                    <span className="font-semibold text-slate-900 text-xs">Scam Awareness Quiz</span>
                    <span className="text-slate-500 text-[11px]">Earn safety badges</span>
                  </Link>
                  <div className="h-[1px] bg-slate-100 my-1 mx-3" />
                  <Link
                    to="/incident-response"
                    onClick={() => setLearnOpen(false)}
                    className="flex flex-col px-4 py-2 hover:bg-rose-50/60 transition"
                  >
                    <span className="font-semibold text-rose-700 text-xs">Emergency Incident Guide</span>
                    <span className="text-slate-500 text-[11px]">Actions if money or OTP sent</span>
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/alerts"
              className={`hover:text-[#0d766e] transition-colors ${
                isActive('/alerts') ? 'text-[#0d766e] font-semibold' : 'text-slate-700'
              }`}
            >
              Alerts
            </Link>
          </div>

          {/* ── Desktop Right Actions ────────────────── */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Pill (English / Hindi) */}
            <div className="flex items-center p-0.5 rounded-full bg-slate-100 border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => lang !== 'en' && toggleLanguage()}
                className={`px-3 py-1 rounded-full font-medium transition cursor-pointer ${
                  lang === 'en'
                    ? 'bg-[#0d766e] text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => lang !== 'hi' && toggleLanguage()}
                className={`px-3 py-1 rounded-full font-medium transition cursor-pointer ${
                  lang === 'hi'
                    ? 'bg-[#0d766e] text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Hindi
              </button>
            </div>

            {/* Subtle Divider */}
            <div className="h-6 w-[1px] bg-slate-200 mx-1" aria-hidden="true" />

            {/* Auth Actions */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {user?.is_admin && (
                  <Link
                    to="/admin/dashboard"
                    className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold hover:bg-rose-100 transition"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-[#0d766e]" />
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-xs font-semibold text-[#0d766e] hover:bg-teal-100 transition"
                >
                  {user?.full_name || 'Account'}
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-slate-50 transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-800 border border-slate-200 hover:bg-slate-50 transition"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="px-4.5 py-2 rounded-xl text-sm font-semibold text-white bg-[#0d766e] hover:bg-[#0f766e] shadow-xs transition"
                >
                  Get started
                </Link>
              </div>
            )}
          </div>

          {/* ── Mobile Hamburger ─────────────────────── */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={toggleLanguage}
              className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700"
            >
              {lang === 'en' ? 'हिन्दी' : 'EN'}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Drawer ───────────────────────────── */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Safety Scanners</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Link to="/quick-check" onClick={closeAll} className="p-2.5 rounded-xl bg-teal-50 font-semibold text-[#0d766e]">
              ⚡ Quick Check
            </Link>
            <Link to="/scan" onClick={closeAll} className="p-2.5 rounded-xl bg-slate-50 font-medium text-slate-800">
              Message Scanner
            </Link>
            <Link to="/url-checker" onClick={closeAll} className="p-2.5 rounded-xl bg-slate-50 font-medium text-slate-800">
              Website Link
            </Link>
            <Link to="/qr-checker" onClick={closeAll} className="p-2.5 rounded-xl bg-slate-50 font-medium text-slate-800">
              QR Code Scanner
            </Link>
            <Link to="/email-checker" onClick={closeAll} className="p-2.5 rounded-xl bg-slate-50 font-medium text-slate-800">
              Email & Headers
            </Link>
            <Link to="/call-checker" onClick={closeAll} className="p-2.5 rounded-xl bg-slate-50 font-medium text-slate-800">
              Scam Call Checker
            </Link>
            <Link to="/screenshot" onClick={closeAll} className="p-2.5 rounded-xl bg-slate-50 font-medium text-slate-800">
              Screenshot
            </Link>
            <Link to="/news-check" onClick={closeAll} className="p-2.5 rounded-xl bg-slate-50 font-medium text-slate-800">
              News Claim
            </Link>
          </div>

          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 pt-2">Learn & Emergency</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Link to="/learning-center" onClick={closeAll} className="p-2.5 rounded-xl bg-slate-50 font-medium text-slate-800">
              Learning Center
            </Link>
            <Link to="/practice" onClick={closeAll} className="p-2.5 rounded-xl bg-slate-50 font-medium text-slate-800">
              Practice Drill
            </Link>
            <Link to="/quiz" onClick={closeAll} className="p-2.5 rounded-xl bg-slate-50 font-medium text-slate-800">
              Awareness Quiz
            </Link>
            <Link to="/incident-response" onClick={closeAll} className="p-2.5 rounded-xl bg-rose-50 font-bold text-rose-700">
              Emergency 1930
            </Link>
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2 text-sm">
            <Link to="/alerts" onClick={closeAll} className="py-1.5 font-medium text-slate-700">
              Threat Alerts
            </Link>
            <Link to="/report-scam" onClick={closeAll} className="py-1.5 font-medium text-slate-700">
              Report Scam
            </Link>
          </div>

          <div className="pt-3 border-t border-slate-100">
            {isAuthenticated ? (
              <div className="space-y-2">
                <Link to="/dashboard" onClick={closeAll} className="block py-1.5 text-sm font-semibold text-[#0d766e]">
                  My Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => { logout(); closeAll(); }}
                  className="block text-sm text-rose-600 font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={closeAll}
                  className="flex-1 text-center py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  onClick={closeAll}
                  className="flex-1 text-center py-2.5 rounded-xl bg-[#0d766e] text-sm font-semibold text-white"
                >
                  Get started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
