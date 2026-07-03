'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function AIPlanner({ transactions, role }) {
  const { t } = useLanguage();
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const generatePlan = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ transactions, role })
      });
      const data = await res.json();
      if (data.success) {
        setPrediction(data.data);
      }
    } finally {
      setLoading(false);
    }
  }, [transactions, role]);

  useEffect(() => {
    if (transactions && transactions.length > 0) {
      generatePlan();
    }
  }, [transactions, generatePlan]);

  if (!transactions || transactions.length === 0) {
    return (
      <div className="glass-panel p-10 text-center transition-colors">
        <h2 className="text-xl font-bold text-text-main mb-4">{t('ai_planner.no_transactions_title')}</h2>
        <p className="text-text-muted font-medium">{t('ai_planner.no_transactions')}</p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-8 transition-colors">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black text-text-main tracking-tight">{t('ai_planner.title')}</h2>
        <button onClick={generatePlan} className="btn-primary px-6 py-2.5 text-sm" disabled={loading}>
          {loading ? t('ai_planner.analyzing') : t('ai_planner.refresh')}
        </button>
      </div>

      {prediction ? (
        <div className="animate-slide-up space-y-8">
          <p className="text-text-muted mb-8 text-sm font-medium">
            {t('ai_planner.subtitle_start')}<span className="text-primary font-bold">{t(`roles.${role.toLowerCase()}`)}</span>{t('ai_planner.subtitle_end')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Prediction Card */}
            <div className="p-6 bg-app-bg/50 rounded-2xl border border-app-border border-l-4 border-l-error shadow-sm group hover:scale-[1.02] transition-all">
              <div className="text-xs font-black text-text-dim uppercase tracking-widest mb-2">{t('ai_planner.est_spending')}</div>
              <div className="text-3xl font-black text-text-main">
                ₹{prediction.predictedTotal.toFixed(0).toLocaleString()}
              </div>
            </div>

            {/* Savings Target Card */}
            <div className="p-6 bg-app-bg/50 rounded-2xl border border-app-border border-l-4 border-l-success shadow-sm group hover:scale-[1.02] transition-all">
              <div className="text-xs font-black text-text-dim uppercase tracking-widest mb-2">{t('ai_planner.savings_target')}</div>
              <div className="text-3xl font-black text-text-main">
                ₹{prediction.savingsTarget.toFixed(0).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            
            {/* Budget Plan Card */}
            <div className="p-8 bg-primary/5 rounded-3xl border border-primary/20 shadow-sm">
              <h3 className="text-lg font-black mb-6 text-primary uppercase tracking-widest">{t('ai_planner.recommended_limits')}</h3>
              <div className="space-y-4">
                {prediction.recommendedBudget.length > 0 ? prediction.recommendedBudget.map(cat => (
                  <div key={cat.category} className="flex justify-between items-center pb-4 border-b border-app-border last:border-0">
                    <span className="text-sm font-bold text-text-main">{t(`categories.${cat.category}`)}</span>
                    <span className="text-sm text-text-muted font-black">{t('ai_planner.limit')}: ₹{cat.limit.toFixed(0)}</span>
                  </div>
                )) : <span className="text-sm text-text-dim italic">{t('ai_planner.log_more')}</span>}
              </div>
            </div>

            {/* Financial Recommendations List */}
            <div className="p-8 bg-app-card rounded-3xl border border-app-border shadow-sm">
              <h3 className="text-lg font-black mb-6 text-text-main uppercase tracking-widest">{t('ai_planner.financial_insights')}</h3>
              <ul className="space-y-4">
                {prediction.recommendations.map((rec, i) => (
                  <li key={i} className="flex gap-4 text-sm text-text-muted font-medium leading-relaxed">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      ) : (
        <div className="py-16 text-center">
          {loading ? (
             <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <div className="text-primary font-black uppercase tracking-[0.2em]">{t('ai_planner.running')}</div>
             </div>
          ) : (
             <p className="text-text-muted font-bold text-lg">{t('ai_planner.no_prediction')}</p>
          )}
        </div>
      )}
    </div>
  );
}
