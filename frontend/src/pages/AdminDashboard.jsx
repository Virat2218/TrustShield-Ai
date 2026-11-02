import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  Users,
  FileSearch,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Radio,
  BarChart3,
  Search,
  UserCheck,
  UserX,
  Plus,
  Trash2,
  Filter,
  ExternalLink,
  RefreshCw,
  HelpCircle,
  TrendingUp,
  Award,
  Paperclip,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  getAdminAnalytics,
  getAdminUsers,
  updateAdminUser,
  getAdminReports,
  moderateAdminReport,
  createAdminAlert,
  deleteAdminAlert,
  createAdminQuizQuestion,
  deleteAdminQuizQuestion,
  getReportAttachmentBlobUrl,
} from '../services/api';

const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
const RISK_COLORS = {
  High: '#ef4444',
  Medium: '#f59e0b',
  Low: '#10b981',
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('analytics');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Users tab state
  const [usersList, setUsersList] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [usersLoading, setUsersLoading] = useState(false);

  // Reports tab state
  const [reportsList, setReportsList] = useState([]);
  const [reportFilter, setReportFilter] = useState('all');
  const [reportsLoading, setReportsLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [modStatus, setModStatus] = useState('Verified');
  const [modNotes, setModNotes] = useState('');
  const [modSubmitting, setModSubmitting] = useState(false);
  const [attachmentLoading, setAttachmentLoading] = useState(false);

  const handleViewReportAttachment = async (reportId) => {
    setAttachmentLoading(true);
    try {
      const blobUrl = await getReportAttachmentBlobUrl(reportId);
      window.open(blobUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('Failed to load attachment:', err);
    } finally {
      setAttachmentLoading(false);
    }
  };

  // Alerts tab state
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [newAlert, setNewAlert] = useState({
    title: '',
    category: 'Digital Arrest',
    risk_level: 'High',
    description: '',
    how_it_works: '',
    warning_signs: '',
    prevention_tips: '',
    source_name: 'CERT-In Advisory',
    source_url: 'https://www.cert-in.org.in',
    is_published: true,
  });

  // Quiz tab state
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    category: 'Phishing',
    difficulty: 'Beginner',
    question: '',
    opt0: '',
    opt1: '',
    opt2: '',
    opt3: '',
    correct_answer: 0,
    explanation: '',
  });

  const loadAnalytics = async () => {
    try {
      setError(null);
      const data = await getAdminAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to load administrator analytics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    if (activeTab === 'analytics') loadAnalytics();
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'reports') loadReports();
  };

  // Load Users
  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      const data = await getAdminUsers(userSearch);
      setUsersList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab]);

  const handleToggleAdmin = async (userId, currentAdmin) => {
    try {
      await updateAdminUser(userId, { is_admin: !currentAdmin });
      setActionSuccess(`User role updated successfully.`);
      loadUsers();
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update user role.');
    }
  };

  // Load Reports
  const loadReports = async () => {
    try {
      setReportsLoading(true);
      const data = await getAdminReports(reportFilter);
      setReportsList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setReportsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'reports') {
      loadReports();
    }
  }, [activeTab, reportFilter]);

  const handleModerateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;
    try {
      setModSubmitting(true);
      await moderateAdminReport(selectedReport.id, {
        status: modStatus,
        moderation_notes: modNotes,
      });
      setActionSuccess(`Report ${selectedReport.reference_id} marked as ${modStatus}.`);
      setSelectedReport(null);
      loadReports();
      loadAnalytics();
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to moderate report.');
    } finally {
      setModSubmitting(false);
    }
  };

  // Create Scam Alert
  const handleCreateAlert = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: newAlert.title,
        category: newAlert.category,
        risk_level: newAlert.risk_level,
        description: newAlert.description,
        how_it_works: newAlert.how_it_works,
        warning_signs: newAlert.warning_signs.split('\n').map((s) => s.trim()).filter(Boolean),
        prevention_tips: newAlert.prevention_tips.split('\n').map((s) => s.trim()).filter(Boolean),
        source_name: newAlert.source_name,
        source_url: newAlert.source_url,
        is_published: newAlert.is_published,
      };
      await createAdminAlert(payload);
      setActionSuccess('Scam Advisory Alert published successfully!');
      setShowAlertModal(false);
      setNewAlert({
        title: '',
        category: 'Digital Arrest',
        risk_level: 'High',
        description: '',
        how_it_works: '',
        warning_signs: '',
        prevention_tips: '',
        source_name: 'CERT-In Advisory',
        source_url: 'https://www.cert-in.org.in',
        is_published: true,
      });
      loadAnalytics();
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create scam alert.');
    }
  };

  // Create Quiz Question
  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    try {
      const options = [newQuestion.opt0, newQuestion.opt1, newQuestion.opt2, newQuestion.opt3].map((o) => o.trim());
      if (options.some((o) => !o)) {
        setError('All 4 question options must be filled.');
        return;
      }
      const payload = {
        question: newQuestion.question,
        options,
        correct_answer: parseInt(newQuestion.correct_answer, 10),
        explanation: newQuestion.explanation,
        category: newQuestion.category,
        difficulty: newQuestion.difficulty,
      };
      await createAdminQuizQuestion(payload);
      setActionSuccess('Quiz question added to question bank successfully!');
      setShowQuizModal(false);
      setNewQuestion({
        category: 'Phishing',
        difficulty: 'Beginner',
        question: '',
        opt0: '',
        opt1: '',
        opt2: '',
        opt3: '',
        correct_answer: 0,
        explanation: '',
      });
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create quiz question.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] py-24 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin"></div>
          <p className="text-gray-400 text-sm">Loading Administrator Command Center...</p>
        </div>
      </div>
    );
  }

  const stats = analytics?.stats || {
    total_users: 0,
    total_scans: 0,
    total_reports: 0,
    pending_reports: 0,
    verified_reports: 0,
    total_alerts: 0,
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-800">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <ShieldAlert className="w-7 h-7" />
              </span>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-200 to-cyan-300 bg-clip-text text-transparent">
                  Administrator Control Center
                </h1>
                <p className="text-xs text-gray-400 mt-0.5">
                  Real-time threat monitoring, moderation, and platform intelligence
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Threat Ops
            </span>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gray-800/80 hover:bg-gray-800 border border-gray-700 text-sm text-gray-300 hover:text-white transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Global Notifications */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-white font-bold ml-4">✕</button>
          </div>
        )}
        {actionSuccess && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-4 rounded-2xl bg-[#0f172a]/70 border border-gray-800/80 backdrop-blur-md">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-medium">Registered Users</span>
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-white">{stats.total_users}</div>
            <div className="text-[11px] text-gray-500 mt-1">Platform members</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0f172a]/70 border border-gray-800/80 backdrop-blur-md">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-medium">Total AI Scans</span>
              <FileSearch className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white">{stats.total_scans}</div>
            <div className="text-[11px] text-gray-500 mt-1">Messages, URLs, Media</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0f172a]/70 border border-gray-800/80 backdrop-blur-md">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-medium">Community Reports</span>
              <Radio className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white">{stats.total_reports}</div>
            <div className="text-[11px] text-gray-500 mt-1">Crowdsourced flags</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0f172a]/70 border border-amber-500/20 bg-amber-500/5 backdrop-blur-md">
            <div className="flex items-center justify-between text-amber-300 mb-2">
              <span className="text-xs font-medium">Pending Review</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-300">{stats.pending_reports}</div>
            <div className="text-[11px] text-amber-500/80 mt-1">Action needed</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0f172a]/70 border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-md">
            <div className="flex items-center justify-between text-emerald-300 mb-2">
              <span className="text-xs font-medium">Verified Threats</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-300">{stats.verified_reports}</div>
            <div className="text-[11px] text-emerald-500/80 mt-1">Confirmed scams</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0f172a]/70 border border-gray-800/80 backdrop-blur-md">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-medium">Active Advisories</span>
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-bold text-white">{stats.total_alerts}</div>
            <div className="text-[11px] text-gray-500 mt-1">Published alerts</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-800 pb-2">
          {[
            { id: 'analytics', label: 'Overview & Visualizations', icon: BarChart3 },
            { id: 'reports', label: `Scam Reports (${stats.pending_reports} pending)`, icon: AlertTriangle },
            { id: 'users', label: 'User Management', icon: Users },
            { id: 'alerts', label: 'Advisories & Alerts', icon: Radio },
            { id: 'quiz', label: 'Quiz Question Bank', icon: HelpCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
                  active
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Analytics & Visualizations */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Scan Types Distribution */}
              <div className="p-6 rounded-2xl bg-[#0f172a]/60 border border-gray-800 backdrop-blur-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                    Threat Scans by Vector
                  </h3>
                  <span className="text-xs text-gray-400">Total: {stats.total_scans}</span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics?.scan_types_distribution || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                      <YAxis stroke="#9ca3af" fontSize={12} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#374151', borderRadius: '8px' }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {(analytics?.scan_types_distribution || []).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Risk Level Breakdown */}
              <div className="p-6 rounded-2xl bg-[#0f172a]/60 border border-gray-800 backdrop-blur-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Threat Severity Distribution
                  </h3>
                  <span className="text-xs text-gray-400">Risk Severity</span>
                </div>
                <div className="h-64 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics?.risk_level_distribution || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {(analytics?.risk_level_distribution || []).map((entry) => (
                          <Cell
                            key={`risk-${entry.name}`}
                            fill={RISK_COLORS[entry.name] || '#3b82f6'}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#374151', borderRadius: '8px' }}
                      />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Weekly Activity Timeline */}
            <div className="p-6 rounded-2xl bg-[#0f172a]/60 border border-gray-800 backdrop-blur-md">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    Operational Activity (Past 7 Days)
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">Scans performed vs. community reports submitted</p>
                </div>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics?.activity_timeline || []}>
                    <defs>
                      <linearGradient id="scansGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05} />
                      </linearGradient>
                      <linearGradient id="reportsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#374151', borderRadius: '8px' }}
                    />
                    <Legend verticalAlign="top" height={36} />
                    <Area
                      type="monotone"
                      dataKey="scans"
                      name="AI Scans Run"
                      stroke="#06b6d4"
                      fillOpacity={1}
                      fill="url(#scansGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="reports"
                      name="Community Flags"
                      stroke="#a855f7"
                      fillOpacity={1}
                      fill="url(#reportsGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Community Scam Reports Moderation */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-400">Filter by status:</span>
                {['all', 'Submitted', 'Under Review', 'Verified', 'Dismissed'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setReportFilter(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition ${
                      reportFilter === st
                        ? 'bg-cyan-500 text-black font-semibold'
                        : 'bg-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    {st === 'all' ? 'All Reports' : st}
                  </button>
                ))}
              </div>
              <span className="text-xs text-gray-400">{reportsList.length} incident reports found</span>
            </div>

            {reportsLoading ? (
              <div className="py-12 text-center text-gray-400 text-sm">Loading community reports...</div>
            ) : reportsList.length === 0 ? (
              <div className="py-16 text-center rounded-2xl bg-[#0f172a]/40 border border-gray-800 text-gray-400">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-70" />
                <p className="text-base font-medium text-white">No reports match filter</p>
                <p className="text-xs text-gray-500 mt-1">All reports in this category have been processed.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-gray-800 bg-[#0f172a]/60">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="bg-gray-900/80 text-xs uppercase text-gray-400 border-b border-gray-800">
                    <tr>
                      <th className="py-3.5 px-4">Ref ID</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Reporter</th>
                      <th className="py-3.5 px-4">Suspect Artifacts</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    {reportsList.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-800/30 transition">
                        <td className="py-3.5 px-4 font-mono text-cyan-400 text-xs font-semibold">
                          {r.reference_id}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-white">{r.category}</td>
                        <td className="py-3.5 px-4 text-xs text-gray-400">{r.reporter_email}</td>
                        <td className="py-3.5 px-4 text-xs space-y-0.5">
                          {r.suspicious_url && (
                            <div className="truncate max-w-[200px] text-blue-400">🔗 {r.suspicious_url}</div>
                          )}
                          {r.phone_number && (
                            <div className="text-emerald-400">📞 {r.phone_number}</div>
                          )}
                          {!r.suspicious_url && !r.phone_number && (
                            <div className="text-gray-500 italic">Text submission</div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              r.status === 'Verified'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : r.status === 'Under Review'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : r.status === 'Dismissed'
                                ? 'bg-gray-700/30 text-gray-400 border border-gray-700/40'
                                : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-gray-400">
                          {new Date(r.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedReport(r);
                              setModStatus(r.status === 'Submitted' ? 'Verified' : r.status);
                              setModNotes(r.moderation_notes || '');
                            }}
                            className="px-3 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-medium cursor-pointer transition"
                          >
                            Moderate
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Moderation Modal */}
            {selectedReport && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div className="bg-[#0f172a] border border-gray-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                        Moderate Scam Incident
                      </h3>
                      <p className="text-xs text-cyan-400 font-mono mt-0.5">{selectedReport.reference_id}</p>
                    </div>
                    <button
                      onClick={() => setSelectedReport(null)}
                      className="text-gray-400 hover:text-white font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-xs text-gray-400">Category:</span>
                      <p className="font-semibold text-white">{selectedReport.category}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400">Reporter Description:</span>
                      <p className="text-gray-300 text-xs bg-gray-900/60 p-3 rounded-xl border border-gray-800">
                        {selectedReport.description}
                      </p>
                    </div>

                    {selectedReport.has_attachment && (
                      <div>
                        <span className="text-xs text-gray-400">Evidence Screenshot:</span>
                        <div className="mt-1">
                          <button
                            type="button"
                            onClick={() => handleViewReportAttachment(selectedReport.id)}
                            disabled={attachmentLoading}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-medium transition cursor-pointer disabled:opacity-50"
                          >
                            <Paperclip className="w-3.5 h-3.5" />
                            {attachmentLoading ? 'Loading…' : 'View Screenshot'}
                          </button>
                        </div>
                      </div>
                    )}

                    <form onSubmit={handleModerateSubmit} className="space-y-4 pt-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">
                          Set Moderation Status:
                        </label>
                        <select
                          value={modStatus}
                          onChange={(e) => setModStatus(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-cyan-400"
                        >
                          <option value="Under Review">Under Review</option>
                          <option value="Verified">Verified (Confirmed Threat)</option>
                          <option value="Dismissed">Dismissed (False Alarm)</option>
                          <option value="Submitted">Submitted</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">
                          Moderation Notes (Internal & Audited):
                        </label>
                        <textarea
                          rows={3}
                          value={modNotes}
                          onChange={(e) => setModNotes(e.target.value)}
                          placeholder="e.g., Domain verified in phishing database; UPI ID reported to NPCI."
                          className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setSelectedReport(null)}
                          className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-sm text-gray-300 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={modSubmitting}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-semibold text-sm cursor-pointer disabled:opacity-50"
                        >
                          {modSubmitting ? 'Saving...' : 'Update Status'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: User Management */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search user by email or name..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-900/80 border border-gray-800 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
              <button
                onClick={loadUsers}
                className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-sm text-gray-200 cursor-pointer"
              >
                Search
              </button>
            </div>

            {usersLoading ? (
              <div className="py-12 text-center text-gray-400 text-sm">Loading users...</div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-gray-800 bg-[#0f172a]/60">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="bg-gray-900/80 text-xs uppercase text-gray-400 border-b border-gray-800">
                    <tr>
                      <th className="py-3.5 px-4">User</th>
                      <th className="py-3.5 px-4">Role</th>
                      <th className="py-3.5 px-4">Scans Run</th>
                      <th className="py-3.5 px-4">Reports Filed</th>
                      <th className="py-3.5 px-4">Joined</th>
                      <th className="py-3.5 px-4 text-right">Role Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    {usersList.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-800/30 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-white">{u.full_name || 'No Name'}</div>
                          <div className="text-xs text-gray-400 font-mono">{u.email}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          {u.is_admin ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              <ShieldAlert className="w-3 h-3" /> Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-800 text-gray-400 border border-gray-700">
                              User
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-cyan-400">{u.scan_count}</td>
                        <td className="py-3.5 px-4 font-mono text-purple-400">{u.report_count}</td>
                        <td className="py-3.5 px-4 text-xs text-gray-400">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleToggleAdmin(u.id, u.is_admin)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition ${
                              u.is_admin
                                ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {u.is_admin ? 'Revoke Admin' : 'Promote to Admin'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Advisories & Scam Alerts */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Radio className="w-5 h-5 text-rose-400" />
                  Official Scam Alerts & Advisories
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Publish high-priority warnings from CERT-In, RBI, or verified community investigations
                </p>
              </div>
              <button
                onClick={() => setShowAlertModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-semibold text-xs cursor-pointer shadow-lg shadow-cyan-500/20"
              >
                <Plus className="w-4 h-4" />
                Publish Advisory
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-[#0f172a]/60 border border-gray-800">
              <p className="text-sm text-gray-300">
                Total advisories active in the TrustShield knowledgebase: <span className="text-cyan-400 font-bold">{stats.total_alerts}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Advisories appear instantly in the Scam Alerts Center, Browser Extension, and the AI Safety Assistant context.
              </p>
            </div>

            {/* Modal for Creating Alert */}
            {showAlertModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
                <div className="bg-[#0f172a] border border-gray-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl my-8">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Radio className="w-5 h-5 text-rose-400" />
                      Publish Cybersecurity Advisory
                    </h3>
                    <button onClick={() => setShowAlertModal(false)} className="text-gray-400 hover:text-white font-bold">
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleCreateAlert} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 mb-1">Advisory Title *</label>
                        <input
                          type="text"
                          required
                          value={newAlert.title}
                          onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
                          placeholder="e.g. Digital Arrest Skype Impersonation Scam"
                          className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-1">Threat Category</label>
                        <select
                          value={newAlert.category}
                          onChange={(e) => setNewAlert({ ...newAlert, category: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm"
                        >
                          <option value="Digital Arrest">Digital Arrest</option>
                          <option value="Fake APK Malware">Fake APK Malware</option>
                          <option value="Electricity Bill Scam">Electricity Bill Scam</option>
                          <option value="Telegram Task Scam">Telegram Task Scam</option>
                          <option value="UPI QR Code Scam">UPI QR Code Scam</option>
                          <option value="Phishing">Phishing</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-gray-300 mb-1">Risk Level</label>
                        <select
                          value={newAlert.risk_level}
                          onChange={(e) => setNewAlert({ ...newAlert, risk_level: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm"
                        >
                          <option value="High">High (Immediate Danger)</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-1">Source Name</label>
                        <input
                          type="text"
                          value={newAlert.source_name}
                          onChange={(e) => setNewAlert({ ...newAlert, source_name: e.target.value })}
                          placeholder="e.g. CERT-In / RBI"
                          className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-1">Official Reference URL</label>
                        <input
                          type="url"
                          value={newAlert.source_url}
                          onChange={(e) => setNewAlert({ ...newAlert, source_url: e.target.value })}
                          placeholder="https://..."
                          className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-1">Short Description *</label>
                      <textarea
                        rows={2}
                        required
                        value={newAlert.description}
                        onChange={(e) => setNewAlert({ ...newAlert, description: e.target.value })}
                        placeholder="Brief summary of the circulating scam pattern..."
                        className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-1">How It Works (Modus Operandi) *</label>
                      <textarea
                        rows={3}
                        required
                        value={newAlert.how_it_works}
                        onChange={(e) => setNewAlert({ ...newAlert, how_it_works: e.target.value })}
                        placeholder="Step-by-step description of how fraudsters trap victims..."
                        className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 text-white text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 mb-1">Warning Signs (1 per line)</label>
                        <textarea
                          rows={3}
                          value={newAlert.warning_signs}
                          onChange={(e) => setNewAlert({ ...newAlert, warning_signs: e.target.value })}
                          placeholder="Callers demanding video call&#10;Threats of arrest warrants&#10;Demands for bank transfer to 'RBI safety account'"
                          className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-1">Prevention Tips (1 per line)</label>
                        <textarea
                          rows={3}
                          value={newAlert.prevention_tips}
                          onChange={(e) => setNewAlert({ ...newAlert, prevention_tips: e.target.value })}
                          placeholder="No law agency arrests people on Skype&#10;Disconnect immediately&#10;Report to 1930 / cybercrime.gov.in"
                          className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 text-white text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
                      <button
                        type="button"
                        onClick={() => setShowAlertModal(false)}
                        className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 text-sm cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-semibold text-sm cursor-pointer"
                      >
                        Publish Alert
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Quiz Question Bank */}
        {activeTab === 'quiz' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-cyan-400" />
                  Scam Awareness Question Bank
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Curate real scam awareness questions across Phishing, UPI, Job Offers, and Social Engineering
                </p>
              </div>
              <button
                onClick={() => setShowQuizModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-semibold text-xs cursor-pointer shadow-lg shadow-cyan-500/20"
              >
                <Plus className="w-4 h-4" />
                Add Question
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-[#0f172a]/60 border border-gray-800">
              <p className="text-sm text-gray-300">
                Questions are automatically validated strictly on the backend to prevent inspection leakage.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Add realistic scenarios based on recent digital frauds to keep user awareness sharp.
              </p>
            </div>

            {/* Modal for Creating Quiz Question */}
            {showQuizModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
                <div className="bg-[#0f172a] border border-gray-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl my-8">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-cyan-400" />
                      Add Question to Quiz Bank
                    </h3>
                    <button onClick={() => setShowQuizModal(false)} className="text-gray-400 hover:text-white font-bold">
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleCreateQuestion} className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 mb-1">Category</label>
                        <select
                          value={newQuestion.category}
                          onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm"
                        >
                          <option value="Phishing">Phishing</option>
                          <option value="UPI Payment Scams">UPI Payment Scams</option>
                          <option value="Fake Job Offers">Fake Job Offers</option>
                          <option value="OTP Fraud">OTP Fraud</option>
                          <option value="Fake Websites">Fake Websites</option>
                          <option value="Investment Scams">Investment Scams</option>
                          <option value="Social Engineering">Social Engineering</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-1">Difficulty</label>
                        <select
                          value={newQuestion.difficulty}
                          onChange={(e) => setNewQuestion({ ...newQuestion, difficulty: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm"
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-1">Question Scenario *</label>
                      <textarea
                        rows={2}
                        required
                        value={newQuestion.question}
                        onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                        placeholder="e.g., You receive an SMS claiming your electricity will be disconnected tonight at 9:30 PM..."
                        className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 text-white text-xs"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-gray-300">Answer Options (4 choices):</label>
                      {[0, 1, 2, 3].map((idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="correct_choice"
                            checked={newQuestion.correct_answer === idx}
                            onChange={() => setNewQuestion({ ...newQuestion, correct_answer: idx })}
                            className="text-cyan-400 focus:ring-cyan-400"
                          />
                          <input
                            type="text"
                            required
                            placeholder={`Option ${idx + 1}`}
                            value={newQuestion[`opt${idx}`]}
                            onChange={(e) => setNewQuestion({ ...newQuestion, [`opt${idx}`]: e.target.value })}
                            className="flex-1 px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-xs"
                          />
                          {newQuestion.correct_answer === idx && (
                            <span className="text-[10px] text-emerald-400 font-semibold uppercase px-2 py-0.5 rounded bg-emerald-500/10">
                              Correct
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-1">Security Explanation *</label>
                      <textarea
                        rows={2}
                        required
                        value={newQuestion.explanation}
                        onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                        placeholder="Explain why the answer is correct and what digital safety principle applies..."
                        className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 text-white text-xs"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
                      <button
                        type="button"
                        onClick={() => setShowQuizModal(false)}
                        className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 text-sm cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-semibold text-sm cursor-pointer"
                      >
                        Save Question
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

