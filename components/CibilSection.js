'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Edit3, TrendingUp, Info } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function CibilSection({ user }) {
  const { t, language } = useLanguage();
  const eligibleRoles = ['Employee', 'Freelancer / Self-Employed', 'Freelancer'];
  const isEligible = eligibleRoles.includes(user?.role);

  const [cibilData, setCibilData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [creditLimit, setCreditLimit] = useState('');

  useEffect(() => {
    if (isEligible) {
      fetchCibilData();
    } else {
      setLoading(false);
    }
  }, [isEligible, language]);

  const fetchCibilData = async () => {
    try {
      const res = await fetch('/api/cibil', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCibilData(data.data);
      }
    } catch (e) {
      console.error("Error fetching ML CIBIL data", e);
    } finally {
      setLoading(false);
    }
  };

  const handleManualLimitSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/cibil', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          creditLimit: creditLimit ? Number(creditLimit) : null
        })
      });
      if (res.ok) {
        setIsEditing(false);
        setLoading(true);
        fetchCibilData();
      }
    } catch (e) {
      console.error("Error saving CIBIL data", e);
    }
  };

  if (!isEligible) {
    return (
      <div className="glass-panel p-6 opacity-80 flex items-center gap-4 transition-colors">
        <div className="p-3 bg-app-bg/50 rounded-xl border border-app-border">
          <ShieldCheck className="text-text-muted w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-text-main mb-1">{t('cibil.advisor')}</h3>
          <p className="text-text-muted text-sm">{t('cibil.unavailable')}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="glass-panel p-10 flex flex-col items-center justify-center gap-4 transition-colors">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full"
        />
        <p className="text-text-muted font-medium">{t('cibil.analyzing')}</p>
      </div>
    );
  }

  if (!cibilData) return null;

  const scoreCategory = cibilData.category || "Poor";
  const colors = {
    Excellent: '#22C55E',
    Good: '#EAB308',
    Average: '#F97316',
    Poor: '#EF4444'
  };
  const scoreColor = colors[scoreCategory] || colors.Poor;
  const scorePercentage = Math.max(0, Math.min(100, ((cibilData.creditScore - 300) / 600) * 100));

  if (isEditing) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-8 transition-colors"
      >
        <div className="flex items-center gap-3 mb-6">
          <Edit3 className="text-primary w-6 h-6" />
          <h3 className="text-xl font-bold text-text-main">{t('cibil.configure')}</h3>
        </div>
        <p className="text-text-muted mb-6 text-sm">
          {t('cibil.configure_desc')}
        </p>
        <form onSubmit={handleManualLimitSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-muted">{t('cibil.total_limit')}</label>
            <input 
              type="number" 
              placeholder="e.g. 5,00,000" 
              className="input-premium"
              value={creditLimit} 
              onChange={(e) => setCreditLimit(e.target.value)} 
            />
          </div>
          <div className="flex gap-4">
            <button type="submit" className="btn-primary flex-1">{t('cibil.recalculate')}</button>
            <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary flex-1">{t('cibil.cancel')}</button>
          </div>
        </form>
      </motion.div>
    );
  }

  return (
    <div className="glass-panel p-8 relative overflow-hidden group transition-colors">
      {/* Background Glow */}
      <div 
        className="absolute -right-20 -top-20 w-64 h-64 rounded-full blur-[100px] opacity-10 pointer-events-none"
        style={{ backgroundColor: scoreColor }}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <ShieldCheck className="text-primary w-6 h-6" />
            <h2 className="text-2xl font-bold text-text-main">{t('cibil.bureau')}</h2>
          </div>
          <p className="text-text-muted text-sm italic">{t('cibil.estimate_note')}</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-text-dim uppercase tracking-widest font-bold">{t('cibil.last_updated')}</p>
            <p className="text-sm text-text-muted font-medium">{new Date(cibilData.lastUpdated).toLocaleDateString(language === 'hi' ? 'hi-IN' : language === 'te' ? 'te-IN' : 'en-IN')}</p>
          </div>
          <button 
            onClick={() => setIsEditing(true)}
            className="p-2 bg-primary/10 rounded-xl text-primary hover:bg-primary hover:text-white transition-all border border-primary/20"
          >
            <Edit3 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Score Gauge */}
        <div className="flex flex-col items-center">
          <div className="relative w-64 h-64 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              {/* Background track */}
              <circle
                cx="50" cy="50" r="45"
                fill="none"
                stroke="rgb(var(--border-color))"
                strokeWidth="8"
                strokeLinecap="round"
                strokeOpacity="0.5"
              />
              {/* Score track */}
              <motion.circle
                cx="50" cy="50" r="45"
                fill="none"
                stroke={scoreColor}
                strokeWidth="8"
                strokeLinecap="round"
                initial={{ strokeDasharray: "0, 283" }}
                animate={{ strokeDasharray: `${(scorePercentage / 100) * 283}, 283` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <motion.span 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-6xl font-black text-text-main"
              >
                {cibilData.creditScore}
              </motion.span>
              <div 
                className="px-4 py-1 rounded-full text-sm font-bold mt-2 border"
                style={{ backgroundColor: `${scoreColor}20`, color: scoreColor, borderColor: `${scoreColor}40` }}
              >
                {t(`cibil.${scoreCategory.toLowerCase()}`)}
              </div>
            </div>
          </div>
          <div className="w-full flex justify-between mt-4 px-4 text-xs font-bold text-text-dim uppercase">
            <span>300 ({t('cibil.poor')})</span>
            <span>900 ({t('cibil.excellent')})</span>
          </div>
        </div>

        {/* Factors & Insights */}
        <div className="space-y-6">
          <div className="bg-app-bg/10 rounded-2xl p-6 border border-app-border space-y-4">
            <h4 className="font-bold flex items-center gap-2 text-text-main">
              <TrendingUp className="text-secondary w-5 h-5" />
              {t('cibil.impact_factors')}
            </h4>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-text-muted">{t('cibil.savings_consistency')}</span>
                  <span className="text-success font-bold">
                    {cibilData.creditScore > 700 ? t('cibil.strong') : cibilData.creditScore > 500 ? t('cibil.moderate') : t('cibil.weak')}
                  </span>
                </div>
                <div className="h-2 bg-app-bg rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(cibilData.creditScore / 900) * 100}%` }}
                    className="h-full bg-success rounded-full shadow-[0_0_10px_rgba(34,197,94,0.4)]"
                  />
                </div>
              </div>

              {cibilData.creditLimit > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-muted">{t('cibil.credit_utilization')}</span>
                    <span className={`${(cibilData.creditUsed / cibilData.creditLimit) > 0.5 ? 'text-error' : 'text-warning'} font-bold`}>
                       {Math.round((cibilData.creditUsed / cibilData.creditLimit) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 bg-app-bg rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (cibilData.creditUsed / cibilData.creditLimit) * 100)}%` }}
                      className={`h-full rounded-full ${(cibilData.creditUsed / cibilData.creditLimit) > 0.5 ? 'bg-error' : 'bg-warning'}`}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20 flex gap-3 items-start">
            <Info className="text-primary w-5 h-5 mt-0.5" />
            <p className="text-sm text-text-muted leading-relaxed font-medium">
              {cibilData.creditScore >= 750 
                ? t('cibil.advice_excellent')
                : t('cibil.advice_improve')
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
