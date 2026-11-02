import { Link } from 'react-router-dom';
import { Shield, Lock, ExternalLink, Heart } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="w-full bg-[#060912] border-t border-white/10 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-[1px]">
                <div className="w-full h-full bg-[#0d1635] rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <span className="font-bold text-lg text-white">
                TrustShield <span className="text-cyan-400">AI</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm max-w-md leading-relaxed">
              {t.footer.about}
            </p>
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Zero data retention by default • Privacy-first design</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider text-xs">
              {t.footer.links}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-cyan-400 transition">
                  {t.nav.home}
                </Link>
              </li>
              <li>
                <Link to="/scan" className="hover:text-cyan-400 transition">
                  {t.nav.scamDetector}
                </Link>
              </li>
              <li>
                <Link to="/url-checker" className="hover:text-cyan-400 transition">
                  {t.nav.urlChecker}
                </Link>
              </li>
              <li>
                <Link to="/screenshot" className="hover:text-cyan-400 transition">
                  {t.nav.screenshotAnalyzer}
                </Link>
              </li>
              <li>
                <Link to="/news-check" className="hover:text-cyan-400 transition">
                  {t.nav.newsVerification}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Resources */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider text-xs">
              {t.footer.legal}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <span className="text-slate-400 hover:text-slate-300 cursor-pointer">
                  {t.footer.privacy}
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-slate-300 cursor-pointer">
                  {t.footer.contact}
                </span>
              </li>
              <li>
                <a
                  href="https://cybercrime.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition inline-flex items-center gap-1 text-xs text-cyan-400/80"
                >
                  National Cyber Helpline (1930) <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer banner */}
        <div className="pt-6 border-t border-white/5 text-xs text-slate-500 space-y-2">
          <p>{t.footer.disclaimer}</p>
          <div className="flex flex-col sm:flex-row justify-between items-center pt-2 text-[11px] text-slate-600 gap-2">
            <span>{t.footer.copyright}</span>
            <span className="inline-flex items-center gap-1">
              Built with security in mind
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

