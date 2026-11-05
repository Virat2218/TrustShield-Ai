import { Link } from 'react-router-dom';
import { Shield, ExternalLink, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="w-full bg-[#080e1a] border-t border-white/[0.07] text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5" aria-label="TrustShield AI — Home">
              <div className="w-8 h-8 rounded-lg bg-[#0d1635] border border-cyan-500/40 flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-cyan-400" aria-hidden="true" />
              </div>
              <span className="font-bold text-base text-white">
                TrustShield <span className="text-cyan-400">AI</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              {t.footer.about}
            </p>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
              Scan results are guidance only — not legal advice or a security guarantee. Always
              verify with official sources before acting.
            </p>
          </div>

          {/* Scan Tools */}
          <nav aria-label="Scan tool links">
            <h3 className="text-white font-semibold text-xs uppercase tracking-widest mb-4">
              Scan Tools
            </h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: t.nav.scamDetector, href: '/scan' },
                { label: t.nav.urlChecker, href: '/url-checker' },
                { label: t.nav.screenshotAnalyzer, href: '/screenshot' },
                { label: t.nav.newsVerification, href: '/news-check' },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link to={href} className="hover:text-cyan-400 hover:underline transition">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Community */}
          <nav aria-label="Community links">
            <h3 className="text-white font-semibold text-xs uppercase tracking-widest mb-4">
              Community
            </h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: t.nav.quiz, href: '/quiz' },
                { label: t.nav.alerts, href: '/alerts' },
                { label: t.nav.reportScam, href: '/report-scam' },
                { label: t.nav.dashboard, href: '/dashboard' },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link to={href} className="hover:text-cyan-400 hover:underline transition">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Help & Legal */}
          <div>
            <h3 className="text-white font-semibold text-xs uppercase tracking-widest mb-4">
              Help &amp; Legal
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="https://cybercrime.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-cyan-400/80 hover:text-cyan-300 hover:underline transition"
                >
                  Cyber Crime Portal (India)
                  <ExternalLink className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                </a>
              </li>
              <li>
                <span className="text-slate-500 text-xs">
                  Helpline: <strong className="text-slate-400">1930</strong>
                </span>
              </li>
              <li>
                <span className="text-slate-500 cursor-default">Privacy Policy</span>
              </li>
              <li>
                <span className="text-slate-500 cursor-default">Contact</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Privacy notice */}
        <div className="mb-6 p-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.04] flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-xs text-slate-400 leading-relaxed">
            <strong className="text-slate-300">How your data is handled:</strong> Scans run
            without login are not saved. When you are signed in, scan history is stored in our
            database so you can review it on your Dashboard. Screenshots uploaded for analysis are
            processed by OCR and are not permanently retained. We do not sell your data.
            Safe Browsing checks are disabled unless a Google API key is configured.
          </p>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-white/[0.05] flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-600">
          <span>{t.footer.copyright}</span>
          <span className="text-slate-600">{t.footer.disclaimer}</span>
        </div>
      </div>
    </footer>
  );
}
