'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import Sidebar from '@/components/Layout/Sidebar';
import Navbar from '@/components/Layout/Navbar';
import { 
  MessageSquare, Star, Trash2, CheckCircle, Clock, 
  Filter, ArrowLeft, Shield, AlertTriangle, Search, ChevronRight 
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import axios from 'axios';
import Link from 'next/link';

export default function AdminHelpPage() {
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('tickets');
  const [tickets, setTickets] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [filter, setFilter] = useState({ status: '', category: '' });

  const fetchData = useCallback(async (type) => {
    setDataLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/admin/${type}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        if (type === 'support') setTickets(res.data.data);
        else setFeedbacks(res.data.data);
      }
    } catch (error) {
      toast.error(`Failed to fetch ${type}`);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!token || !storedUser) {
      window.location.href = '/login';
      return;
    }
    
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'Admin') {
      window.location.href = '/dashboard';
      return;
    }

    setUser(parsedUser);
    setLoading(false);
    fetchData('tickets');
  }, [fetchData]);

  useEffect(() => {
    if (user) {
      fetchData(activeTab === 'tickets' ? 'support' : 'feedback');
    }
  }, [activeTab, user, fetchData]);

  const handleStatusUpdate = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.patch(`/api/admin/support/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setTickets(tickets.map(t => t._id === id ? { ...t, status } : t));
        toast.success('Status updated');
      }
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const handleDelete = async (id, type) => {
    if (!confirm(t('admin.confirm_delete'))) return;

    try {
      const token = localStorage.getItem('token');
      const res = await axios.delete(`/api/admin/${type}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        if (type === 'support') setTickets(tickets.filter(t => t._id !== id));
        else setFeedbacks(feedbacks.filter(f => f._id !== id));
        toast.success('Deleted successfully');
      }
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg flex transition-colors duration-300">
      <Toaster position="top-right" />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 ml-0 lg:ml-64 min-h-screen flex flex-col">
        <Navbar user={user} onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Link href="/dashboard" className="text-primary hover:underline text-sm flex items-center gap-1">
                    <ArrowLeft className="w-3 h-3" />
                    Back
                  </Link>
                </div>
                <h1 className="text-3xl font-bold text-text-main flex items-center gap-3">
                  <Shield className="w-8 h-8 text-primary" />
                  {t('admin.title')}
                </h1>
                <p className="text-text-muted mt-1">Manage user support requests and feedback</p>
              </div>

              {/* Tabs */}
              <div className="flex p-1 bg-app-bg/50 border border-app-border rounded-xl">
                <button
                  onClick={() => setActiveTab('tickets')}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    activeTab === 'tickets' ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  {t('admin.support_tickets')}
                </button>
                <button
                  onClick={() => setActiveTab('feedback')}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    activeTab === 'feedback' ? 'bg-secondary text-white shadow-lg' : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  <Star className="w-4 h-4" />
                  {t('admin.user_feedback')}
                </button>
              </div>
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
              {activeTab === 'tickets' ? (
                <motion.div
                  key="tickets"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  {dataLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => <div key={i} className="h-32 glass-panel animate-pulse" />)}
                    </div>
                  ) : tickets.length === 0 ? (
                    <div className="glass-panel border-app-border p-20 flex flex-col items-center text-center">
                      <MessageSquare className="w-16 h-16 text-text-muted/20 mb-4" />
                      <h3 className="text-xl font-bold text-text-muted">{t('admin.no_tickets')}</h3>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {tickets.map((ticket) => (
                        <div key={ticket._id} className="glass-panel border-app-border p-6 hover:border-primary/30 transition-all group">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                  ticket.status === 'Open' ? 'bg-error/10 text-error' :
                                  ticket.status === 'In Progress' ? 'bg-amber-500/10 text-amber-500' :
                                  'bg-success/10 text-success'
                                }`}>
                                  {ticket.status}
                                </span>
                                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
                                  {new Date(ticket.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <h3 className="text-lg font-bold text-text-main mb-1">{ticket.subject}</h3>
                              <p className="text-sm text-text-muted mb-4 line-clamp-2 group-hover:line-clamp-none transition-all">{ticket.message}</p>
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                                    {ticket.name.charAt(0)}
                                  </div>
                                  <span className="text-xs font-medium text-text-main">{ticket.name}</span>
                                </div>
                                <span className="text-xs text-text-muted">{ticket.email}</span>
                              </div>
                            </div>
                            
                            <div className="flex flex-row md:flex-col gap-2">
                              {ticket.status !== 'Resolved' && (
                                <button
                                  onClick={() => handleStatusUpdate(ticket._id, 'Resolved')}
                                  className="p-2 rounded-lg bg-success/10 text-success hover:bg-success hover:text-white transition-all"
                                  title={t('admin.resolve')}
                                >
                                  <CheckCircle className="w-5 h-5" />
                                </button>
                              )}
                              {ticket.status === 'Open' && (
                                <button
                                  onClick={() => handleStatusUpdate(ticket._id, 'In Progress')}
                                  className="p-2 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-all"
                                  title="Mark In Progress"
                                >
                                  <Clock className="w-5 h-5" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(ticket._id, 'support')}
                                className="p-2 rounded-lg bg-error/10 text-error hover:bg-error hover:text-white transition-all"
                                title={t('admin.delete')}
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="feedback"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {dataLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => <div key={i} className="h-24 glass-panel animate-pulse" />)}
                    </div>
                  ) : feedbacks.length === 0 ? (
                    <div className="glass-panel border-app-border p-20 flex flex-col items-center text-center">
                      <Star className="w-16 h-16 text-text-muted/20 mb-4" />
                      <h3 className="text-xl font-bold text-text-muted">{t('admin.no_feedback')}</h3>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {feedbacks.map((feedback) => (
                        <div key={feedback._id} className="glass-panel border-app-border p-6 hover:border-secondary/30 transition-all">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="flex gap-1">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <Star key={s} className={`w-3 h-3 ${s <= feedback.rating ? 'fill-amber-400 text-amber-400' : 'text-text-muted/30'}`} />
                                  ))}
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  feedback.category === 'Bug Report' ? 'bg-error/10 text-error' :
                                  feedback.category === 'Feature Request' ? 'bg-secondary/10 text-secondary' :
                                  'bg-primary/10 text-primary'
                                }`}>
                                  {feedback.category}
                                </span>
                                <span className="text-[10px] text-text-muted font-bold">
                                  {new Date(feedback.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm text-text-main mb-4 italic">&ldquo;{feedback.message}&rdquo;</p>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-text-muted uppercase">User:</span>
                                <span className="text-xs font-medium text-text-main">{feedback.user?.name || 'Anonymous'}</span>
                                <span className="text-xs text-text-muted">({feedback.user?.email || 'N/A'})</span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDelete(feedback._id, 'feedback')}
                              className="p-2 rounded-lg bg-error/10 text-error hover:bg-error hover:text-white transition-all shrink-0"
                              title={t('admin.delete')}
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
