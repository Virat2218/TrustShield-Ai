import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Calendar, Shield, LogOut, Check, AlertCircle, Edit2, Save } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { updateProfile, getScanStats } from '../services/api';

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const { t } = useLanguage();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [editing, setEditing] = useState(false);
  const [stats, setStats] = useState({ total_scans: 0, high_risk: 0, medium_risk: 0, low_risk: 0 });
  const [statusMsg, setStatusMsg] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getScanStats();
        setStats(data);
      } catch (err) {
        console.error(err);
      }
    }
    loadStats();
  }, []);

  const handleSave = async () => {
    if (!fullName.trim()) return;
    setSaving(true);
    setError('');
    setStatusMsg('');

    try {
      const updated = await updateProfile({ full_name: fullName.trim() });
      updateUser(updated);
      setEditing(false);
      setStatusMsg('Profile successfully updated.');
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-8">
      {/* Page Title */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          {t.nav.profile}
        </h1>
        <p className="text-sm text-slate-400">
          Manage your account credentials and personal digital safety settings.
        </p>
      </div>

      <AnimatePresence>
        {statusMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center space-x-2 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300"
          >
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{statusMsg}</span>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center space-x-2 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300"
          >
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Account Info Card */}
      <div className="rounded-3xl bg-[#0d1635]/80 backdrop-blur-xl border border-white/10 p-6 md:p-8 shadow-2xl shadow-black/50 space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-white/10 text-center sm:text-left">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-[1px] shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-[#0a0e1a] rounded-2xl flex items-center justify-center">
              <User className="w-9 h-9 text-cyan-400" />
            </div>
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-bold text-white">
                {user?.full_name || 'Protected User'}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                Verified
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              <span>{user?.email}</span>
            </p>
            <p className="text-[11px] text-slate-500 flex items-center justify-center sm:justify-start gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                Joined on {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active Member'}
              </span>
            </p>
          </div>

          <button
            onClick={logout}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-semibold text-rose-300 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t.nav.logout}</span>
          </button>
        </div>

        {/* Edit Full Name */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Profile Information
            </span>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center space-x-1 text-xs text-cyan-400 hover:text-cyan-300"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Full Name</label>
              {editing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 font-sans"
                  />
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <p className="text-xs font-medium text-white bg-white/[0.02] p-3 rounded-xl border border-white/5">
                  {user?.full_name || 'Not provided'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Email (Primary ID)</label>
              <p className="text-xs font-medium text-white bg-white/[0.02] p-3 rounded-xl border border-white/5">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Scans Lifetime Summary */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Security Activity Lifetime Stats
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 text-center">
              <span className="text-xl font-extrabold text-white">{stats.total_scans}</span>
              <span className="text-[10px] text-slate-400 block uppercase mt-0.5">Total Scans</span>
            </div>
            <div className="p-3.5 rounded-xl bg-rose-500/[0.05] border border-rose-500/20 text-center">
              <span className="text-xl font-extrabold text-rose-400">{stats.high_risk}</span>
              <span className="text-[10px] text-rose-300 block uppercase mt-0.5">High Threats</span>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-500/[0.05] border border-amber-500/20 text-center">
              <span className="text-xl font-extrabold text-amber-400">{stats.medium_risk}</span>
              <span className="text-[10px] text-amber-300 block uppercase mt-0.5">Medium Risk</span>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-500/[0.05] border border-emerald-500/20 text-center">
              <span className="text-xl font-extrabold text-emerald-400">{stats.low_risk}</span>
              <span className="text-[10px] text-emerald-300 block uppercase mt-0.5">Safe Scans</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

