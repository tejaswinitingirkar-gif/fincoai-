'use client';

import { useState, useMemo, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { Calendar, TrendingUp, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';

import { useLanguage } from '@/context/LanguageContext';

export default function DashboardCharts({ transactions, selectedMonth, onMonthChange }) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('Overview');
  const [summaryTotals, setSummaryTotals] = useState({ income: 0, expense: 0, savings: 0 });

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch('/api/financial-summary', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          cache: 'no-store'
        });
        const data = await res.json();
        if (data.success) {
          setSummaryTotals({
            income: data.data.totalIncome,
            expense: data.data.totalExpense,
            savings: data.data.netSavings
          });
        }
      } catch (err) {
        console.error("Summary fetch error", err);
      }
    };
    fetchSummary();
  }, [transactions]); // Re-fetch whenever transactions update

  const monthlyTotals = useMemo(() => {
    const months = {};
    transactions.forEach(t => {
      const m = typeof t.date === 'string' ? t.date.substring(0, 7) : new Date(t.date).toISOString().substring(0, 7);
      if (!months[m]) months[m] = { month: m, income: 0, expense: 0, savings: 0 };
      if (t.type === 'Income') months[m].income += t.amount;
      else months[m].expense += t.amount;
      months[m].savings = months[m].income - months[m].expense;
    });
    return Object.values(months).sort((a, b) => a.month.localeCompare(b.month)).slice(-6);
  }, [transactions]);

  const currentMonthData = useMemo(() => {
    const data = { income: 0, expense: 0, categories: {} };
    transactions.filter(t => (typeof t.date === 'string' ? t.date.substring(0, 7) : new Date(t.date).toISOString().substring(0, 7)) === selectedMonth)
    .forEach(t => {
      if (t.type === 'Income') data.income += t.amount;
      else {
        data.expense += t.amount;
        data.categories[t.category] = (data.categories[t.category] || 0) + t.amount;
      }
    });
    return data;
  }, [transactions, selectedMonth]);

  const categoryData = useMemo(() => {
    return Object.entries(currentMonthData.categories)
      .map(([name, value]) => ({ name: t(`categories.${name}`) || name, value }))
      .sort((a, b) => b.value - a.value);
  }, [currentMonthData, t]);

  const stats = [
    { label: t('dash_charts.total_income'), value: summaryTotals.income, icon: ArrowUpRight, color: 'success' },
    { label: t('dash_charts.total_expenses'), value: summaryTotals.expense, icon: ArrowDownRight, color: 'error' },
    { label: t('dash_charts.net_savings'), value: summaryTotals.savings, icon: Wallet, color: 'primary' },
  ];

  return (
    <div className="space-y-8">
      {/* Stat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className="glass-panel p-6 group hover:border-primary/30"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl bg-${stat.color}/10 text-${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-${stat.color}/10 text-${stat.color} border border-${stat.color}/20`}>
                {t('dash_charts.monthly')}
              </span>
            </div>
            <p className="text-text-muted text-xs font-bold mb-1 uppercase tracking-wider">{stat.label}</p>
            <div className="text-3xl font-black text-text-main">
              ₹{stat.value.toLocaleString()}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="glass-panel p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h3 className="text-2xl font-bold mb-1 text-text-main">{t('dash_charts.analysis_title')}</h3>
            <p className="text-text-muted text-sm">{t('dash_charts.analysis_subtitle')}</p>
          </div>
          
          <div className="flex items-center gap-2 p-1 bg-app-bg/50 rounded-2xl border border-app-border backdrop-blur-sm transition-all">
            {[
              { id: 'Overview', labelKey: 'dash_charts.tab_overview' },
              { id: 'Expenses', labelKey: 'dash_charts.tab_expenses' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeTab === tab.id 
                    ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                    : 'text-text-muted hover:text-text-main hover:bg-primary/5'
                }`}
              >
                {t(tab.labelKey)}
              </button>
            ))}
            <div className="w-px h-6 bg-app-border mx-2"></div>
            <div className="flex items-center gap-2 pr-group">
              <Calendar className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
              <input 
                type="month" 
                value={selectedMonth} 
                onChange={(e) => onMonthChange(e.target.value)}
                className="bg-transparent border-none text-sm font-bold text-text-main focus:ring-0 cursor-pointer transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="h-[300px] md:h-[400px] w-full flex items-center justify-center">
          {activeTab === 'Overview' ? (
            monthlyTotals.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTotals}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border-color)" strokeOpacity={0.1} />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'currentColor', fontSize: 12, fontWeight: 600 }} 
                    className="text-text-muted"
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'currentColor', fontSize: 12, fontWeight: 600 }}
                    tickFormatter={(val) => `₹${val/1000}k`}
                    className="text-text-muted"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgb(var(--bg-card))', 
                      borderColor: 'rgb(var(--border-color))',
                      borderRadius: '16px',
                      boxShadow: 'var(--shadow-premium)',
                      border: '1px solid rgb(var(--border-color))'
                    }}
                    itemStyle={{ color: 'rgb(var(--text-main))' }}
                    labelStyle={{ color: 'rgb(var(--text-muted))' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="income" 
                    stroke="#22C55E" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorIncome)" 
                    animationDuration={1500}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="expense" 
                    stroke="#EF4444" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorExpense)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center space-y-4">
                 <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="text-primary w-8 h-8 opacity-50" />
                 </div>
                 <p className="text-text-main font-bold italic tracking-widest uppercase text-xs">{t('dash_charts.waiting_data')}</p>
                 <p className="text-text-muted text-sm max-w-[300px]">{t('dash_charts.add_income_expense')}</p>
              </div>
            )
          ) : (
            categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="var(--border-color)" strokeOpacity={0.1} />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'currentColor', fontSize: 12, fontWeight: 700 }}
                    width={100}
                    className="text-text-main"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgb(var(--bg-card))', 
                      borderColor: 'rgb(var(--border-color))',
                      borderRadius: '16px',
                      boxShadow: 'var(--shadow-premium)',
                      border: '1px solid rgb(var(--border-color))'
                    }}
                    itemStyle={{ color: 'rgb(var(--text-main))' }}
                  />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24} animationDuration={1000}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--primary)' : 'rgb(var(--border-color))'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center space-y-4">
                 <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wallet className="text-primary w-8 h-8 opacity-50" />
                 </div>
                 <p className="text-text-main font-bold italic tracking-widest uppercase text-xs">{t('dash_charts.no_expenses')}</p>
                 <p className="text-text-muted text-sm max-w-[300px]">{t('dash_charts.select_month_log')}</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
