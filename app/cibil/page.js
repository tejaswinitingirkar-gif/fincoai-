'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Layout/Sidebar';
import Navbar from '@/components/Layout/Navbar';
import CibilSection from '@/components/CibilSection';
import { ShieldCheck, TrendingUp, AlertCircle, Info } from 'lucide-react';

export default function CibilPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setTimeout(() => setUser(JSON.parse(storedUser)), 0);
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-app-bg flex transition-colors duration-500">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 ml-0 lg:ml-64 min-h-screen flex flex-col">
        <Navbar user={user} onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-10">
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-black text-text-main">Credit Intelligence</h1>
              <p className="text-text-muted">Behavioral credit scoring powered by Finco Neural Engine.</p>
            </div>

            <CibilSection user={user} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass-panel p-8 space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2 text-text-main">
                  <TrendingUp className="text-primary w-5 h-5" />
                  Growth Strategy
                </h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  To improve your AI-estimated score, focus on maintaining a savings-to-income ratio above 30% and minimize sudden large expenses. Stability is the primary growth driver in our behavioral model.
                </p>
              </div>

              <div className="glass-panel p-8 space-y-4 border-l-4 border-warning">
                <h3 className="text-xl font-bold flex items-center gap-2 text-warning">
                  <AlertCircle className="w-5 h-5" />
                  Risk Assessment
                </h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  High volatility in your monthly spending can negatively impact your credit health simulation. Ensure your utility bills and fixed EMIs are logged consistently to prove reliability.
                </p>
              </div>
            </div>

            <div className="p-6 bg-primary/5 rounded-2xl border border-primary/20 flex gap-4 items-start">
              <Info className="text-primary w-6 h-6 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm text-text-main font-bold">About Finco Behavioral Scoring</p>
                <p className="text-xs text-text-muted leading-relaxed italic">
                  Traditional bureaus focus on credit history. Finco AI focuses on your *future* potential by analyzing your current financial discipline. This score is a simulation of how a modern lender might perceive your risk based on real-time data.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
