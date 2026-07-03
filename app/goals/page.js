'use client';

import { useState, useEffect } from 'react';
import { Target, TrendingUp, ShieldCheck, ArrowLeft, Plus } from 'lucide-react';
import Sidebar from '@/components/Layout/Sidebar';
import Navbar from '@/components/Layout/Navbar';
import GoalPlanner from '@/components/GoalPlanner';

export default function GoalsPage() {
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
            <div>
              <h1 className="text-3xl font-black text-text-main">Financial Aspirations</h1>
              <p className="text-text-muted">Track and optimize your long-term wealth milestones.</p>
            </div>

            {/* Reuse the redesigned GoalPlanner component which now matches the theme */}
            <GoalPlanner user={user} />

            {/* Additional Goals Insights Card */}
            <div className="glass-panel p-8 flex items-center gap-6 border-l-4 border-secondary">
              <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="text-xl font-bold text-text-main">Neural Feasibility Engine</h3>
                <p className="text-text-muted text-sm">Our AI models analyze your spending volatility to provide realistic target dates for each goal.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
