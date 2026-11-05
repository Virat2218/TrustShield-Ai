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
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {t.nav.profile}
        </h1>
        <p className="text-sm text-slate-500">
          Manage your account credentials and personal digital safety settings.
        </p>
      </div>

      <AnimatePresence>
        {statusMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center space-x-2 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800"
          >
            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{statusMsg}</span>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center space-x-2 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800"
          >
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Account Info Card */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100 text-center sm:text-left">
          <div className="w-20 h-20 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shadow-sm">
            <User className="w-9 h-9" />
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-bold text-slate-900">
                {user?.full_name || 'Protected User'}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-teal-50 border border-teal-200 text-teal-700 font-semibold">
                Verified
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{user?.email}</span>
            </p>
            <p className="text-[11px] text-slate-400 flex items-center justify-center sm:justify-start gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                Joined on {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active Member'}
              </span>
            </p>
          </div>

          <button
            onClick={logout}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-semibold text-rose-700 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t.nav.logout}</span>
          </button>
        </div>

        {/* Edit Full Name */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Profile Information
            </span>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center space-x-1 text-xs text-teal-700 hover:text-teal-800 font-medium"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Full Name</label>
              {editing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-teal-600 font-sans"
                  />
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="p-2 rounded-xl bg-[#0d766e] hover:bg-[#0f766e] text-white"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <p className="text-xs font-medium text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {user?.full_name || 'Not provided'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1">Email (Primary ID)</label>
              <p className="text-xs font-medium text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-200">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Scans Lifetime Summary */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
            Security Activity Lifetime Stats
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-xl font-extrabold text-slate-900">{stats.total_scans}</span>
              <span className="text-[10px] text-slate-500 block uppercase mt-0.5">Total Scans</span>
            </div>
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-center">
              <span className="text-xl font-extrabold text-rose-700">{stats.high_risk}</span>
              <span className="text-[10px] text-rose-700 block uppercase mt-0.5">High Threats</span>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-center">
              <span className="text-xl font-extrabold text-amber-700">{stats.medium_risk}</span>
              <span className="text-[10px] text-amber-700 block uppercase mt-0.5">Medium Risk</span>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <span className="text-xl font-extrabold text-emerald-700">{stats.low_risk}</span>
              <span className="text-[10px] text-emerald-700 block uppercase mt-0.5">Safe Scans</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

