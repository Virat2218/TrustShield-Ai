import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Radio,
  Search,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Share2,
  Filter,
  Check,
} from 'lucide-react';
import { getPublicAlerts, getAlertCategories } from '../services/api';

const RISK_BADGES = {
  High: 'bg-red-500/10 text-red-400 border-red-500/30',
  Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  Low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
};

export default function ScamAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRisk, setSelectedRisk] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const cats = await getAlertCategories();
        setCategories(cats);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchAlerts() {
      setLoading(true);
      try {
        const data = await getPublicAlerts({
          category: selectedCategory === 'all' ? undefined : selectedCategory,
          risk_level: selectedRisk === 'all' ? undefined : selectedRisk,
          search: searchQuery.trim() || undefined,
        });
        setAlerts(data.items || []);
      } catch (err) {
        console.error('Failed to load alerts', err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchAlerts();
    }, 250);

    return () => clearTimeout(timer);
  }, [selectedCategory, selectedRisk, searchQuery]);

  const handleShare = (e, alertId, title) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/alerts/${alertId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${title} - Read the advisory on TrustShield AI: ${url}`);
      setCopiedId(alertId);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            Official Cybersecurity Advisories & Early Warnings
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-100 to-rose-300 bg-clip-text text-transparent">
            Scam Alerts Center
          </h1>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            Stay ahead of active digital threats, financial frauds, and emerging cyber attacks with verified advisories compiled from CERT-In, RBI, NPCI, and cybercrime intelligence.
          </p>
        </div>

        {/* Emergency Notice Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-red-900/20 to-transparent border border-rose-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex-shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Emergency National Cyber Fraud Reporting</h2>
              <p className="text-xs text-gray-300">
                If you have been targeted or lost funds in the last 24 hours, immediately call <span className="font-bold text-rose-300 font-mono">1930</span> or register at <span className="font-bold text-cyan-300 font-mono">cybercrime.gov.in</span>.
              </p>
            </div>
          </div>
          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition flex-shrink-0"
          >
            National Portal <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Filter & Search Bar */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search advisories by keyword (e.g., 'digital arrest', 'electricity', 'apk', 'telegram')..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-900/80 border border-gray-800 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs text-gray-400 flex items-center gap-1 flex-shrink-0">
                <Filter className="w-3.5 h-3.5" /> Severity:
              </span>
              {['all', 'High', 'Medium', 'Low'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedRisk(lvl)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition ${
                    selectedRisk === lvl
                      ? 'bg-cyan-500 text-black font-semibold'
                      : 'bg-gray-900/80 text-gray-400 hover:text-white border border-gray-800'
                  }`}
                >
                  {lvl === 'all' ? 'All Risks' : lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-xl cursor-pointer whitespace-nowrap transition ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-semibold'
                  : 'bg-gray-900/60 text-gray-400 hover:text-gray-200 border border-gray-800'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl cursor-pointer whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-cyan-500 text-black font-semibold'
                    : 'bg-gray-900/60 text-gray-400 hover:text-gray-200 border border-gray-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Alerts Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full border-3 border-rose-500 border-t-transparent animate-spin"></div>
            <p className="text-gray-400 text-sm">Searching verified cybersecurity advisories...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-20 rounded-2xl bg-gray-900/30 border border-gray-800">
            <ShieldCheck className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white">No advisories match your filters</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              Try searching with different keywords or clearing your category and severity filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {alerts.map((alert, idx) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="group relative flex flex-col justify-between rounded-2xl bg-[#0f172a]/70 hover:bg-[#0f172a] border border-gray-800/80 hover:border-gray-700/80 transition-all duration-300 p-6 backdrop-blur-md shadow-lg hover:shadow-cyan-500/5"
              >
                <div className="space-y-4">
                  {/* Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        RISK_BADGES[alert.risk_level] || RISK_BADGES.Medium
                      }`}
                    >
                      <AlertTriangle className="w-3 h-3" />
                      {alert.risk_level} Risk
                    </span>
                    <span className="text-[11px] font-medium text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                      {alert.category}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                      {alert.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-2 line-clamp-3 leading-relaxed">
                      {alert.description}
                    </p>
                  </div>

                  {/* Warning signs snippet */}
                  {alert.warning_signs && alert.warning_signs.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-gray-800/60">
                      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                        Key Red Flags:
                      </span>
                      <ul className="text-xs text-gray-300 space-y-1">
                        {alert.warning_signs.slice(0, 2).map((ws, i) => (
                          <li key={i} className="flex items-start gap-1.5 line-clamp-1">
                            <span className="text-rose-400 font-bold">•</span>
                            <span className="truncate">{ws}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Footer of Card */}
                <div className="pt-5 mt-4 border-t border-gray-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-gray-400 truncate max-w-[180px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                    <span className="truncate">{alert.source_name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleShare(e, alert.id, alert.title)}
                      title="Share advisory"
                      className="p-1.5 rounded-lg bg-gray-800/60 hover:bg-gray-800 text-gray-400 hover:text-white transition cursor-pointer"
                    >
                      {copiedId === alert.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <Link
                      to={`/alerts/${alert.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-medium text-xs border border-cyan-500/30 transition group-hover:border-cyan-500/50"
                    >
                      Details
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

