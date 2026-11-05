import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Shield,
  Menu,
  X,
  Globe,
  User,
  LogOut,
  LayoutDashboard,
  FileText,
  ShieldAlert,
  ChevronDown,
} from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';

/** Primary scanning tools shown directly in the nav */
const SCAN_TOOLS = [
  { key: 'scamDetector', href: '/scan', label: null },
  { key: 'urlChecker', href: '/url-checker', label: null },
  { key: 'screenshotAnalyzer', href: '/screenshot', label: null },
  { key: 'newsVerification', href: '/news-check', label: null },
];

/** Secondary / community tools shown in a "More" dropdown */
const MORE_TOOLS = [
  { key: 'quiz', href: '/quiz' },
  { key: 'alerts', href: '/alerts' },
  { key: 'reportScam', href: '/report-scam' },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const { lang, toggleLanguage, t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;
  const closeAll = () => {
    setMobileMenuOpen(false);
    setMoreOpen(false);
  };

  return (
    <nav
      className="sticky top-0 z-40 w-full bg-[#0c1120]/95 backdrop-blur-md border-b border-white/[0.08]"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ──────────────────────────────────── */}
          <Link
            to="/"
            onClick={closeAll}
            className="flex items-center space-x-2.5 group flex-shrink-0"
            aria-label="TrustShield AI — Home"
          >
            <div className="w-8 h-8 rounded-lg bg-[#0d1635] border border-cyan-500/40 flex items-center justify-center group-hover:border-cyan-400/70 transition">
              <Shield className="w-4.5 h-4.5 text-cyan-400" aria-hidden="true" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-bold text-sm tracking-tight text-white">
                TrustShield <span className="text-cyan-400">AI</span>
              </span>
              <span className="text-[9px] text-slate-500 tracking-widest font-mono uppercase">
                Cyber Defense
              </span>
            </div>
          </Link>

          {/* ── Desktop Nav ───────────────────────────── */}
          <div className="hidden lg:flex items-center gap-1 text-sm font-medium">
            {SCAN_TOOLS.map(({ key, href }) => (
              <Link
                key={href}
                to={href}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  isActive(href)
                    ? 'bg-cyan-500/10 text-cyan-400'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
                }`}
                aria-current={isActive(href) ? 'page' : undefined}
              >
                {t.nav[key]}
              </Link>
            ))}

            {/* More dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMoreOpen((v) => !v)}
                onBlur={(e) => {
                  if (!e.currentTarget.parentElement.contains(e.relatedTarget)) {
                    setMoreOpen(false);
                  }
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                aria-expanded={moreOpen}
                aria-haspopup="true"
              >
                More
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </button>
              {moreOpen && (
                <div
                  className="absolute left-0 top-full mt-1 w-48 bg-[#111827] border border-white/10 rounded-xl shadow-xl py-1 z-50"
                  role="menu"
                >
                  {MORE_TOOLS.map(({ key, href }) => (
                    <Link
                      key={href}
                      to={href}
                      onClick={() => setMoreOpen(false)}
                      role="menuitem"
                      className={`flex items-center px-4 py-2.5 text-sm transition-colors ${
                        isActive(href)
                          ? 'text-cyan-400 bg-cyan-500/10'
                          : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
                      }`}
                    >
                      {t.nav[key]}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Language + Auth (desktop) ─────── */}
          <div className="hidden md:flex items-center gap-2">
            {/* Admin badge */}
            {isAuthenticated && user?.is_admin && (
              <Link
                to="/admin/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition"
                title="Administrator Dashboard"
              >
                <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
                Admin
              </Link>
            )}

            {/* Language toggle */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 bg-white/[0.04] hover:bg-white/[0.08] text-xs text-slate-200 transition"
              aria-label={lang === 'en' ? 'Switch to Hindi' : 'Switch to English'}
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
              {lang === 'en' ? 'हिन्दी' : 'English'}
            </button>

            {/* Auth */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-slate-200 transition"
                  title="My Scan History"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
                  {t.nav.dashboard}
                </Link>
                <Link
                  to="/my-reports"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-slate-200 transition"
                  title="My Community Reports"
                >
                  <FileText className="w-3.5 h-3.5 text-purple-400" aria-hidden="true" />
                  {t.nav.myReports}
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/15 border border-cyan-500/30 text-xs font-medium text-cyan-300 transition"
                >
                  <User className="w-3.5 h-3.5" aria-hidden="true" />
                  <span className="max-w-[80px] truncate">{user?.full_name || 'Account'}</span>
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-rose-500/15 text-slate-400 hover:text-rose-300 border border-white/10 transition"
                  title={t.nav.logout}
                  aria-label={t.nav.logout}
                >
                  <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-lg border border-white/10 hover:border-white/20 bg-white/[0.04] hover:bg-white/[0.08] text-sm font-medium text-slate-200 transition"
                >
                  {t.nav.login}
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-sm font-semibold text-white transition"
                >
                  {t.nav.signup}
                </Link>
              </div>
            )}
          </div>

          {/* ── Mobile controls ───────────────────────── */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-white/10 text-xs text-slate-300"
              aria-label={lang === 'en' ? 'Switch to Hindi' : 'Switch to English'}
            >
              <Globe className="w-3 h-3 text-cyan-400" aria-hidden="true" />
              {lang === 'en' ? 'हिं' : 'EN'}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.06] transition"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Drawer ─────────────────────────────── */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          className="lg:hidden border-t border-white/[0.08] bg-[#0c1120]/98 backdrop-blur-xl"
        >
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            {/* Scan tools group */}
            <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              Scan Tools
            </p>
            {SCAN_TOOLS.map(({ key, href }) => (
              <Link
                key={href}
                to={href}
                onClick={closeAll}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(href)
                    ? 'bg-cyan-500/10 text-cyan-400'
                    : 'text-slate-200 hover:bg-white/[0.06] hover:text-white'
                }`}
                aria-current={isActive(href) ? 'page' : undefined}
              >
                {t.nav[key]}
              </Link>
            ))}

            {/* Community group */}
            <p className="px-3 py-1 pt-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              Community
            </p>
            {MORE_TOOLS.map(({ key, href }) => (
              <Link
                key={href}
                to={href}
                onClick={closeAll}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(href)
                    ? 'bg-cyan-500/10 text-cyan-400'
                    : 'text-slate-200 hover:bg-white/[0.06] hover:text-white'
                }`}
                aria-current={isActive(href) ? 'page' : undefined}
              >
                {t.nav[key]}
              </Link>
            ))}

            {/* Account section */}
            <div className="pt-3 border-t border-white/[0.08] mt-2">
              {isAuthenticated ? (
                <div className="space-y-1">
                  <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                    Account
                  </p>
                  <Link
                    to="/dashboard"
                    onClick={closeAll}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-slate-200 hover:bg-white/[0.06] hover:text-white transition"
                  >
                    <LayoutDashboard className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                    {t.nav.dashboard}
                  </Link>
                  <Link
                    to="/my-reports"
                    onClick={closeAll}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-slate-200 hover:bg-white/[0.06] hover:text-white transition"
                  >
                    <FileText className="w-4 h-4 text-purple-400" aria-hidden="true" />
                    {t.nav.myReports}
                  </Link>
                  <Link
                    to="/profile"
                    onClick={closeAll}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-slate-200 hover:bg-white/[0.06] hover:text-white transition"
                  >
                    <User className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                    {user?.full_name || t.nav.profile}
                  </Link>
                  {user?.is_admin && (
                    <Link
                      to="/admin/dashboard"
                      onClick={closeAll}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-rose-300 hover:bg-rose-500/10 transition"
                    >
                      <ShieldAlert className="w-4 h-4" aria-hidden="true" />
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => { logout(); closeAll(); }}
                    className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                  >
                    <LogOut className="w-4 h-4" aria-hidden="true" />
                    {t.nav.logout}
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 px-1 pb-1">
                  <Link
                    to="/login"
                    onClick={closeAll}
                    className="flex-1 text-center py-2.5 rounded-lg border border-white/10 bg-white/[0.04] text-sm font-medium text-white transition hover:bg-white/[0.08]"
                  >
                    {t.nav.login}
                  </Link>
                  <Link
                    to="/signup"
                    onClick={closeAll}
                    className="flex-1 text-center py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-sm font-bold text-white transition"
                  >
                    {t.nav.signup}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
