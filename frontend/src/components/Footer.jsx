import { Link } from 'react-router-dom';
import { ShieldCheck, Check, ExternalLink } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="w-full bg-slate-50 border-t border-slate-200 text-slate-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">

          {/* Brand Info */}
          <div className="space-y-3">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#0d766e] flex items-center justify-center text-white shadow-xs">
                <Check className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
              </div>
              <span className="font-bold text-lg text-slate-900 tracking-tight">
                TrustShield <span className="text-[#0d766e]">AI</span>
              </span>
            </Link>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
              Understand suspicious messages, links, screenshots, and claims in seconds.
            </p>
          </div>

          {/* Tools */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Tools
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/quick-check" className="hover:text-[#0d766e] transition font-medium text-[#0d766e]">
                  Quick Safety Check
                </Link>
              </li>
              <li>
                <Link to="/scan" className="hover:text-[#0d766e] transition">
                  Message Scanner
                </Link>
              </li>
              <li>
                <Link to="/url-checker" className="hover:text-[#0d766e] transition">
                  Website Link Checker
                </Link>
              </li>
              <li>
                <Link to="/qr-checker" className="hover:text-[#0d766e] transition">
                  QR Code Safety Scan
                </Link>
              </li>
              <li>
                <Link to="/email-checker" className="hover:text-[#0d766e] transition">
                  Email Sender &amp; Headers
                </Link>
              </li>
              <li>
                <Link to="/call-checker" className="hover:text-[#0d766e] transition">
                  Scam Call Checker
                </Link>
              </li>
              <li>
                <Link to="/screenshot" className="hover:text-[#0d766e] transition">
                  Screenshot Analyzer
                </Link>
              </li>
              <li>
                <Link to="/news-check" className="hover:text-[#0d766e] transition">
                  News Claim Verifier
                </Link>
              </li>
            </ul>
          </div>

          {/* Learn & Community */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Learn &amp; Support
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/learning-center" className="hover:text-[#0d766e] transition">
                  Safe Learning Center
                </Link>
              </li>
              <li>
                <Link to="/practice" className="hover:text-[#0d766e] transition">
                  Scam Practice Simulator
                </Link>
              </li>
              <li>
                <Link to="/quiz" className="hover:text-[#0d766e] transition">
                  Scam Awareness Quiz
                </Link>
              </li>
              <li>
                <Link to="/incident-response" className="hover:text-rose-600 font-semibold text-rose-700 transition">
                  Emergency Incident Guide
                </Link>
              </li>
              <li>
                <Link to="/alerts" className="hover:text-[#0d766e] transition">
                  Scam Advisories &amp; Alerts
                </Link>
              </li>
              <li>
                <Link to="/report-scam" className="hover:text-[#0d766e] transition">
                  Report a Scam
                </Link>
              </li>
            </ul>
          </div>

          {/* Helplines & Verification */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              National Support
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <a
                  href="https://cybercrime.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#0d766e] hover:text-[#0f766e] font-medium"
                >
                  National Cyber Crime Portal
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </li>
              <li className="text-xs text-slate-500">
                Helpline: <strong className="text-slate-800 font-mono">1930</strong>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© 2026 TrustShield AI. All rights reserved.</p>
          <p>Results provide guidance only. Verify important decisions with official sources.</p>
        </div>
      </div>
    </footer>
  );
}
