'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, Lock, ArrowLeft, ChevronRight, Settings, CheckCircle2, Save, X, AlertTriangle } from 'lucide-react';
import Sidebar from '@/components/Layout/Sidebar';
import Navbar from '@/components/Layout/Navbar';

import { useLanguage } from '@/context/LanguageContext';

const getRoleKey = (roleName) => {
  if (!roleName) return 'other';
  const r = roleName.toLowerCase();
  if (r.includes('employee')) return 'employee';
  if (r.includes('student')) return 'student';
  if (r.includes('freelancer')) return 'freelancer';
  if (r.includes('homemaker')) return 'homemaker';
  return 'other';
};

export default function ProfilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [scanAutoExpenseEnabled, setScanAutoExpenseEnabled] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) { window.location.href = '/login'; return; }

      const res = await fetch('/api/auth/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
         setUser(data.user);
         setScanAutoExpenseEnabled(data.user.scan_auto_expense_enabled);
         setEditForm({ name: data.user.name, email: data.user.email });
         localStorage.setItem('user', JSON.stringify(data.user));
      } else {
         setErrorMsg(data.error || t('profile.load_fail'));
      }
    } catch (err) {
      setErrorMsg(t('profile.network_error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleUpdateIdentity = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setShowEditModal(false);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        setErrorMsg(data.error);
      }
    } catch (err) {
      setErrorMsg('Update failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = () => {
    alert("Account successfully deactivated. All local session data has been cleared.");
    localStorage.clear();
    window.location.href = '/';
  };

  const handleScanToggle = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const token = localStorage.getItem('token');
      const nextState = !scanAutoExpenseEnabled;

      const res = await fetch('/api/auth/profile/toggle-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ enabled: nextState })
      });
      const data = await res.json();
      if (data.success) {
        setScanAutoExpenseEnabled(data.enabled);
        const updatedUser = { ...user, scan_auto_expense_enabled: data.enabled };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  if (!user) return <div className="min-h-screen bg-app-bg flex items-center justify-center"><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full" /></div>;

  return (
    <div className="min-h-screen bg-app-bg flex transition-colors duration-500">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 ml-0 lg:ml-64 min-h-screen flex flex-col">
        <Navbar user={user} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-10 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black text-text-main">{t('profile.title')}</h1>
                <p className="text-text-muted">{t('profile.subtitle')}</p>
              </div>
              <Link href="/dashboard" className="nav-item px-4 border border-app-border bg-app-card/50 shadow-sm">
                <ArrowLeft className="w-4 h-4 text-primary" />
                <span className="font-bold">{t('profile.back_dash')}</span>
              </Link>
            </div>

            <div className="glass-panel p-8 flex flex-col md:flex-row items-center gap-8 group">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-primary/20 group-hover:scale-105 transition-transform">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 text-center md:text-left space-y-2">
                <h2 className="text-2xl font-black text-text-main">{user.name}</h2>
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <div className="flex items-center gap-2 text-text-muted text-sm font-medium"><User className="w-4 h-4 text-primary" />{t(`roles.${getRoleKey(user.role)}`)}</div>
                  <div className="flex items-center gap-2 text-text-muted text-sm font-medium"><CheckCircle2 className="w-4 h-4 text-success" />{t('profile.verified')}</div>
                </div>
              </div>
              <button onClick={() => setShowEditModal(true)} className="btn-primary px-8 py-3">{t('profile.edit_identity')}</button>
            </div>

            <div className="grid grid-cols-1 gap-8">
              <div className="glass-panel overflow-hidden">
                <div className="p-6 border-b border-app-border bg-app-bg/10 flex items-center gap-3">
                  <Lock className="text-secondary w-5 h-5" />
                  <h3 className="font-bold text-text-main">{t('profile.neural_engine')}</h3>
                </div>
                <div className="divide-y divide-app-border">

                  <div className="p-8 flex items-center justify-between group hover:bg-primary/[0.02] transition-colors">
                    <div className="space-y-1">
                      <p className="font-bold text-text-main">{t('profile.smart_ocr')}</p>
                      <p className="text-sm text-text-muted">{t('profile.smart_ocr_desc')}</p>
                    </div>
                    <button onClick={handleScanToggle} className={`relative w-14 h-8 rounded-full transition-colors ${scanAutoExpenseEnabled ? 'bg-secondary' : 'bg-app-border'}`}>
                      <motion.div animate={{ x: scanAutoExpenseEnabled ? 28 : 4 }} className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg" />
                    </button>
                  </div>

                </div>
              </div>

              <div className="glass-panel border-error/20 overflow-hidden">
                <div className="p-8 flex items-center justify-between bg-error/5">
                  <div className="space-y-1">
                    <p className="font-bold text-error">{t('profile.acc_mgmt')}</p>
                    <p className="text-sm text-text-dim font-medium">{t('profile.acc_mgmt_desc')}</p>
                  </div>
                  <button onClick={() => setShowDeactivateModal(true)} className="px-6 py-3 border border-error/50 text-error hover:bg-error hover:text-white rounded-xl font-bold transition-all">{t('profile.deactivate')}</button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Edit Identity Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-app-bg/60 backdrop-blur-md z-[100] flex items-center justify-center p-8 transition-all">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="glass-panel p-10 max-w-md w-full space-y-8 border-app-border shadow-2xl transition-all">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-text-main">{t('profile.update_identity')}</h2>
                <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-primary/5 rounded-full text-text-muted hover:text-primary transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleUpdateIdentity} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-text-muted tracking-widest ml-1">{t('profile.full_name')}</label>
                  <input type="text" className="input-premium" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-text-muted tracking-widest ml-1">{t('profile.email')}</label>
                  <input type="email" className="input-premium" value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} required />
                </div>
                <button type="submit" className="btn-primary w-full py-4" disabled={loading}>
                  <Save className="w-5 h-5" />
                  {loading ? t('profile.updating') : t('profile.save_changes')}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deactivate Modal */}
      <AnimatePresence>
        {showDeactivateModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-app-bg/60 backdrop-blur-md z-[100] flex items-center justify-center p-8 transition-all">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="glass-panel p-10 max-w-md w-full space-y-6 border-error/20 shadow-2xl transition-all">
              <div className="w-16 h-16 bg-error/10 rounded-2xl flex items-center justify-center text-error mx-auto">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-text-main">{t('profile.critical_action')}</h2>
                <p className="text-text-muted text-sm font-medium">{t('profile.deactivate_confirm')}</p>
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowDeactivateModal(false)} className="btn-secondary flex-1 bg-app-bg border-app-border text-text-main hover:bg-app-bg/80 transition-colors">{t('profile.cancel')}</button>
                <button onClick={handleDeactivate} className="btn-primary bg-error hover:bg-error/80 border-none flex-1 text-white">{t('profile.yes_deactivate')}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
