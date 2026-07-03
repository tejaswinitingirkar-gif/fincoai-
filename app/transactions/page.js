'use client';

import Link from 'next/link';
import { formatCurrency } from '@/utils/formatCurrency';

import { useState, useEffect, useMemo } from 'react';
import { 
  IndianRupee, Search, Filter, ArrowUpCircle, ArrowDownCircle, 
  Download, Trash2, Calendar, ChevronRight, MoreHorizontal, Upload 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/Layout/Sidebar';
import Navbar from '@/components/Layout/Navbar';
import CSVUploadModal from '@/components/Transactions/CSVUploadModal';
import { useLanguage } from '@/context/LanguageContext';

export default function TransactionsPage() {
  const { t, language } = useLanguage();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  

  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

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

  const deleteTx = async (id) => {
    if (!confirm(t('tx.delete_confirm'))) return;
    try {
      await fetch(`/api/transactions?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      fetchTransactions();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t_item => {
      const matchesSearch = t_item.description?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           t_item.category?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'All' || t_item.type === filterType;
      return matchesSearch && matchesType;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, searchQuery, filterType]);

  const totals = useMemo(() => {
    return filteredTransactions.reduce((acc, t_item) => {
      if (t_item.type === 'Income') acc.income += t_item.amount;
      else acc.expense += t_item.amount;
      return acc;
    }, { income: 0, expense: 0 });
  }, [filteredTransactions]);

  const handleExport = () => {
    const headers = [
      t('tx.col_timestamp'),
      t('tx.col_desc'),
      t('tx.col_cat'),
      t('tx.all'),
      t('tx.col_amt')
    ].join(",");

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers + "\n"
      + filteredTransactions.map(t_item => {
          const date = new Date(t_item.date).toLocaleDateString(language === 'hi' ? 'hi-IN' : language === 'te' ? 'te-IN' : 'en-IN');
          const typeLabel = t(`tx.${t_item.type.toLowerCase()}`);
          const catLabel = t(`categories.${t_item.category}`);
          return `${date},${t_item.description || ''},${catLabel},${typeLabel},${t_item.amount}`;
        }).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `finco_transactions_${language}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!user) return null;

  
  if (!mounted) return null;

  const locale = language === 'hi' ? 'hi-IN' : language === 'te' ? 'te-IN' : 'en-IN';

  return (
    <div className="min-h-screen bg-app-bg flex transition-colors duration-500">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 ml-0 lg:ml-64 min-h-screen flex flex-col">
        <Navbar user={user} onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="text-3xl font-black text-text-main">{t('tx.title')}</h1>
                <p className="text-text-muted">{t('tx.subtitle')}</p>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => setIsUploadModalOpen(true)} className="btn-secondary py-2 px-4 text-sm bg-app-bg/10 hover:bg-app-bg/20 border-app-border">
                  <Upload className="w-4 h-4" />
                  {t('tx.upload_csv')}
                </button>
                <button onClick={handleExport} className="btn-secondary py-2 px-4 text-sm">
                  <Download className="w-4 h-4" />
                  {t('tx.export_csv')}
                </button>
                <Link href="/dashboard" className="btn-primary py-2 px-4 text-sm">
                  <IndianRupee className="w-4 h-4" />
                  {t('tx.quick_log')}
                </Link>
              </div>
            </div>

            <CSVUploadModal 
              isOpen={isUploadModalOpen} 
              onClose={() => setIsUploadModalOpen(false)} 
              onRefresh={fetchTransactions}
            />

            {/* Summary Ribbon */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-panel p-6 border-l-4 border-success">
                <p className="text-[10px] font-black uppercase text-text-muted tracking-widest mb-1">{t('tx.period_income')}</p>
                <h3 className="text-2xl font-black text-text-main">₹{totals.income.toLocaleString(locale)}</h3>
              </div>
              <div className="glass-panel p-6 border-l-4 border-error">
                <p className="text-[10px] font-black uppercase text-text-muted tracking-widest mb-1">{t('tx.period_expense')}</p>
                <h3 className="text-2xl font-black text-text-main">₹{totals.expense.toLocaleString(locale)}</h3>
              </div>
              <div className="glass-panel p-6 border-l-4 border-primary">
                <p className="text-[10px] font-black uppercase text-text-muted tracking-widest mb-1">{t('tx.net_flow')}</p>
                <h3 className="text-2xl font-black text-text-main">₹{(totals.income - totals.expense).toLocaleString(locale)}</h3>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="glass-panel p-4 flex flex-col lg:flex-row items-center gap-6">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  placeholder={t('tx.search_placeholder')} 
                  className="input-premium pl-11 py-2 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-2 p-1 bg-app-bg/50 rounded-xl border border-app-border w-full lg:w-auto">
                {['All', 'Income', 'Expense'].map(type => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-6 py-2 rounded-lg text-xs font-black uppercase transition-all ${
                      filterType === type ? 'bg-primary text-white' : 'text-slate-500 hover:text-white'
                    }`}
                  >
                    {t(`tx.${type.toLowerCase()}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* Ledger Table */}
            <div className="glass-panel overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] uppercase tracking-[0.2em] text-text-muted border-b border-app-border bg-app-bg/10">
                    <th className="px-8 py-5">{t('tx.col_timestamp')}</th>
                    <th className="px-8 py-5">{t('tx.col_desc')}</th>
                    <th className="px-8 py-5">{t('tx.col_cat')}</th>
                    <th className="px-8 py-5 text-right">{t('tx.col_amt')}</th>
                    <th className="px-8 py-5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence>
                    {filteredTransactions.map((t_item) => (
                      <motion.tr 
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={t_item._id} 
                        className="hover:bg-white/[0.03] transition-colors group"
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${t_item.type === 'Income' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                              {t_item.type === 'Income' ? <ArrowUpCircle className="w-4 h-4" /> : <ArrowDownCircle className="w-4 h-4" />}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-text-main">{new Date(t_item.date).toLocaleDateString(locale)}</span>
                              <span className="text-[10px] text-text-muted uppercase font-black tracking-tighter">
                                {new Date(t_item.date).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-sm text-slate-300 italic">{t_item.description || t('tx.no_notes')}</span>
                        </td>
                        <td className="px-8 py-6">
                          <span className="px-3 py-1 rounded-lg bg-app-bg/10 border border-app-border text-xs font-bold text-text-main">
                            {t(`categories.${t_item.category}`)}
                          </span>
                        </td>
                        <td className={`px-8 py-6 text-right font-black text-lg ${
                          t_item.type === 'Income' ? 'text-success' : 'text-error'
                        }`}>
                          {t_item.type === 'Income' ? '+' : '-'}₹{t_item.amount.toLocaleString(locale)}
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => deleteTx(t_item._id)} className="p-2 text-slate-500 hover:text-error transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-slate-500 hover:text-white transition-colors">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
              
              {filteredTransactions.length === 0 && (
                <div className="p-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-600">
                    <Search className="w-8 h-8" />
                  </div>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">{t('tx.no_matches')}</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
