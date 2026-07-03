'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ShieldCheck, Zap, TrendingDown, TrendingUp, Target, Lightbulb, AlertTriangle, Cpu, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIInsights({ transactions, role, selectedMonth }) {
  const { t, language } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const fetchInsights = useCallback(async () => {
    if (!transactions || transactions.length < 5) return;
    setLoading(true);
    setError(null);
    try {
      const month = selectedMonth ? selectedMonth.split('-')[1] : null;
      const year = selectedMonth ? selectedMonth.split('-')[0] : null;

      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ transactions, role, month, year, language })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || t('ai_insights.error_unavailable'));
      }

      const result = await res.json();
      if (result.success && result.data) {
        setData(result.data);
      } else {
        throw new Error(result.error || t('ai_insights.error_parse'));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [transactions, role, selectedMonth, language, t]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  if (!transactions || transactions.length < 5) {
    return (
      <div className="glass-panel p-8 text-center space-y-4">
        <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto text-text-muted">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-text-main">{t('ai_insights.not_enough_data')}</h3>
          <p className="text-text-muted text-sm">{t('ai_insights.add_more')}</p>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="glass-panel p-12 flex flex-col items-center justify-center gap-6">
      <div className="relative">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full"
        />
        <Cpu className="absolute inset-0 m-auto w-6 h-6 text-primary animate-pulse" />
      </div>
      <div className="text-center">
        <p className="text-text-main font-black italic tracking-[0.2em] uppercase text-xs">{t('ai_insights.processing')}</p>
        <p className="text-text-muted text-xs mt-1">{t('ai_insights.calculating')}</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="glass-panel p-8 text-center border-error/20">
       <AlertTriangle className="w-8 h-8 text-error mx-auto mb-4" />
       <p className="text-error text-sm font-bold">{error}</p>
       <button onClick={fetchInsights} className="btn-secondary mt-4 py-2 px-6">{t('ai_insights.retry')}</button>
    </div>
  );

  if (!data) return null;

  const confidenceColors = { LOW: 'text-error bg-error/10 border-error/20', MEDIUM: 'text-warning bg-warning/10 border-warning/20', HIGH: 'text-success bg-success/10 border-success/20' };
  const statusColors = { SAFE: 'text-success border-success/30', RISK: 'text-warning border-warning/30', OVERSPENDING: 'text-error border-error/30', UNKNOWN: 'text-text-dim border-app-border' };

  // Calculate Heatmap Data
  const getHeatmapData = () => {
    const expenses = transactions.filter(t => t.type === 'Expense');
    const days = [
      t('ai_insights.sun'),
      t('ai_insights.mon'),
      t('ai_insights.tue'),
      t('ai_insights.wed'),
      t('ai_insights.thu'),
      t('ai_insights.fri'),
      t('ai_insights.sat')
    ];
    const heatmap = [0, 0, 0, 0, 0, 0, 0];
    expenses.forEach(t => {
      const date = new Date(t.date);
      heatmap[date.getDay()] += t.amount;
    });
    const maxVal = Math.max(...heatmap, 1);
    return days.map((day, i) => ({ day, value: heatmap[i], intensity: heatmap[i] / maxVal }));
  };
  const heatmapData = getHeatmapData();

  // Calculate Trend
  const currentMonthExpenses = transactions
    .filter(t => t.type === 'Expense' && new Date(t.date).getMonth() === new Date().getMonth())
    .reduce((sum, t) => sum + t.amount, 0);
  const trendIsUp = data?.predicted_expense > currentMonthExpenses;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* 1. ANOMALY WARNING */}
      {data?.anomaly_detected && (
        <motion.div 
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="p-4 bg-error/10 border border-error/30 rounded-2xl flex items-center gap-4 text-error"
        >
          <div className="p-2 bg-error rounded-xl text-white">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <p className="text-sm font-black uppercase tracking-tight">{data?.warning || t('ai_insights.anomaly_detected')}</p>
        </motion.div>
      )}

      {/* 2. STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Prediction Card */}
        <div className="glass-panel w-full rounded-xl p-4 group hover:border-primary/20 border-l-4 border-primary flex flex-col justify-between h-full">
          <div className="flex justify-between items-start mb-3">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1.5">
              {trendIsUp ? (
                  <div className="flex items-center justify-center text-error bg-error/10 w-5 h-5 rounded shrink-0">
                     <TrendingUp className="w-3 h-3" />
                  </div>
              ) : (
                  <div className="flex items-center justify-center text-success bg-success/10 w-5 h-5 rounded shrink-0">
                     <TrendingDown className="w-3 h-3" />
                  </div>
              )}
              <span className={`text-[9px] font-bold px-1.5 py-1 rounded border uppercase tracking-tighter whitespace-nowrap shrink-0 ${confidenceColors[data?.confidence]}`}>
                {data?.confidence} {t('ai_insights.confidence_score')}
              </span>
            </div>
          </div>
          <div className="flex flex-col mt-auto min-w-0 w-full">
            <p className="text-text-muted text-[10px] font-medium mb-1 uppercase tracking-wider whitespace-nowrap">{t('ai_insights.prediction')}</p>
            <div className="flex items-center w-full overflow-x-auto scrollbar-hide pb-0.5">
              <h3 className="font-extrabold text-text-main leading-tight tracking-tight text-lg sm:text-xl md:text-2xl whitespace-nowrap">
                ₹{data?.predicted_expense?.toLocaleString()}
              </h3>
            </div>
            <p className="text-[9px] text-text-dim italic mt-1 truncate">* {t('ai_insights.ml_estimate')}</p>
          </div>
        </div>

        {/* Recommended Budget Card */}
        <div className={`glass-panel w-full rounded-xl p-4 group hover:border-primary/20 border-l-4 flex flex-col justify-between h-full ${statusColors[data?.budget_status]?.split(' ')[1]}`}>
          <div className="flex justify-between items-start mb-3">
            <div className={`p-1.5 rounded-lg shrink-0 ${statusColors[data?.budget_status]?.includes('success') ? 'bg-success/10 text-success' : statusColors[data?.budget_status]?.includes('warning') ? 'bg-warning/10 text-warning' : statusColors[data?.budget_status]?.includes('error') ? 'bg-error/10 text-error' : 'bg-primary/10 text-text-dim'}`}>
              <Target className="w-4 h-4" />
            </div>
            <span className={`text-[9px] font-bold px-1.5 py-1 rounded border uppercase tracking-tighter whitespace-nowrap shrink-0 ${statusColors[data?.budget_status]?.split(' ')[0]} ${statusColors[data?.budget_status]?.split(' ')[1]}`}>
              {data?.budget_status}
            </span>
          </div>
          <div className="flex flex-col mt-auto min-w-0 w-full">
            <p className="text-text-muted text-[10px] font-medium mb-1 uppercase tracking-wider whitespace-nowrap">{t('ai_insights.rec_budget')}</p>
            <div className="flex items-center w-full overflow-x-auto scrollbar-hide pb-0.5">
              <h3 className="font-extrabold text-text-main leading-tight tracking-tight text-lg sm:text-xl md:text-2xl whitespace-nowrap">
                ₹{data?.recommended_budget?.toLocaleString()}
              </h3>
            </div>
            <p className="text-[9px] text-text-dim italic mt-1 truncate">* {t('ai_insights.optimized')}</p>
          </div>
        </div>
      </div>

      {/* 2.5 FINANCIAL HEALTH SCORE */}
      {data?.health_score !== undefined && (
        <div className="glass-panel p-6 flex flex-col md:flex-row items-center gap-6 justify-between">
          <div className="flex-1 space-y-2">
            <h5 className="text-xs font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              {t('ai_insights.health_score')}
            </h5>
            <p className="text-sm text-text-muted">
              {t('ai_insights.health_desc')}
            </p>
          </div>
          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-primary/10"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`${data.health_score > 75 ? 'text-success' : data.health_score > 40 ? 'text-warning' : 'text-error'} drop-shadow-[0_0_8px_currentColor]`}
                strokeDasharray={`${data.health_score}, 100`}
                strokeWidth="3"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-text-main leading-none">{data.health_score}</span>
              <span className="text-[8px] font-bold text-text-dim uppercase tracking-widest">/100</span>
            </div>
          </div>
        </div>
      )}

      {/* 2.7 EXPLAINABILITY */}
      {data?.explainability?.length > 0 && (
        <div className="glass-panel p-6 space-y-4">
          <h5 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
            <TrendingDown className="w-4 h-4" />
            {t('ai_insights.diagnostics')}
          </h5>
          <div className="space-y-3">
            {data.explainability.map((exp, i) => (
              <div key={i} className="flex gap-3 items-start group">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 group-hover:scale-150 transition-transform" />
                <p className="text-sm text-text-muted leading-relaxed font-medium">{exp}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2.9 SPENDING HEATMAP */}
      <div className="glass-panel p-6 transition-colors">
        <h5 className="text-xs font-black uppercase tracking-widest text-text-muted mb-6 flex items-center gap-2">
          <Zap className="w-4 h-4 text-warning" />
          {t('ai_insights.heatmap')}
        </h5>
        <div className="flex gap-2 justify-between items-end h-24">
          {heatmapData.map((d, i) => (
             <div key={i} className="flex flex-col items-center justify-end gap-2 w-full h-full group relative">
               <div className="absolute -top-8 bg-app-card border border-app-border text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none text-text-main shadow-xl">
                 ₹{d.value.toLocaleString()}
               </div>
               <div className="w-full rounded-md transition-all duration-500" 
                    style={{ 
                       height: `${Math.max(10, d.intensity * 100)}%`, 
                       backgroundColor: `rgba(239, 68, 68, ${Math.max(0.2, d.intensity)})` 
                    }} 
               />
               <span className="text-[10px] text-text-muted font-bold">{d.day}</span>
             </div>
          ))}
        </div>
      </div>

      {/* 3. FORECAST CHART */}
      <div className="glass-panel p-6">
        <h5 className="text-xs font-black uppercase tracking-widest text-text-muted mb-6 flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-secondary" />
          {t('ai_insights.forecast')}
        </h5>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.predicted_daily_expenses}>
              <defs>
                <linearGradient id="aiGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.1} />
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgb(var(--bg-card))', 
                  border: '1px solid rgb(var(--border-color))', 
                  borderRadius: '12px',
                  color: 'rgb(var(--text-main))'
                }}
                itemStyle={{ color: '#4F46E5', fontWeight: 'bold' }}
              />
              <Area type="stepAfter" dataKey="amount" stroke="var(--primary)" strokeWidth={3} fill="url(#aiGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. INSIGHTS & PLAN */}
      <div className="grid grid-cols-1 gap-4">
        <div className="glass-panel p-6 space-y-4">
          <h5 className="text-xs font-black uppercase tracking-widest text-secondary flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            {t('ai_insights.habit_insights')}
          </h5>
          <div className="space-y-3">
            {data?.insights?.map((insight, i) => (
              <div key={i} className="flex gap-3 items-start group">
                <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 group-hover:scale-150 transition-transform" />
                <p className="text-sm text-text-muted leading-relaxed font-medium">{insight}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6 space-y-4">
          <h5 className="text-xs font-black uppercase tracking-widest text-success flex items-center gap-2">
            <Target className="w-4 h-4" />
            {t('ai_insights.saving_plan')}
          </h5>
          <div className="space-y-3">
            {data?.saving_plan?.map((plan, i) => (
              <div key={i} className="flex gap-3 items-start group">
                <div className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 group-hover:scale-150 transition-transform" />
                <p className="text-sm text-text-muted leading-relaxed font-medium">{plan}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. TRANSPARENCY & ENGINE REASONING */}
      <div className="bg-app-bg/50 rounded-2xl p-6 border border-app-border space-y-6 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">
            <Cpu className="w-3 h-3" />
            {t('ai_insights.transparency')}
          </div>
          {data?.transparency_panel && (
             <span className={`text-[9px] font-bold px-2 py-1 rounded border uppercase tracking-tighter ${data.transparency_panel.data_quality === 'Excellent' ? 'bg-success/10 text-success border-success/30' : data.transparency_panel.data_quality === 'Good' ? 'bg-warning/10 text-warning border-warning/30' : 'bg-error/10 text-error border-error/30'}`}>
                {t('ai_insights.quality')}: {data.transparency_panel.data_quality}
             </span>
          )}
        </div>
        
        {data?.transparency_panel && (
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-primary/5 rounded-xl border border-app-border">
              <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1">{t('ai_insights.volume')}</p>
              <p className="text-sm font-bold text-text-main">{data.transparency_panel.total_transactions} {t('nav.transactions')}</p>
            </div>
            <div className="p-3 bg-primary/5 rounded-xl border border-app-border">
              <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1">{t('ai_insights.depth')}</p>
              <p className="text-sm font-bold text-text-main">{data.transparency_panel.months_history} {t('dash.all_months')}</p>
            </div>
            <div className="col-span-2 p-3 bg-primary/5 rounded-xl border border-app-border">
              <div className="flex justify-between items-end mb-2">
                 <p className="text-[10px] text-text-muted uppercase tracking-widest">{t('ai_insights.confidence_score')}</p>
                 <p className="text-sm font-bold text-text-main">{data.transparency_panel.confidence_score}%</p>
              </div>
              <div className="w-full bg-app-bg rounded-full h-2 overflow-hidden">
                 <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${data.transparency_panel.confidence_score}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={`h-full ${data.transparency_panel.confidence_score >= 75 ? 'bg-success' : data.transparency_panel.confidence_score >= 40 ? 'bg-warning' : 'bg-error'}`}
                 />
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2 font-mono text-[10px] text-primary/70">
          {data?.reasoning?.map((r, i) => (
            <div key={i} className="flex gap-2">
              <span className="opacity-40">[{i}]</span>
              <span className="text-text-muted">{r}</span>
            </div>
          ))}
        </div>
        <div className="pt-4 border-t border-app-border flex items-center justify-between">
          <div className="flex items-center gap-2">
             <Zap className="w-3 h-3 text-warning" />
             <span className="text-[9px] text-text-dim font-bold uppercase">{t('ai_insights.processing_mode')}</span>
          </div>
          {data?.transparency_panel?.last_refresh && (
             <span className="text-[9px] text-text-dim uppercase">{t('ai_insights.sync')}: {new Date(data.transparency_panel.last_refresh).toLocaleTimeString(language === 'hi' ? 'hi-IN' : language === 'te' ? 'te-IN' : 'en-IN')}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
