'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import TrackExpensesSection from '@/components/landing/TrackExpensesSection';
import AnalyticsSection from '@/components/landing/AnalyticsSection';
import AIPredictionsSection from '@/components/landing/AIPredictionsSection';
import SavingsSection from '@/components/landing/SavingsSection';
import GrowthBackground from '@/components/landing/GrowthBackground';

import { useLanguage } from '@/context/LanguageContext';

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
  }
};

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-dark-bg text-slate-100 overflow-x-hidden selection:bg-primary/30 selection:text-white relative">
      <GrowthBackground />
      <Navbar />

      <main className="relative z-10">
        <HeroSection />
        
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={sectionVariants}>
          <TrackExpensesSection />
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={sectionVariants}>
          <AnalyticsSection />
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={sectionVariants}>
          <AIPredictionsSection />
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={sectionVariants}>
          <SavingsSection />
        </motion.div>
      </main>

      <footer className="py-16 px-6 border-t border-white/5 relative z-10 bg-dark-bg/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-tighter">FINCO</span>
            <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
              {t('landing.footer.tagline')}
            </p>
          </div>
          <div className="flex flex-col md:items-end gap-4">
            <div className="flex gap-8">
              <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">{t('landing.footer.privacy')}</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">{t('landing.footer.terms')}</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">{t('landing.footer.security')}</a>
            </div>
            <p className="text-slate-600 text-[10px] uppercase tracking-widest">{t('landing.footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
