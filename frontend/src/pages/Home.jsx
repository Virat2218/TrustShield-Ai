import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield,
  MessageSquare,
  Globe,
  FileText,
  Lock,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Upload,
  Brain,
  Sparkles,
  Zap,
  Eye,
  AlertTriangle,
  Camera,
  FileCheck2,
} from 'lucide-react';
import FeatureCard from '../components/FeatureCard';
import { useLanguage } from '../hooks/useLanguage';

export default function Home() {
  const { t } = useLanguage();

  const features = [
    {
      icon: MessageSquare,
      title: t.features.scamDetector.title,
      description: t.features.scamDetector.desc,
      badge: 'SMS & Email',
    },
    {
      icon: Globe,
      title: t.features.urlChecker.title,
      description: t.features.urlChecker.desc,
      badge: 'Real-time',
    },
    {
      icon: Camera,
      title: t.features.screenshotAnalyzer.title,
      description: t.features.screenshotAnalyzer.desc,
      badge: 'OCR Vision',
    },
    {
      icon: FileCheck2,
      title: t.features.newsVerification.title,
      description: t.features.newsVerification.desc,
      badge: 'Fact-Check',
    },
    {
      icon: FileText,
      title: t.features.riskReports.title,
      description: t.features.riskReports.desc,
      badge: 'PDF Export',
    },
    {
      icon: Sparkles,
      title: t.features.multilingual.title,
      description: t.features.multilingual.desc,
      badge: 'EN + HI',
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
      icon: Cpu,
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

  const whyPoints = [
    {
      icon: Brain,
      title: t.why.ai.title,
      desc: t.why.ai.desc,
    },
    {
      icon: Eye,
      title: t.why.explain.title,
      desc: t.why.explain.desc,
    },
    {
      icon: Zap,
      title: t.why.ux.title,
      desc: t.why.ux.desc,
    },
    {
      icon: Shield,
      title: t.why.aware.title,
      desc: t.why.aware.desc,
    },
  ];

  return (
    <div className="space-y-24 md:space-y-32 pb-24">
      {/* ─── Hero Section ───────────────────────────────────── */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 pt-8">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-blue-600/20 via-cyan-500/20 to-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Futuristic Grid overlay */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        ></div>

        <div className="relative max-w-5xl mx-auto text-center space-y-8 z-10">
          {/* Top Pill */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-cyan-500/30 text-xs font-medium text-cyan-300 shadow-lg shadow-cyan-500/10 backdrop-blur-sm"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>AI-Powered Digital Threat Detection</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]"
          >
            {t.hero.heading.split(' ').map((word, i) => (
              <span key={i}>
                {word === 'Digital' || word === 'World' || word === 'डिजिटल' || word === 'सुरक्षित' ? (
                  <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300 bg-clip-text text-transparent">
                    {word}{' '}
                  </span>
                ) : (
                  `${word} `
                )}
              </span>
            ))}
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed font-normal"
          >
            {t.hero.subheading}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
          >
            <Link
              to="/scan"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-blue-600 via-cyan-600 to-cyan-500 shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] transition"
            >
              <span>{t.hero.startScan}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#features"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-3.5 rounded-xl font-medium text-sm text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition"
            >
              <span>{t.hero.exploreFeatures}</span>
            </a>
          </motion.div>

          {/* Futuristic Shield Graphic */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="pt-10 flex justify-center"
          >
            <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center">
              {/* Outer pulsing ring */}
              <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-ping opacity-30"></div>
              {/* Rotating dashed ring */}
              <div
                className="absolute inset-2 rounded-full border-2 border-dashed border-cyan-400/40 animate-spin"
                style={{ animationDuration: '24s' }}
              ></div>
              {/* Inner glowing container */}
              <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-br from-[#0d1635] to-[#0a0e1a] border border-cyan-500/40 shadow-2xl shadow-cyan-500/30 flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent"></div>
                <Shield className="w-14 h-14 sm:w-16 sm:h-16 text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]" />
                <span className="text-[10px] font-mono uppercase text-cyan-300 tracking-widest mt-1 font-semibold">
                  AI DEFENSE
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Feature Cards Section ──────────────────────────── */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
            Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            {t.features.title}
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            {t.features.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => (
            <FeatureCard
              key={idx}
              icon={feat.icon}
              title={feat.title}
              description={feat.description}
              badge={feat.badge}
            />
          ))}
        </div>
      </section>

      {/* ─── How It Works Section ───────────────────────────── */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
            Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            {t.howItWorks.title}
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            {t.howItWorks.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => {
            const StepIcon = step.icon;
            return (
              <div
                key={idx}
                className="relative p-8 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-cyan-500/30 transition group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl font-extrabold font-mono text-cyan-400/40 group-hover:text-cyan-400 transition">
                      {step.step}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                      <StepIcon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Why TrustShield AI Section ──────────────────────── */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 md:p-16 rounded-3xl bg-gradient-to-b from-[#0d1635]/60 to-[#0a0e1a]/80 border border-white/10 relative overflow-hidden shadow-2xl">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
              Mission
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              {t.why.title}
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              {t.why.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {whyPoints.map((pt, idx) => {
              const PtIcon = pt.icon;
              return (
                <div key={idx} className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 text-cyan-400 mt-1">
                    <PtIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {pt.title}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {pt.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Phase 3 Showcase: Community Defense & Extensions ────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            Phase 3 Next-Gen Defenses
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Community Defense & Awareness Ecosystem
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Empowering citizens with proactive scam awareness quizzes, crowdsourced threat reporting, and browser protections.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Quiz */}
          <div className="p-6 rounded-3xl bg-[#0f172a]/70 border border-gray-800 backdrop-blur-md flex flex-col justify-between hover:border-cyan-500/40 transition">
            <div className="space-y-3">
              <span className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 inline-block">
                <Brain className="w-6 h-6" />
              </span>
              <h3 className="text-xl font-bold text-white">Scam Awareness Center</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Test your security reflexes across 7 scam categories (UPI, Phishing, Job scams) and 3 difficulty tiers. Get personalized safety recommendations.
              </p>
            </div>
            <div className="pt-6">
              <Link
                to="/quiz"
                className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition"
              >
                Take the Security Quiz <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: Community Scam Reporting */}
          <div className="p-6 rounded-3xl bg-[#0f172a]/70 border border-gray-800 backdrop-blur-md flex flex-col justify-between hover:border-rose-500/40 transition">
            <div className="space-y-3">
              <span className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 inline-block">
                <AlertTriangle className="w-6 h-6" />
              </span>
              <h3 className="text-xl font-bold text-white">Community Threat Registry</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Encountered a suspicious link, fraudster number, or fake job? Submit an incident report to alert the community and get a unique reference ID.
              </p>
            </div>
            <div className="pt-6">
              <Link
                to="/report-scam"
                className="inline-flex items-center gap-2 text-xs font-bold text-rose-400 hover:text-rose-300 transition"
              >
                Report a Scam Incident <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 3: Chrome Browser Extension */}
          <div className="p-6 rounded-3xl bg-[#0f172a]/70 border border-gray-800 backdrop-blur-md flex flex-col justify-between hover:border-blue-500/40 transition">
            <div className="space-y-3">
              <span className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 inline-block">
                <Globe className="w-6 h-6" />
              </span>
              <h3 className="text-xl font-bold text-white">Chrome Browser Extension</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Scan active browsing tabs in real time with our Manifest V3 Chrome Extension. Features instant risk gauge, heuristic warnings, and one-click deep scans.
              </p>
            </div>
            <div className="pt-6">
              <Link
                to="/alerts"
                className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 transition"
              >
                Browse Threat Advisories <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Bottom CTA Banner ───────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 p-8 sm:p-12 text-center text-white overflow-hidden shadow-2xl shadow-cyan-500/20">
          <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Suspect a message or link?
            </h2>
            <p className="text-blue-100 text-sm sm:text-base">
              Run a free scan in seconds. No login required, zero data stored.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                to="/scan"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-white text-slate-900 hover:bg-slate-100 transition shadow-lg"
              >
                Scan Suspicious Message
              </Link>
              <Link
                to="/url-checker"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-black/20 hover:bg-black/30 text-white border border-white/20 transition"
              >
                Check Website URL
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

