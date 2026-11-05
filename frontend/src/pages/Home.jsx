import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield,
  MessageSquare,
  Globe,
  FileText,
  ArrowRight,
  CheckCircle2,
  Upload,
  Camera,
  FileCheck2,
  Sparkles,
  Brain,
  AlertTriangle,
  Radio,
} from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

/** Wraps a card in a Link if `href` is provided */
function FeatureCard({ icon: Icon, title, description, badge, href }) {
  const content = (
    <div className="relative p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-cyan-500/40 hover:bg-white/[0.05] transition-all group h-full flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-xl bg-[#0d1635] border border-white/10 group-hover:border-cyan-500/40 flex items-center justify-center transition">
          <Icon className="w-5 h-5 text-cyan-400" aria-hidden="true" />
        </div>
        {badge && (
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-slate-400">
            {badge}
          </span>
        )}
      </div>
      <h3 className="text-base font-semibold text-white mb-2 group-hover:text-cyan-300 transition">
        {title}
      </h3>
      <p className="text-slate-400 text-sm leading-relaxed flex-1">{description}</p>
      {href && (
        <div className="mt-4 flex items-center gap-1 text-xs font-medium text-cyan-400 group-hover:text-cyan-300 transition">
          Try it <ArrowRight className="w-3 h-3" aria-hidden="true" />
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link to={href} className="focus-visible:outline-cyan-400 rounded-2xl block h-full">
        {content}
      </Link>
    );
  }
  return content;
}

export default function Home() {
  const { t } = useLanguage();

  const features = [
    {
      icon: MessageSquare,
      title: t.features.scamDetector.title,
      description: t.features.scamDetector.desc,
      badge: 'SMS & Email',
      href: '/scan',
    },
    {
      icon: Globe,
      title: t.features.urlChecker.title,
      description: t.features.urlChecker.desc,
      badge: 'Links & URLs',
      href: '/url-checker',
    },
    {
      icon: Camera,
      title: t.features.screenshotAnalyzer.title,
      description: t.features.screenshotAnalyzer.desc,
      badge: 'OCR + AI',
      href: '/screenshot',
    },
    {
      icon: FileCheck2,
      title: t.features.newsVerification.title,
      description: t.features.newsVerification.desc,
      badge: 'Fact-Check',
      href: '/news-check',
    },
    {
      icon: FileText,
      title: t.features.riskReports.title,
      description: t.features.riskReports.desc,
      badge: 'PDF Export',
      href: null,
    },
    {
      icon: Sparkles,
      title: t.features.multilingual.title,
      description: t.features.multilingual.desc,
      badge: 'EN + HI',
      href: null,
    },
  ];

  const steps = [
    {
      step: '01',
      icon: Upload,
      title: t.howItWorks.step1.title,
      desc: t.howItWorks.step1.desc,
    },
    {
      step: '02',
      icon: Shield,
      title: t.howItWorks.step2.title,
      desc: t.howItWorks.step2.desc,
    },
    {
      step: '03',
      icon: CheckCircle2,
      title: t.howItWorks.step3.title,
      desc: t.howItWorks.step3.desc,
    },
  ];

  const communityTools = [
    {
      icon: Brain,
      title: 'Scam Awareness Quiz',
      desc: 'Test your knowledge across phishing, UPI fraud, job scams, and more. Get personalised tips based on your score.',
      href: '/quiz',
      color: 'text-amber-400',
      border: 'hover:border-amber-500/40',
      linkLabel: 'Take the quiz',
    },
    {
      icon: AlertTriangle,
      title: 'Report a Scam',
      desc: 'Encountered a suspicious link, number, or message? Submit a community incident report and receive a unique reference ID.',
      href: '/report-scam',
      color: 'text-rose-400',
      border: 'hover:border-rose-500/40',
      linkLabel: 'File a report',
    },
    {
      icon: Radio,
      title: 'Scam Alerts',
      desc: 'Browse active scam advisories curated by our team. Filter by threat type or risk level to stay informed.',
      href: '/alerts',
      color: 'text-blue-400',
      border: 'hover:border-blue-500/40',
      linkLabel: 'Browse alerts',
    },
  ];

  return (
    <div className="space-y-24 pb-24">

      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section
        className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-8"
        aria-labelledby="hero-heading"
      >
        {/* Soft background tint — no pulsing/spinning animations */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          aria-hidden="true"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(14,165,233,0.12) 0%, transparent 100%)',
          }}
        />

        <div className="relative max-w-4xl mx-auto text-center space-y-8 z-10">

          {/* Status pill */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-cyan-500/25 text-xs font-medium text-cyan-300"
          >
            <span
              className="w-2 h-2 rounded-full bg-cyan-400 motion-safe:animate-pulse"
              aria-hidden="true"
            />
            AI-Powered Scam & Threat Detection
          </motion.div>

          {/* Heading */}
          <motion.h1
            id="hero-heading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]"
          >
            {t.hero.heading}
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed"
          >
            {t.hero.subheading}
          </motion.p>

          {/* Primary CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.22 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2"
          >
            <Link
              to="/scan"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm text-white bg-cyan-600 hover:bg-cyan-500 shadow-lg shadow-cyan-700/25 transition"
            >
              {t.hero.startScan}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <a
              href="#tools"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-medium text-sm text-slate-300 bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 hover:border-white/20 transition"
            >
              {t.hero.exploreFeatures}
            </a>
          </motion.div>

          {/* Quick-start links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-2 pt-4"
          >
            {[
              { label: 'Check a URL', href: '/url-checker' },
              { label: 'Analyze screenshot', href: '/screenshot' },
              { label: 'Fact-check news', href: '/news-check' },
            ].map(({ label, href }) => (
              <Link
                key={href}
                to={href}
                className="text-xs px-3.5 py-1.5 rounded-full border border-white/10 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40 transition"
              >
                {label}
              </Link>
            ))}
          </motion.div>

          {/* Shield icon — static, no spinning */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="pt-8 flex justify-center"
            aria-hidden="true"
          >
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-[#0d1635] border border-cyan-500/30 shadow-xl shadow-cyan-900/20 flex flex-col items-center justify-center gap-2">
              <Shield className="w-12 h-12 text-cyan-400" />
              <span className="text-[9px] font-mono uppercase text-cyan-400/70 tracking-widest">
                TrustShield AI
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Scan Tools ───────────────────────────────────────── */}
      <section
        id="tools"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        aria-labelledby="features-heading"
      >
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
            Capabilities
          </span>
          <h2 id="features-heading" className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            {t.features.title}
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">{t.features.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feat, idx) => (
            <FeatureCard key={idx} {...feat} />
          ))}
        </div>
      </section>

      {/* ─── How It Works ─────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        aria-labelledby="how-heading"
      >
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
            Workflow
          </span>
          <h2 id="how-heading" className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            {t.howItWorks.title}
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">{t.howItWorks.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, idx) => {
            const StepIcon = step.icon;
            return (
              <div
                key={idx}
                className="p-7 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col"
              >
                <div className="flex items-center justify-between mb-5">
                  <span className="text-3xl font-extrabold font-mono text-white/15">
                    {step.step}
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <StepIcon className="w-4.5 h-4.5 text-cyan-400" aria-hidden="true" />
                  </div>
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Limitations / Transparency notice ───────────────── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-semibold text-white">What TrustShield AI can and cannot do</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">What it does</p>
              <ul className="space-y-1.5 text-slate-400">
                {[
                  'Scans messages and URLs using rule-based heuristics',
                  'Extracts text from screenshots with OCR',
                  'Checks claims against publicly available information',
                  'Gives an explainable risk score with reasons',
                  'Saves your scan history when you are signed in',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">Limitations</p>
              <ul className="space-y-1.5 text-slate-400">
                {[
                  'Cannot guarantee any content is 100% safe or harmful',
                  'Google Safe Browsing check requires a configured API key',
                  'AI analysis may miss novel or sophisticated attacks',
                  'News fact-checking is not a substitute for journalism',
                  'Password reset emails require SMTP to be configured',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Community Tools ──────────────────────────────────── */}
      <section
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        aria-labelledby="community-heading"
      >
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
            Community
          </span>
          <h2 id="community-heading" className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Learn, Report &amp; Stay Alert
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Beyond scanning — build your awareness and help protect others.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {communityTools.map(({ icon: Icon, title, desc, href, color, border, linkLabel }) => (
            <div
              key={href}
              className={`p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] ${border} transition flex flex-col`}
            >
              <div className="mb-4">
                <div className={`w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center ${color}`}>
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
              </div>
              <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed flex-1">{desc}</p>
              <div className="pt-5">
                <Link
                  to={href}
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold ${color} hover:underline transition`}
                >
                  {linkLabel}
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Bottom CTA ───────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-[#0d1635] border border-white/10 p-8 sm:p-12 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Suspect a message or link?
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto">
            Run a free scan in seconds. No account required for the main scan tools.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/scan"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg transition"
            >
              Scan Suspicious Message
            </Link>
            <Link
              to="/url-checker"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-white/[0.06] hover:bg-white/[0.10] text-white border border-white/10 transition"
            >
              Check Website URL
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
