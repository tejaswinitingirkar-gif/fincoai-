'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, Calendar, Filter, Download, 
  BrainCircuit, LayoutDashboard, Search,
  ArrowUpCircle, ArrowDownCircle, Target
} from 'lucide-react';
import Sidebar from '@/components/Layout/Sidebar';
import Navbar from '@/components/Layout/Navbar';
import AIInsights from '@/components/AIInsights';
import HistoryPanel from '@/components/Predictions/HistoryPanel';
import MonthlyTimeline from '@/components/Predictions/MonthlyTimeline';
import { useLanguage } from '@/context/LanguageContext';

export default function PredictionPage() {
  const { t, language } = useLanguage();
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const currentDate = new Date();
  const defaultMonthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState(defaultMonthStr);
  
  const [filterCategory, setFilterCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/transactions', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        cache: 'no-store'
      });
      const data = await res.json();
      if (data.success) setTransactions(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t_item => {
      const tMonth = typeof t_item.date === 'string' ? t_item.date.substring(0, 7) : new Date(t_item.date).toISOString().substring(0, 7);
      const matchesMonth = tMonth === selectedMonth;
      const matchesCategory = filterCategory === 'All' || t_item.category === filterCategory;
      const matchesSearch = t_item.description?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           t_item.category?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesMonth && matchesCategory && matchesSearch;
    });
  }, [transactions, selectedMonth, filterCategory, searchQuery]);

  const categories = useMemo(() => {
    const cats = new Set(transactions.map(t_item => t_item.category));
    return ['All', ...Array.from(cats)];
  }, [transactions]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center transition-colors duration-500">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full"
        />
      </div>
    );
  }

  const [year, month] = selectedMonth.split('-');
  const monthName = new Date(year, month - 1).toLocaleString(language === 'hi' ? 'hi-IN' : language === 'te' ? 'te-IN' : 'en-US', { month: 'long' });

  return (
    <div className="min-h-screen bg-dark-bg flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 ml-0 lg:ml-64 min-h-screen flex flex-col">
        <Navbar user={user} onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-xl text-primary">
                    <BrainCircuit className="w-6 h-6" />
                  </div>
                  <h1 className="text-3xl font-black text-text-main tracking-tight">{t('prediction.title')}</h1>
                </div>
                <p className="text-text-muted">
                  {t('prediction.subtitle').replace('{month}', monthName).replace('{year}', year)}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-app-bg/50 border border-app-border rounded-2xl">
                  <Calendar className="w-4 h-4 text-primary" />
                  <input 
                    type="month" 
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-transparent border-none text-sm font-bold text-text-main focus:ring-0 cursor-pointer transition-colors"
                  />
                </div>
                <button className="btn-secondary py-2 px-4 text-xs font-black uppercase tracking-widest bg-app-bg/10 border-app-border">
                  <Download className="w-4 h-4" />
                  {t('prediction.export')}
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="glass-panel p-4 flex flex-col md:flex-row items-center gap-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  placeholder={t('prediction.search_placeholder')} 
                  className="input-premium pl-11 py-2 text-sm w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Filter className="w-4 h-4 text-slate-500" />
                <select 
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-app-bg/50 border border-app-border rounded-xl px-4 py-2 text-xs font-bold text-text-main focus:ring-1 focus:ring-primary outline-none min-w-[150px] transition-colors"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'All' ? t('prediction.all_categories') : t(`categories.${cat}`)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={selectedMonth}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                {filteredTransactions.length === 0 ? (
                  <div className="glass-panel p-20 text-center space-y-4">
                    <div className="w-20 h-20 bg-app-bg/10 rounded-full flex items-center justify-center mx-auto text-text-dim mb-4">
                      <LayoutDashboard className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-text-main">{t('prediction.no_data_title')}</h3>
                    <p className="text-text-muted max-w-md mx-auto">
                      {t('prediction.no_data_desc').replace('{month}', monthName)}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Analytics & History */}
                    <div className="lg:col-span-8 space-y-8">
                      <HistoryPanel transactions={transactions} selectedMonth={selectedMonth} />
                      <MonthlyTimeline 
                        selectedMonth={selectedMonth} 
                        onMonthChange={setSelectedMonth} 
                        transactions={transactions} 
                      />
                    </div>

                    {/* Right Column: AI Insights */}
                    <div className="lg:col-span-4">
                      <div className="sticky top-8 space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                           <TrendingUp className="w-4 h-4 text-primary" />
                           <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">{t('prediction.ai_engine')}</h5>
                        </div>
                        <AIInsights 
                          transactions={filteredTransactions} 
                          role={user.role} 
                          selectedMonth={selectedMonth} 
                        />
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

          </div>
        </main>
      </div>
    </div>
  );
}
