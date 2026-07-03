'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, Settings, Globe, Moon, Bell } from 'lucide-react';
import Sidebar from '@/components/Layout/Sidebar';
import Navbar from '@/components/Layout/Navbar';

import { useLanguage } from '@/context/LanguageContext';

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [scanAutoExpenseEnabled, setScanAutoExpenseEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) { window.location.href = '/login'; return; }
        const res = await fetch('/api/auth/profile', { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) {
           setUser(data.user);
           setScanAutoExpenseEnabled(data.user.scan_auto_expense_enabled);
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchProfile();
  }, []);

  const handleToggle = async (type) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const endpoint = '/api/auth/profile/toggle-scan';
      const currentState = scanAutoExpenseEnabled;
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ enabled: !currentState })
      });
      const data = await res.json();
      if (data.success) {
        setScanAutoExpenseEnabled(data.enabled);
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-app-bg flex transition-colors duration-500">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 ml-0 lg:ml-64 min-h-screen flex flex-col">
        <Navbar user={user} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-10">
            <div>
              <h1 className="text-3xl font-black text-text-main">{t('settings.title')}</h1>
              <p className="text-text-muted">{t('settings.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {/* Profile Overview */}
              <div className="glass-panel p-8 flex items-center gap-6">
                <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center text-white text-3xl font-black">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-text-main">{user.name}</h2>
                  <p className="text-text-muted text-sm">{user.email}</p>
                </div>
                <Link href="/profile" className="ml-auto btn-secondary py-2 px-4 text-xs font-bold">{t('settings.manage_profile')}</Link>
              </div>

              {/* Security & AI Section */}
              <div className="glass-panel overflow-hidden">
                <div className="p-6 bg-app-bg/10 border-b border-app-border flex items-center gap-3">
                  <Shield className="text-primary w-5 h-5" />
                  <h3 className="font-bold text-text-main">{t('settings.ai_privacy')}</h3>
                </div>
                <div className="divide-y divide-app-border">

                  <div className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                    <div>
                      <p className="font-bold text-text-main">{t('settings.auto_scan')}</p>
                      <p className="text-xs text-text-muted">{t('settings.auto_scan_desc')}</p>
                    </div>
                    <button onClick={() => handleToggle('scan')} className={`relative w-12 h-6 rounded-full transition-colors ${scanAutoExpenseEnabled ? 'bg-secondary' : 'bg-app-border'}`}>
                      <motion.div animate={{ x: scanAutoExpenseEnabled ? 26 : 2 }} className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg" />
                    </button>
                  </div>

                </div>
              </div>

              {/* Preferences Section */}
              <div className="glass-panel overflow-hidden">
                <div className="p-6 bg-app-bg/10 border-b border-app-border flex items-center gap-3">
                  <Settings className="text-secondary w-5 h-5" />
                  <h3 className="font-bold text-text-main">{t('settings.app_prefs')}</h3>
                </div>
                <div className="divide-y divide-app-border">
                  <div className="p-6 flex items-center justify-between opacity-50 cursor-not-allowed">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-slate-800 rounded-lg"><Globe className="w-4 h-4" /></div>
                      <p className="text-sm font-bold">{t('settings.lang_selection')}</p>
                    </div>
                    <span className="text-xs font-black uppercase text-slate-600">{t('settings.configured_globally')}</span>
                  </div>
                  <div className="p-6 flex items-center justify-between opacity-50 cursor-not-allowed">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-slate-800 rounded-lg"><Bell className="w-4 h-4" /></div>
                      <p className="text-sm font-bold">{t('settings.smart_notifications')}</p>
                    </div>
                    <span className="text-xs font-black uppercase text-slate-600">{t('settings.always_on')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
