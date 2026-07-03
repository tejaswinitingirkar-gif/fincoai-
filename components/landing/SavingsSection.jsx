'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Target, Plus, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';

export default function SavingsSection() {
  const { t } = useLanguage();

  return (
    <section className="py-32 px-6 relative bg-dark-bg">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
        
        {/* Visual: Savings Mechanism */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex-1 w-full relative"
        >
          <div className="absolute inset-0 bg-secondary/10 blur-[100px] rounded-full -z-10" />

          <div className="bg-dark-card/60 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-12 shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center text-secondary mb-8">
              <Target className="w-10 h-10" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">{t('landing.savings.card_title')}</h3>
            <p className="text-slate-400 max-w-sm mb-10">
              {t('landing.savings.card_desc')}
            </p>
            
            <div className="w-full space-y-4">
              <div className="h-4 bg-white/5 rounded-full p-1 overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: '60%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, delay: 0.5, ease: 'circOut' }}
                  className="h-full bg-gradient-to-r from-secondary to-teal-400 rounded-full"
                />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <span>{t('landing.savings.current_assets')}</span>
                <span>{t('landing.savings.target_objective')}</span>
              </div>
            </div>

            <button className="mt-10 w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white font-bold transition-all flex items-center justify-center gap-2 group">
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              {t('landing.savings.cta')}
            </button>
          </div>
        </motion.div>

        {/* Text: Value Proposition */}
        <div className="flex-1 space-y-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-sm font-bold">
              <TrendingUp className="w-4 h-4" />
              {t('landing.savings.badge')}
            </div>
            <h2 className="text-4xl md:text-6xl font-bold leading-tight">
              {t('landing.savings.title')} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-teal-200">{t('landing.savings.title_accent')}</span>
            </h2>
            <p className="text-xl text-slate-400 font-light leading-relaxed">
              {t('landing.savings.description')}
            </p>
          </div>

          <div className="pt-4">
            <Link href="/signup" className="group flex items-center gap-4 text-white text-lg font-bold hover:gap-6 transition-all">
              {t('landing.savings.footer_cta')}
              <ChevronRight className="w-6 h-6 text-secondary" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
