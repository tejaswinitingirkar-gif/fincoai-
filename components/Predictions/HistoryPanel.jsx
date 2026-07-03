'use client';

import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Wallet, ArrowUpCircle, ArrowDownCircle, History, Tag, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

export default function HistoryPanel({ transactions, selectedMonth }) {
  const { t } = useLanguage();
  const data = {
    income: 0,
    expense: 0,
    savings: 0,
    categories: {},
    count: 0,
    biggestExpense: { amount: 0, category: 'None' }
  };

  transactions.forEach(t => {
    const tMonth = typeof t.date === 'string' ? t.date.substring(0, 7) : new Date(t.date).toISOString().substring(0, 7);
    if (tMonth === selectedMonth) {
      data.count++;
      if (t.type === 'Income') {
        data.income += t.amount;
      } else {
        data.expense += t.amount;
        data.categories[t.category] = (data.categories[t.category] || 0) + t.amount;
        if (t.amount > data.biggestExpense.amount) {
          data.biggestExpense = { amount: t.amount, category: t.category };
        }
      }
    }
  });

  data.savings = data.income - data.expense;

  const categoryData = Object.entries(data.categories)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const stats = [
    { label: t('dash_charts.total_income'), value: data.income, icon: ArrowUpCircle, color: 'text-success bg-success/10' },
    { label: t('dash_charts.total_expenses'), value: data.expense, icon: ArrowDownCircle, color: 'text-error bg-error/10' },
    { label: t('dash_charts.total_savings'), value: data.savings, icon: Wallet, color: 'text-primary bg-primary/10' },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
            className="glass-panel p-4 flex items-center gap-4"
          >
            <div className={`p-3 rounded-xl ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <h4 className="text-lg font-bold text-text-main">₹{stat.value.toLocaleString()}</h4>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="glass-panel p-6">
          <div className="flex items-center gap-2 mb-6">
            <Tag className="w-4 h-4 text-primary" />
            <h5 className="text-xs font-black uppercase tracking-widest text-slate-400">{t('dash_charts.spending_by_category')}</h5>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #ffffff10', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {categoryData.slice(0, 4).map((c, i) => (
              <div key={c.name} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-slate-400">{t(`categories.${c.name}`)}</span>
                </div>
                <span className="text-text-main font-bold">₹{c.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Insight Card */}
        <div className="flex flex-col gap-6">
          <div className="glass-panel p-6 flex-1">
             <div className="flex items-center gap-2 mb-6">
               <TrendingUp className="w-4 h-4 text-warning" />
               <h5 className="text-xs font-black uppercase tracking-widest text-slate-400">{t('dash_charts.analysis_highlights')}</h5>
             </div>
             <div className="space-y-6">
               <div>
                 <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">{t('dash_charts.biggest_expense')}</p>
                 <div className="flex justify-between items-end">
                    <h4 className="text-xl font-black text-text-main">{data.biggestExpense.category !== 'None' ? t(`categories.${data.biggestExpense.category}`) : t('ai_insights.none')}</h4>
                    <span className="text-error font-bold text-lg">₹{data.biggestExpense.amount.toLocaleString()}</span>
                 </div>
               </div>
               <div className="pt-6 border-t border-white/5">
                 <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">{t('dash_charts.transaction_activity')}</p>
                 <div className="flex justify-between items-end">
                    <h4 className="text-xl font-black text-text-main">{data.count} {t('dash_charts.records')}</h4>
                    <span className="text-primary font-bold">{t('dash_charts.logged_this_month')}</span>
                 </div>
               </div>
             </div>
          </div>
          
          <div className="glass-panel p-6 bg-primary/5 border-primary/20">
             <div className="flex items-center gap-3">
               <div className="p-3 bg-primary/20 rounded-xl text-primary">
                 <History className="w-5 h-5" />
               </div>
               <div>
                 <h4 className="text-sm font-bold text-text-main">{t('dash_charts.monthly_summary_generated')}</h4>
                 <p className="text-xs text-slate-400">{t('dash_charts.calculated_from', { count: transactions.length })}</p>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
