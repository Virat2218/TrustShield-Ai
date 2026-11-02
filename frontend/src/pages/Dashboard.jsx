import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Search,
  Filter,
  Trash2,
  Eye,
  Download,
  Calendar,
  X,
  RefreshCw,
  MessageSquare,
  Globe,
  Camera,
  FileCheck2,
  FileText,
} from 'lucide-react';
import { getScanHistory, getScanStats, deleteScanRecord, downloadScanPdf, getScanDetail } from '../services/api';
import { useLanguage } from '../hooks/useLanguage';
import RiskReport from '../components/RiskReport';

export default function Dashboard() {
  const { t } = useLanguage();

  const [stats, setStats] = useState({ total_scans: 0, high_risk: 0, medium_risk: 0, low_risk: 0 });
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');

  // Modal detail view
  const [selectedScan, setSelectedScan] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, historyData] = await Promise.all([
        getScanStats(),
        getScanHistory({
          scan_type: typeFilter !== 'all' ? typeFilter : undefined,
          risk_level: riskFilter !== 'all' ? riskFilter : undefined,
          search: search.trim() || undefined,
        }),
      ]);
      setStats(statsData);
      setScans(historyData);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, riskFilter, search]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleDelete = async (scanId) => {
    if (!window.confirm('Are you sure you want to delete this scan record?')) return;
    try {
      await deleteScanRecord(scanId);
      setScans((prev) => prev.filter((s) => s.id !== scanId));
      const newStats = await getScanStats();
      setStats(newStats);
      if (selectedScan && selectedScan.id === scanId) setSelectedScan(null);
    } catch (err) {
      console.error('Failed to delete scan:', err);
    }
  };

  const handleOpenDetail = async (scanId) => {
    setModalLoading(true);
    try {
      const detail = await getScanDetail(scanId);
      setSelectedScan(detail);
    } catch (err) {
      console.error('Failed to fetch scan detail:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const getScanIcon = (type) => {
    switch (type) {
      case 'url':
        return Globe;
      case 'screenshot':
        return Camera;
      case 'news':
        return FileCheck2;
      default:
        return MessageSquare;
    }
  };

  const getRiskBadge = (level) => {
    const l = (level || '').toLowerCase();
    if (l === 'high') {
      return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    } else if (l === 'medium') {
      return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    }
    return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Personal Security Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            {t.dashboard.title}
          </h1>
          <p className="text-sm text-slate-400">
            {t.dashboard.subtitle}
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          className="self-start sm:self-auto flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <div className="p-5 rounded-2xl bg-[#0d1635]/80 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {t.dashboard.totalScans}
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-white">{stats.total_scans}</span>
          <p className="text-[11px] text-slate-500 mt-1">Across all detection engines</p>
        </div>

        {/* High Risk */}
        <div className="p-5 rounded-2xl bg-rose-500/[0.06] border border-rose-500/20 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-300">
              {t.dashboard.highRisk}
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-rose-400">{stats.high_risk}</span>
          <p className="text-[11px] text-rose-400/80 mt-1">Confirmed threats &amp; scams</p>
        </div>

        {/* Medium Risk */}
        <div className="p-5 rounded-2xl bg-amber-500/[0.06] border border-amber-500/20 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
              {t.dashboard.mediumRisk}
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-amber-400">{stats.medium_risk}</span>
          <p className="text-[11px] text-amber-400/80 mt-1">Requires user verification</p>
        </div>

        {/* Low Risk */}
        <div className="p-5 rounded-2xl bg-emerald-500/[0.06] border border-emerald-500/20 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
              {t.dashboard.lowRisk}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-emerald-400">{stats.low_risk}</span>
          <p className="text-[11px] text-emerald-400/80 mt-1">No significant threat flags</p>
        </div>
      </div>

      {/* History Table Container */}
      <div className="rounded-3xl bg-[#0d1635]/70 backdrop-blur-md border border-white/10 shadow-2xl overflow-hidden">
        {/* Filters Bar */}
        <div className="p-5 border-b border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.dashboard.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
            />
          </div>

          {/* Type & Risk Filters */}
          <div className="flex items-center gap-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
            >
              <option value="all">{t.dashboard.allTypes}</option>
              <option value="message">Message</option>
              <option value="url">URL Link</option>
              <option value="screenshot">Screenshot</option>
              <option value="news">News Claim</option>
            </select>

            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
            >
              <option value="all">{t.dashboard.allRisks}</option>
              <option value="high">High Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="low">Low Risk</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-2">
              <span className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></span>
              <span>Loading scan history...</span>
            </div>
          ) : scans.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs space-y-2">
              <ShieldCheck className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-medium text-slate-300">{t.dashboard.empty}</p>
              <p className="text-slate-500">Perform a scan to save records here automatically.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02] text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-5">{t.dashboard.type}</th>
                  <th className="py-3.5 px-5">{t.dashboard.content}</th>
                  <th className="py-3.5 px-5">{t.dashboard.score}</th>
                  <th className="py-3.5 px-5">{t.dashboard.risk}</th>
                  <th className="py-3.5 px-5">{t.dashboard.date}</th>
                  <th className="py-3.5 px-5 text-right">{t.dashboard.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {scans.map((scan) => {
                  const Icon = getScanIcon(scan.scan_type);
                  return (
                    <tr
                      key={scan.id}
                      className="hover:bg-white/[0.02] transition"
                    >
                      <td className="py-4 px-5">
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-medium text-white capitalize">
                            {scan.scan_type}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-5 max-w-xs sm:max-w-md">
                        <p className="truncate text-slate-300">
                          {scan.submitted_content}
                        </p>
                      </td>
                      <td className="py-4 px-5 font-mono font-bold text-white">
                        {scan.risk_score}/100
                      </td>
                      <td className="py-4 px-5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getRiskBadge(
                            scan.risk_level
                          )}`}
                        >
                          {scan.risk_level}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-slate-400 text-[11px]">
                        {new Date(scan.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenDetail(scan.id)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-cyan-400 transition"
                            title={t.dashboard.viewReport}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => downloadScanPdf(scan.id, scan.scan_type)}
                            className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 transition"
                            title={t.dashboard.downloadPdf}
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(scan.id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 transition"
                            title={t.dashboard.deleteScan}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal for viewing detailed scan report */}
      <AnimatePresence>
        {selectedScan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0a0e1a] border border-white/15 p-6 md:p-8 shadow-2xl space-y-6"
            >
              {/* Modal Close Button */}
              <button
                onClick={() => setSelectedScan(null)}
                className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
                <Eye className="w-4 h-4" />
                <span>Historical Scan Assessment #{selectedScan.id}</span>
              </div>

              <RiskReport
                result={selectedScan.analysis_result}
                type={selectedScan.scan_type}
                onReset={() => setSelectedScan(null)}
                submittedContent={selectedScan.submitted_content}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

