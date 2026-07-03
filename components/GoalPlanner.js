'use client';

import { useState, useEffect, useCallback } from 'react';
import { Target, Plus, Calendar, IndianRupee, TrendingUp, AlertCircle, CheckCircle2, ChevronRight, X, Trash2, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '@/utils/formatCurrency';
import { useLanguage } from '@/context/LanguageContext';

import CustomSelect from '@/components/shared/CustomSelect';

export default function GoalPlanner({ user }) {
  const { t, language } = useLanguage();
  const [goals, setGoals] = useState([]);
  const [avgSavings, setAvgSavings] = useState(0);
  const [totalPool, setTotalPool] = useState(0);
  const [avgLast3MonthsSavings, setAvgLast3MonthsSavings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [formData, setFormData] = useState({ name: '', targetAmount: '', priority: 'Medium' });
  const [prediction, setPrediction] = useState(null);
  const [allocateAmounts, setAllocateAmounts] = useState({});

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/goals?lang=${language}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        cache: 'no-store'
      });
      const data = await res.json();
      if (data.success) {
        setGoals(data.data);
        setAvgSavings(data.avgMonthlySavings || 0);
        setAvgLast3MonthsSavings(data.avgLast3MonthsSavings || 0);
        setTotalPool(data.totalNetSavings || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleFormChange = async (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    
    if (newFormData.targetAmount && Number(newFormData.targetAmount) > 0) {
      try {
        const res = await fetch('/api/goal-prediction', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ targetAmount: Number(newFormData.targetAmount), name: newFormData.name, language })
        });
        const result = await res.json();
        if (result.success) {
          setPrediction(result.data);
        }
      } catch (err) {
        console.error("Prediction failed", err);
      }
    } else {
      setPrediction(null);
    }
  };

  const createGoal = async (e) => {
    e.preventDefault();
    const targetDate = prediction?.completionDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];
    
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ ...formData, targetAmount: Number(formData.targetAmount), targetDate })
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || t('goals.error_create'));
        return;
      }
      setIsCreating(false);
      setFormData({ name: '', targetAmount: '', priority: 'Medium' });
      setErrorMsg('');
      fetchGoals();
    } catch (e) {
      setErrorMsg(e.message);
    }
  };

  const deleteGoal = async (id) => {
    if (!confirm(t('goals.delete_confirm'))) return;
    try {
      await fetch(`/api/goals?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      fetchGoals();
    } catch (e) {
      setErrorMsg(e.message);
    }
  };

  const handleContribution = async (goalId, amount) => {
    if (!amount || amount <= 0) return;
    try {
      const res = await fetch(`/api/goals?id=${goalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ addContribution: Number(amount) })
      });
      if (res.ok) {
        setAllocateAmounts({ ...allocateAmounts, [goalId]: '' });
        fetchGoals();
      }
    } catch (e) {
      console.error("Contribution failed", e);
    }
  };

  if (loading && goals.length === 0) {
    return (
      <div className="glass-panel p-10 flex flex-col items-center justify-center gap-4 transition-colors">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full" />
        <p className="text-text-muted font-medium">{t('goals.loading')}</p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Target className="text-primary w-6 h-6" />
            <h2 className="text-2xl font-bold text-text-main">{t('goals.title')}</h2>
          </div>
          <p className="text-text-muted text-sm font-medium">{t('goals.subtitle')}</p>
        </div>
        
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="btn-primary"
        >
          {isCreating ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {isCreating ? t('goals.cancel') : t('goals.new_goal')}
        </button>
      </div>

      {/* Real Savings Pool Indicator */}
      <div className="glass-panel p-4 bg-primary/5 border-primary/20 flex flex-col md:flex-row justify-between items-center gap-4 transition-colors">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-black text-text-dim tracking-widest">{t('goals.total_pool')}</p>
            <h4 className="text-xl font-black text-text-main">₹{totalPool.toLocaleString(language === 'hi' ? 'hi-IN' : language === 'te' ? 'te-IN' : 'en-IN')}</h4>
          </div>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-xs text-text-muted max-w-[200px] font-medium">{t('goals.pool_desc')}</p>
        </div>
      </div>

      <AnimatePresence>
        {isCreating && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="z-50"
          >
            <div className="glass-panel p-8 mb-8 border-primary/30 transition-colors">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-text-main">
                <Plus className="text-primary" />
                {t('goals.define_obj')}
              </h3>
              
              <form onSubmit={createGoal} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-text-muted ml-1">{t('goals.name_label')}</label>
                  <input 
                    name="name" 
                    placeholder={t('goals.name_placeholder')} 
                    className="input-premium"
                    value={formData.name} 
                    onChange={handleFormChange}
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-text-muted ml-1">{t('goals.target_label')}</label>
                  <input 
                    name="targetAmount" 
                    type="number" 
                    placeholder={t('goals.target_placeholder')} 
                    className="input-premium"
                    value={formData.targetAmount} 
                    onChange={handleFormChange}
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-text-muted ml-1">{t('goals.priority_label')}</label>
                  <CustomSelect 
                    value={t(`goals.prob_${formData.priority.toLowerCase()}`) || formData.priority}
                    onChange={val => {
                      const priorityMap = {
                        [t('goals.prob_high')]: 'High',
                        [t('goals.prob_moderate')]: 'Medium',
                        [t('goals.prob_low')]: 'Low'
                      };
                      const originalPriority = Object.keys(priorityMap).find(k => k === val) ? priorityMap[val] : 'Medium';
                      handleFormChange({ target: { name: 'priority', value: originalPriority } });
                    }}
                    options={[t('goals.prob_high'), t('goals.prob_moderate'), t('goals.prob_low')]} 
                  />
                </div>

                {prediction && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:col-span-2 lg:col-span-3 space-y-4"
                  >
                    <div className="p-6 bg-primary/10 rounded-3xl border border-primary/20 transition-colors">
                      <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                            <TrendingUp className="w-8 h-8" />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-black text-text-dim tracking-widest">{t('goals.timeline')}</p>
                            <h4 className="text-2xl font-black text-text-main">
                              {prediction.monthsRemaining} {prediction.monthsRemaining === 1 ? t('goals.month') : t('goals.months')}
                            </h4>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${prediction.successProbability > 70 ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
                            <div className="text-xl font-black">{prediction.successProbability}%</div>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-black text-text-dim tracking-widest">{t('goals.success_prob')}</p>
                            <h4 className="text-lg font-bold text-text-main">
                              {prediction.successProbability > 70 ? t('goals.prob_high') : t('goals.prob_moderate')}
                            </h4>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-secondary/20 text-secondary flex items-center justify-center">
                            <IndianRupee className="w-7 h-7" />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-black text-text-dim tracking-widest">{t('goals.req_monthly')}</p>
                            <h4 className="text-2xl font-black text-text-main">₹{Number(prediction.requiredMonthly).toLocaleString(language === 'hi' ? 'hi-IN' : language === 'te' ? 'te-IN' : 'en-IN')}</h4>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 pt-6 border-t border-app-border">
                        <p className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" /> {t('goals.ai_recs')}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {prediction.insights.map((insight, idx) => (
                            <div key={idx} className="flex gap-2 text-sm text-text-muted font-medium">
                              <span className="text-primary mt-1">•</span> {insight}
                            </div>
                          ))}
                          {prediction.adjustments.map((adj, idx) => (
                            <div key={idx} className="flex gap-2 text-sm text-success bg-success/5 p-3 rounded-xl border border-success/10 font-medium">
                              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> {adj}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="md:col-span-2 lg:col-span-3 flex justify-end">
                  <button type="submit" className="btn-primary px-8 py-3">{t('goals.launch')}</button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {errorMsg && (
        <div className="p-4 bg-error/10 border border-error/20 rounded-2xl flex items-center gap-3 text-error">
          <AlertCircle className="w-5 h-5" />
          <p className="font-medium">{errorMsg}</p>
        </div>
      )}

      {/* Goals Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {goals.map((goal) => {
          const progress = Math.min(100, (goal.savedAmount / goal.targetAmount) * 100);
          const amtRem = goal.targetAmount - goal.savedAmount;
          const isCompleted = amtRem <= 0;
          
          return (
            <motion.div 
              layout
              key={goal._id}
              className="glass-panel p-6 flex flex-col gap-6 group transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${isCompleted ? 'bg-success/20 text-success' : 'bg-primary/20 text-primary'}`}>
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-text-main">{goal.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${
                        goal.priority === 'High' ? 'bg-error/20 text-error' : 'bg-warning/20 text-warning'
                      }`}>
                        {t('goals.priority_level').replace('{level}', t(`goals.prob_${goal.priority.toLowerCase()}`) || goal.priority)}
                      </span>
                      <span className="text-xs text-text-dim font-bold flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-primary" /> {t('goals.target_date').replace('{date}', new Date(goal.targetDate).toLocaleDateString(language === 'hi' ? 'hi-IN' : language === 'te' ? 'te-IN' : 'en-IN'))}
                      </span>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => deleteGoal(goal._id)}
                  className="p-2 text-text-dim hover:text-error transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-app-bg/50 rounded-2xl p-4 border border-app-border transition-colors">
                  <p className="text-[10px] uppercase text-text-dim font-black mb-1 tracking-tighter">{t('goals.target_label').split(' (')[0]}</p>
                  <p className="text-lg font-black text-text-main">₹{(goal.targetAmount/1000).toFixed(0)}k</p>
                </div>
                <div className="bg-app-bg/50 rounded-2xl p-4 border border-app-border transition-colors">
                  <p className="text-[10px] uppercase text-text-dim font-black mb-1 tracking-tighter">{t('goals.saved')}</p>
                  <p className="text-lg font-black text-success">₹{(goal.savedAmount/1000).toFixed(0)}k</p>
                </div>
                <div className="bg-app-bg/50 rounded-2xl p-4 border border-app-border transition-colors">
                  <p className="text-[10px] uppercase text-text-dim font-black mb-1 tracking-tighter">{t('goals.remaining')}</p>
                  <p className="text-lg font-black text-primary">₹{(amtRem/1000).toFixed(0)}k</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted font-bold">{progress.toFixed(1)}% {t('goals.progress')}</span>
                  <span className="text-text-main font-black tracking-tight">{isCompleted ? t('goals.achieved') : t('goals.to_go').replace('{amount}', formatCurrency(amtRem, language))}</span>
                </div>
                <div className="h-3 bg-app-bg rounded-full p-0.5 overflow-hidden border border-app-border">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className={`h-full rounded-full ${isCompleted ? 'bg-success shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'bg-gradient-to-r from-primary to-secondary shadow-[0_0_15px_rgba(79,70,229,0.5)]'}`}
                  />
                </div>
              </div>

              {!isCompleted && (
                <div className="pt-6 border-t border-app-border space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {goal.isRealistic ? (
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-error" />
                      )}
                      <span className={`text-sm font-bold ${goal.isRealistic ? 'text-success' : 'text-error'}`}>
                        {goal.isRealistic ? t('goals.on_track') : t('goals.needs_attention')}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase text-text-dim font-black">{t('goals.recommended')}</p>
                      <p className="text-sm font-black text-text-main">₹{goal.recommendedSavings?.toFixed(0) || '---'}/mo</p>
                    </div>
                  </div>

                  <div className="flex gap-2 p-2 bg-app-bg/50 rounded-2xl border border-app-border transition-colors">
                    <div className="relative flex-1">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                      <input 
                        type="number" 
                        placeholder={t('goals.add_extra')} 
                        className="w-full bg-transparent border-none pl-9 pr-4 py-2 text-sm text-text-main font-bold focus:ring-0 placeholder:text-text-dim/60" 
                        value={allocateAmounts[goal._id] || ''}
                        onChange={(e) => setAllocateAmounts({ ...allocateAmounts, [goal._id]: e.target.value })}
                      />
                    </div>
                    <button 
                      onClick={() => handleContribution(goal._id, allocateAmounts[goal._id])}
                      className="bg-primary hover:bg-primary/80 text-white px-5 py-2 rounded-xl text-xs font-black transition-all shadow-lg shadow-primary/20"
                    >
                      {t('goals.save_btn')}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
