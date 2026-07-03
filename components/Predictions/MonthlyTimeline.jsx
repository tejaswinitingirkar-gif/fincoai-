'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function MonthlyTimeline({ selectedMonth, onMonthChange, transactions }) {
  const { t, language } = useLanguage();
  const locale = language === 'hi' ? 'hi-IN' : language === 'te' ? 'te-IN' : 'en-US';
  // Generate last 6 months
  const months = [];
  const today = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = d.toLocaleDateString(locale, { month: 'short' });
    const yearLabel = d.toLocaleDateString(locale, { year: 'numeric' });
    const label = `${monthLabel} ${yearLabel}`;
    
    // Calculate expense for this month
    const monthExpense = transactions
      .filter(t_item => (typeof t_item.date === 'string' ? t_item.date.substring(0, 7) : new Date(t_item.date).toISOString().substring(0, 7)) === mStr)
      .reduce((sum, t_item) => sum + (t_item.type === 'Expense' ? t_item.amount : 0), 0);
      
    months.push({ mStr, label, monthLabel, amount: monthExpense });
  }

  const currentIndex = months.findIndex(m => m.mStr === selectedMonth);

  return (
    <div className="glass-panel p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h5 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            {t('prediction.monthly_timeline')}
          </h5>
          <p className="text-sm text-slate-400 mt-1">{t('prediction.compare_trends')}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => currentIndex > 0 && onMonthChange(months[currentIndex - 1].mStr)}
            disabled={currentIndex <= 0}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-text-main" />
          </button>
          <div className="px-6 py-2 bg-primary/10 border border-primary/20 rounded-xl">
            <span className="text-sm font-black text-primary uppercase">{months[currentIndex]?.label || t('prediction.selected_month')}</span>
          </div>
          <button 
            onClick={() => currentIndex < months.length - 1 && onMonthChange(months[currentIndex + 1].mStr)}
            disabled={currentIndex >= months.length - 1}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all"
          >
            <ChevronRight className="w-5 h-5 text-text-main" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {months.map((m, i) => {
          const isActive = m.mStr === selectedMonth;
          const prevMonthAmount = i > 0 ? months[i-1].amount : null;
          const diff = prevMonthAmount ? m.amount - prevMonthAmount : null;
          const percentChange = diff && prevMonthAmount ? (diff / prevMonthAmount) * 100 : null;

          return (
            <motion.button
              key={m.mStr}
              whileHover={{ y: -5 }}
              onClick={() => onMonthChange(m.mStr)}
              className={`p-4 rounded-2xl border transition-all text-left ${
                isActive 
                  ? 'bg-primary/10 border-primary shadow-lg shadow-primary/20' 
                  : 'bg-white/5 border-white/5 hover:border-white/20'
              }`}
            >
              <p className={`text-[10px] font-black uppercase tracking-tighter mb-2 ${isActive ? 'text-primary' : 'text-slate-500'}`}>
                {m.monthLabel}
              </p>
              <h4 className="text-sm font-bold text-text-main mb-2">₹{m.amount.toLocaleString(locale)}</h4>
              
              {percentChange !== null && (
                <div className={`flex items-center gap-1 text-[9px] font-black uppercase ${percentChange > 0 ? 'text-error' : 'text-success'}`}>
                  {percentChange > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(Math.round(percentChange))}%
                </div>
              )}
              {percentChange === null && <div className="h-3" />}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
