'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import AIInsights from '@/components/AIInsights';
import DashboardCharts from '@/components/DashboardCharts';
import CibilSection from '@/components/CibilSection';
import GoalPlanner from '@/components/GoalPlanner';
import { Plus, Trash2, ArrowUpCircle, ArrowDownCircle, History, Filter, Upload } from 'lucide-react';

import PageContainer from '@/components/shared/PageContainer';
import SectionCard from '@/components/shared/SectionCard';
import DashboardLayout from '@/components/shared/DashboardLayout';
import CSVUploadModal from '@/components/Transactions/CSVUploadModal';
import CustomSelect from '@/components/shared/CustomSelect';
import { formatCurrency } from '@/utils/formatCurrency';


export default function EmployeeDashboard({ user }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  

  const { t, language } = useLanguage();
  const [transactions, setTransactions] = useState([]);
  
  const currentDate = new Date();
  const defaultMonthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState(defaultMonthStr);

  const incomeCategories = ['Salary', 'Bonus', 'Investments', 'Freelance', 'Other'];
  const expenseCategories = ['Rent / Housing', 'Groceries', 'Food / Dining', 'Utility Bills', 'Insurance', 'EMI / Loans', 'Shopping', 'Healthcare', 'Miscellaneous'];

  const [income, setIncome] = useState({ amount: '', category: incomeCategories[0], description: '', date: new Date().toISOString().split('T')[0] });
  const [expense, setExpense] = useState({ amount: '', category: expenseCategories[0], description: '', date: new Date().toISOString().split('T')[0] });
  const [loading, setLoading] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

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
    }
  };

  useEffect(() => { fetchTransactions(); }, []);

  const handleTransaction = async (type, payload) => {
    setLoading(true);
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ ...payload, type })
      });
      if (res.ok) {
        fetchTransactions();
        if (type === 'Income') setIncome({ amount: '', category: incomeCategories[0], description: '', date: new Date().toISOString().split('T')[0] });
        else setExpense({ amount: '', category: expenseCategories[0], description: '', date: new Date().toISOString().split('T')[0] });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteTx = async (id) => {
    try {
      const res = await fetch(`/api/transactions?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) fetchTransactions();
    } catch (err) {
      console.error(err);
    }
  };

  const monthlyTransactions = transactions.filter(t => (typeof t.date === 'string' ? t.date.substring(0, 7) : new Date(t.date).toISOString().substring(0, 7)) === selectedMonth);

  
  if (!mounted) return null;

  return (
    <PageContainer>
      <DashboardLayout
        topSection={
          <>
            <CibilSection user={user} />
            <GoalPlanner user={user} />
          </>
        }
        mainSection={
          <>
            <DashboardCharts 
              transactions={transactions} 
              selectedMonth={selectedMonth} 
              onMonthChange={setSelectedMonth} 
            />

            <SectionCard 
              title={t('dash.quick_log')} 
              icon={Plus}
              headerAction={
                <button 
                  onClick={() => setIsUploadModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-text-main bg-app-bg/50 hover:bg-primary hover:text-white rounded-lg transition-all border border-app-border group"
                >
                  <Upload className="w-3.5 h-3.5 text-primary group-hover:text-white transition-colors" />
                  {t('dash.upload_csv')}
                </button>
              }
            >
              <CSVUploadModal 
                isOpen={isUploadModalOpen} 
                onClose={() => setIsUploadModalOpen(false)} 
                onRefresh={fetchTransactions}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Income Form */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-success">
                    <ArrowUpCircle className="w-5 h-5" />
                    <span className="font-bold uppercase tracking-widest text-xs">{t('dash.add_income')}</span>
                  </div>
                  <div className="space-y-4">
                    <input 
                      type="number" 
                      placeholder={t('dash.amount_placeholder')} 
                      className="input-premium" 
                      value={income.amount} 
                      onChange={e => setIncome({...income, amount: e.target.value})} 
                    />
                    <CustomSelect 
                      value={t(`categories.${income.category}`)} 
                      onChange={val => {
                        const originalCat = incomeCategories.find(c => t(`categories.${c}`) === val) || val;
                        setIncome({...income, category: originalCat});
                      }}
                      options={incomeCategories.map(cat => t(`categories.${cat}`))}
                    />
                    <button 
                      onClick={() => handleTransaction('Income', { amount: Number(income.amount), category: income.category, description: income.description || 'Income', date: income.date })}
                      disabled={loading || !income.amount}
                      className="btn-primary w-full py-3 from-success to-emerald-500 shadow-success/20"
                    >
                      {t('dash.post_income')}
                    </button>
                  </div>
                </div>

                <div className="hidden md:block w-px bg-app-border/50"></div>

                {/* Expense Form */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-error">
                    <ArrowDownCircle className="w-5 h-5" />
                    <span className="font-bold uppercase tracking-widest text-xs">{t('dash.add_expense')}</span>
                  </div>
                  <div className="space-y-4">
                    <input 
                      type="number" 
                      placeholder={t('dash.amount_placeholder')} 
                      className="input-premium" 
                      value={expense.amount} 
                      onChange={e => setExpense({...expense, amount: e.target.value})} 
                    />
                    <CustomSelect 
                      value={t(`categories.${expense.category}`)} 
                      onChange={val => {
                        const originalCat = expenseCategories.find(c => t(`categories.${c}`) === val) || val;
                        setExpense({...expense, category: originalCat});
                      }}
                      options={expenseCategories.map(cat => t(`categories.${cat}`))}
                    />
                    <button 
                      onClick={() => handleTransaction('Expense', { amount: Number(expense.amount), category: expense.category, description: expense.description || 'Expense', date: expense.date })}
                      disabled={loading || !expense.amount}
                      className="btn-primary w-full py-3 from-error to-rose-500 shadow-error/20"
                    >
                      {t('dash.post_expense')}
                    </button>
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard 
              title={t('dash.history')} 
              icon={History}
              headerAction={
                <div className="flex items-center gap-2 text-xs font-bold text-text-muted">
                  <Filter className="w-4 h-4 text-primary" />
                  {t('dash.latest_records')} {monthlyTransactions.length}
                </div>
              }
              className="!p-0"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-widest text-text-muted border-b border-app-border bg-app-bg/10">
                      <th className="px-6 py-4">{t('dash.table_date')}</th>
                      <th className="px-6 py-4">{t('dash.table_category')}</th>
                      <th className="px-6 py-4">{t('dash.table_status')}</th>
                      <th className="px-6 py-4 text-right">{t('dash.table_amount')}</th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-app-border">
                    {monthlyTransactions.map((t_item) => (
                      <tr key={t_item._id} className="hover:bg-primary/[0.02] transition-colors group">
                        <td className="px-6 py-4 text-sm text-text-muted">{new Date(t_item.date).toLocaleDateString(language === 'hi' ? 'hi-IN' : language === 'te' ? 'te-IN' : 'en-IN')}</td>
                        <td className="px-6 py-4 font-bold text-text-main text-sm">{t(`categories.${t_item.category}`)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${
                            t_item.type === 'Income' ? 'bg-success/10 text-success border border-success/20' : 'bg-error/10 text-error border border-error/20'
                          }`}>
                            {t_item.type === 'Income' ? t('tx.income') : t('tx.expense')}
                          </span>
                        </td>
                        <td className={`px-6 py-4 text-right font-black ${
                          t_item.type === 'Income' ? 'text-success' : 'text-error'
                        }`}>
                          {t_item.type === 'Income' ? '+' : '-'}₹{t_item.amount.toLocaleString(language === 'hi' ? 'hi-IN' : language === 'te' ? 'te-IN' : 'en-IN')}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => deleteTx(t_item._id)} className="p-2 text-text-dim hover:text-error transition-colors opacity-0 group-hover:opacity-100">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </>
        }
        sideSection={
          <AIInsights transactions={transactions} role="Employee" />
        }
      />
    </PageContainer>
  );
}
