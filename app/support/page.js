'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import Sidebar from '@/components/Layout/Sidebar';
import Navbar from '@/components/Layout/Navbar';
import ContactForm from '@/components/Support/ContactForm';
import FeedbackForm from '@/components/Support/FeedbackForm';
import FAQSection from '@/components/Support/FAQSection';
import LiveHelpCard from '@/components/Support/LiveHelpCard';
import { Toaster } from 'react-hot-toast';

export default function SupportPage() {
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
    
    const parsedUser = JSON.parse(storedUser);
    setTimeout(() => {
      setUser(parsedUser);
      setLoading(false);
    }, 0);
  }, []);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg flex transition-colors duration-300">
      <Toaster position="top-right" />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 ml-0 lg:ml-64 min-h-screen flex flex-col">
        <Navbar user={user} onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto"
          >
            <div className="mb-10">
              <h1 className="text-3xl font-bold text-text-main mb-2">{t('help.title')}</h1>
              <p className="text-text-muted font-medium">{t('help.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Forms */}
              <div className="lg:col-span-2 space-y-8">
                <ContactForm />
                <FeedbackForm />
              </div>

              {/* Right Column: Info & FAQ */}
              <div className="space-y-8">
                <LiveHelpCard />
                <FAQSection />
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
