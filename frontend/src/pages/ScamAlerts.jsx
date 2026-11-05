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
  Share2,
  Filter,
  Check,
} from 'lucide-react';
import { getPublicAlerts, getAlertCategories } from '../services/api';

const RISK_BADGES = {
  High: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
  Medium: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  Low: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 space-y-8">
      {/* Hero Section */}
      <header className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20">
          <Radio className="w-3.5 h-3.5 text-blue-400" aria-hidden="true" />
          <span>Threat Intelligence &amp; Advisories</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Scam Alerts &amp; Advisories
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Stay informed on emerging scam tactics, fake schemes, and impersonation campaigns. Advisories
          highlight key red flags and practical prevention steps.
        </p>
      </header>

      {/* Emergency Notice Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-rose-500/[0.06] border border-rose-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex-shrink-0">
            <ShieldAlert className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Emergency National Cyber Fraud Reporting</h2>
            <p className="text-xs text-slate-300">
              If you have lost funds or experienced urgent fraud, call <span className="font-bold text-rose-300 font-mono">1930</span> or register at <span className="font-bold text-cyan-300 font-mono">cybercrime.gov.in</span>.
            </p>
          </div>
        </div>
        <a
          href="https://cybercrime.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition flex-shrink-0"
        >
          National Portal <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
        </a>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search advisories by keyword (e.g. KYC, electricity, telegram)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search advisories"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/30 border border-white/[0.08] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto" role="group" aria-label="Filter by severity">
            <span className="text-xs text-slate-400 flex items-center gap-1 flex-shrink-0">
              <Filter className="w-3.5 h-3.5" aria-hidden="true" /> Severity:
            </span>
            {['all', 'High', 'Medium', 'Low'].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setSelectedRisk(lvl)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  selectedRisk === lvl
                    ? 'bg-cyan-600 text-white font-semibold'
                    : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.08]'
                }`}
              >
                {lvl === 'all' ? 'All Risks' : lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs" role="group" aria-label="Filter by category">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-cyan-600 text-white font-semibold'
                : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.08]'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-cyan-600 text-white font-semibold'
                  : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.08]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3" role="status" aria-label="Loading advisories...">
          <div className="w-8 h-8 rounded-full border-2 border-slate-700 border-t-cyan-400 animate-spin" aria-hidden="true"></div>
          <p className="text-slate-400 text-sm">Searching advisories...</p>
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-16 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
          <ShieldCheck className="w-10 h-10 text-slate-500 mx-auto mb-3" aria-hidden="true" />
          <h2 className="text-base font-semibold text-white">No advisories match your filters</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try searching with different terms or resetting your category and severity filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {alerts.map((alert, idx) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.04 }}
              className="group relative flex flex-col justify-between rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.08] hover:border-cyan-500/30 transition-all p-6 shadow-sm"
            >
              <div className="space-y-4">
                {/* Badges */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      RISK_BADGES[alert.risk_level] || RISK_BADGES.Medium
                    }`}
                  >
                    <AlertTriangle className="w-3 h-3" aria-hidden="true" />
                    {alert.risk_level} Risk
                  </span>
                  <span className="text-[11px] font-medium text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                    {alert.category}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h2 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                    {alert.title}
                  </h2>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    {alert.description}
                  </p>
                </div>

                {/* Warning signs snippet */}
                {alert.warning_signs && alert.warning_signs.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Key Red Flags:
                    </span>
                    <ul className="text-xs text-slate-300 space-y-1">
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
              <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-400 truncate max-w-[180px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" aria-hidden="true" />
                  <span className="truncate">{alert.source_name}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleShare(e, alert.id, alert.title)}
                    title="Copy shareable link"
                    aria-label={`Share ${alert.title}`}
                    className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    {copiedId === alert.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                    ) : (
                      <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
                    )}
                  </button>
                  <Link
                    to={`/alerts/${alert.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-medium text-xs border border-cyan-500/30 transition"
                  >
                    Details
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
