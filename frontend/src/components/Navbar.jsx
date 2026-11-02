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
  Award,
  Radio,
  FileText,
  ShieldAlert,
} from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { lang, toggleLanguage, t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 w-full bg-[#0a0e1a]/90 backdrop-blur-md border-b border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-[1px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition">
              <div className="w-full h-full bg-[#0d1635] rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition duration-300" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                TrustShield <span className="text-cyan-400">AI</span>
              </span>
              <span className="text-[9px] text-slate-400 -mt-1 tracking-widest font-mono uppercase">
                Cyber Defense
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden xl:flex items-center space-x-4 text-xs font-medium">
            <Link
              to="/scan"
              className={`transition hover:text-cyan-400 ${
                isActive('/scan') ? 'text-cyan-400 font-semibold' : 'text-slate-300'
              }`}
            >
              {t.nav.scamDetector}
            </Link>
            <Link
              to="/url-checker"
              className={`transition hover:text-cyan-400 ${
                isActive('/url-checker') ? 'text-cyan-400 font-semibold' : 'text-slate-300'
              }`}
            >
              {t.nav.urlChecker}
            </Link>
            <Link
              to="/screenshot"
              className={`transition hover:text-cyan-400 ${
                isActive('/screenshot') ? 'text-cyan-400 font-semibold' : 'text-slate-300'
              }`}
            >
              {t.nav.screenshotAnalyzer}
            </Link>
            <Link
              to="/news-check"
              className={`transition hover:text-cyan-400 ${
                isActive('/news-check') ? 'text-cyan-400 font-semibold' : 'text-slate-300'
              }`}
            >
              {t.nav.newsVerification}
            </Link>
            <Link
              to="/quiz"
              className={`transition hover:text-cyan-400 ${
                isActive('/quiz') ? 'text-cyan-400 font-semibold' : 'text-slate-300'
              }`}
            >
              {t.nav.quiz}
            </Link>
            <Link
              to="/alerts"
              className={`transition hover:text-cyan-400 ${
                isActive('/alerts') ? 'text-cyan-400 font-semibold' : 'text-slate-300'
              }`}
            >
              {t.nav.alerts}
            </Link>
            <Link
              to="/report-scam"
              className={`transition hover:text-rose-400 ${
                isActive('/report-scam') ? 'text-rose-400 font-semibold' : 'text-slate-300'
              }`}
            >
              {t.nav.reportScam}
            </Link>
          </div>

          {/* Right actions: Language toggle + User Auth */}
          <div className="hidden md:flex items-center space-x-2.5">
            {isAuthenticated && user?.is_admin && (
              <Link
                to="/admin/dashboard"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition"
                title="Administrator Command Center"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>Admin</span>
              </Link>
            )}

            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-white/10 hover:border-cyan-500/40 bg-white/5 hover:bg-white/10 text-xs text-slate-200 transition cursor-pointer"
              title="Toggle Language (English / हिंदी)"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>{lang === 'en' ? 'हिन्दी' : 'English'}</span>
            </button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-200 transition"
                  title="My Scan History"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{t.nav.dashboard}</span>
                </Link>
                <Link
                  to="/my-reports"
                  className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-200 transition"
                  title="My Community Incident Reports"
                >
                  <FileText className="w-3.5 h-3.5 text-purple-400" />
                  <span>{t.nav.myReports}</span>
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-xs font-medium text-cyan-300 transition"
                >
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="max-w-[80px] truncate">{user?.full_name || 'Account'}</span>
                </Link>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/10 transition cursor-pointer"
                  title={t.nav.logout}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-200 transition"
                >
                  {t.nav.login}
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-xs font-semibold text-white shadow-md shadow-cyan-500/20 hover:scale-[1.02] transition"
                >
                  {t.nav.signup}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger menu toggle */}
          <div className="flex xl:hidden items-center space-x-2">
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 px-2.5 py-1 rounded border border-white/10 text-xs text-slate-300"
            >
              <Globe className="w-3 h-3 text-cyan-400" />
              <span>{lang === 'en' ? 'हिं' : 'EN'}</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-b border-white/10 bg-[#0a0e1a]/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-2 text-xs">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-200 hover:text-cyan-400 font-medium"
          >
            {t.nav.home}
          </Link>
          <Link
            to="/scan"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-cyan-400 font-medium"
          >
            {t.nav.scamDetector}
          </Link>
          <Link
            to="/url-checker"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-cyan-400 font-medium"
          >
            {t.nav.urlChecker}
          </Link>
          <Link
            to="/screenshot"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-cyan-400 font-medium"
          >
            {t.nav.screenshotAnalyzer}
          </Link>
          <Link
            to="/news-check"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-cyan-400 font-medium"
          >
            {t.nav.newsVerification}
          </Link>
          <Link
            to="/quiz"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-amber-300 font-medium"
          >
            {t.nav.quiz}
          </Link>
          <Link
            to="/alerts"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-rose-300 font-medium"
          >
            {t.nav.alerts}
          </Link>
          <Link
            to="/report-scam"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-red-400 font-medium"
          >
            {t.nav.reportScam}
          </Link>

          {isAuthenticated && (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-cyan-400 font-medium"
              >
                {t.nav.dashboard}
              </Link>
              <Link
                to="/my-reports"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-purple-400 font-medium"
              >
                {t.nav.myReports}
              </Link>
              {user?.is_admin && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-rose-400 font-bold"
                >
                  ⚡ Administrator Console
                </Link>
              )}
            </>
          )}

          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-semibold text-slate-200"
                >
                  {user?.full_name || 'My Profile'}
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-rose-400 font-medium cursor-pointer"
                >
                  {t.nav.logout}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3 w-full">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                >
                  {t.nav.login}
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 rounded-xl bg-cyan-600 font-bold text-white"
                >
                  {t.nav.signup}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
