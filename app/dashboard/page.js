'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

const EmployeeDashboard = dynamic(() => import('@/components/dashboards/EmployeeDashboard'), { 
  loading: () => <div className="h-96 w-full bg-app-card/50 animate-pulse rounded-3xl" />
});
const StudentDashboard = dynamic(() => import('@/components/dashboards/StudentDashboard'), {
  loading: () => <div className="h-96 w-full bg-app-card/50 animate-pulse rounded-3xl" />
});
const HomemakerDashboard = dynamic(() => import('@/components/dashboards/HomemakerDashboard'), {
  loading: () => <div className="h-96 w-full bg-app-card/50 animate-pulse rounded-3xl" />
});
const FreelancerDashboard = dynamic(() => import('@/components/dashboards/FreelancerDashboard'), {
  loading: () => <div className="h-96 w-full bg-app-card/50 animate-pulse rounded-3xl" />
});
const OtherDashboard = dynamic(() => import('@/components/dashboards/OtherDashboard'), {
  loading: () => <div className="h-96 w-full bg-app-card/50 animate-pulse rounded-3xl" />
});

import Sidebar from '@/components/Layout/Sidebar';
import Navbar from '@/components/Layout/Navbar';

export default function Dashboard() {
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!token || !storedUser) {
      window.location.href = '/login';
      return;
    }
    
    setTimeout(() => {
      setUser(JSON.parse(storedUser));
      setLoading(false);
    }, 0);
  }, []);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full"
        />
      </div>
    );
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'Employee': return <EmployeeDashboard user={user} />;
      case 'Student': return <StudentDashboard user={user} />;
      case 'Homemaker': return <HomemakerDashboard user={user} />;
      case 'Freelancer / Self-Employed': return <FreelancerDashboard user={user} />;
      case 'Freelancer': return <FreelancerDashboard user={user} />;
      default: return <OtherDashboard user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-app-bg flex transition-colors duration-300">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 ml-0 lg:ml-64 min-h-screen flex flex-col">
        <Navbar user={user} onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={user.role}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col gap-1">
                  <h1 className="text-3xl font-bold text-text-main">{t('dash_page.title')}</h1>
                  <p className="text-text-muted font-medium">{t('dash_page.welcome').replace('{name}', user.name)}</p>
                </div>
                
                {renderDashboard()}
              </div>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
