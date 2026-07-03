'use client';

import { useState, useEffect } from 'react';
import { Bell, Zap, Shield, AlertTriangle, Info, ArrowLeft, Trash2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/Layout/Sidebar';
import Navbar from '@/components/Layout/Navbar';

export default function NotificationsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'AI', title: 'Spending Anomaly Detected', message: 'Your dining expenses are 20% higher than your 3-month average. Consider adjusting your discretionary budget.', date: '2 hours ago', icon: Zap, color: 'text-primary' },
    { id: 2, type: 'GOAL', title: 'Goal Milestone Reached', message: 'Congratulations! You have reached 85% of your "New Car" savings goal. Only ₹75,000 to go!', date: '5 hours ago', icon: Shield, color: 'text-success' },
    { id: 3, type: 'SECURITY', title: 'New Login Detected', message: 'A new login was recorded from a Chrome browser on Windows. If this wasn\'t you, reset your password immediately.', date: '1 day ago', icon: AlertTriangle, color: 'text-error' },
    { id: 4, type: 'INFO', title: 'System Update', message: 'Finco Neural Engine v2.4 is now live. Enjoy 15% faster face verification and improved spending predictions.', date: '2 days ago', icon: Info, color: 'text-secondary' },
  ]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setTimeout(() => {
        setUser(parsedUser);
      }, 0);
    }
  }, []);

  const clearAll = () => setNotifications([]);
  const deleteNotif = (id) => setNotifications(notifications.filter(n => n.id !== id));

  if (!user) return null;

  return (
    <div className="min-h-screen bg-app-bg flex transition-colors duration-500">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 ml-0 lg:ml-64 min-h-screen flex flex-col">
        <Navbar user={user} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="text-3xl font-black text-text-main">Intelligence Center</h1>
                <p className="text-text-muted font-medium">Categorized alerts and behavioral insights from your financial grid.</p>
              </div>
              <div className="flex gap-4">
                <button onClick={clearAll} className="btn-secondary py-2 px-4 text-xs font-bold">
                  <CheckCircle className="w-4 h-4" />
                  Mark All Read
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {notifications.map((n, i) => (
                  <motion.div 
                    key={n.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-panel p-6 flex items-start gap-6 group hover:border-white/10 transition-all"
                  >
                    <div className={`p-4 rounded-2xl bg-app-bg/10 ${n.color} group-hover:scale-110 transition-transform`}>
                      <n.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-bold text-text-main">{n.title}</h3>
                        <span className="text-[10px] font-black uppercase text-text-dim tracking-widest">{n.date}</span>
                      </div>
                      <p className="text-text-muted text-sm leading-relaxed max-w-2xl">{n.message}</p>
                      <div className="pt-3 flex gap-4">
                        <button className="text-[10px] font-black uppercase text-primary hover:underline">View Details</button>
                        <button onClick={() => deleteNotif(n.id)} className="text-[10px] font-black uppercase text-text-dim hover:text-error transition-colors flex items-center gap-1">
                          <Trash2 className="w-3 h-3" />
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {notifications.length === 0 && (
                <div className="py-20 text-center space-y-6">
                  <div className="w-20 h-20 bg-app-bg/10 rounded-full flex items-center justify-center mx-auto text-text-dim">
                    <Bell className="w-10 h-10" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold text-text-main">All Clear</h2>
                    <p className="text-text-muted text-sm">No new intelligence alerts at this time.</p>
                  </div>
                  <button onClick={() => window.history.back()} className="btn-secondary mx-auto">
                    <ArrowLeft className="w-4 h-4" />
                    Go Back
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
