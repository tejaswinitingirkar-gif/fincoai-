'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { PieChart as PieIcon, BarChart3, TrendingUp } from 'lucide-react';

export default function AnalyticsSection() {
  const { t } = useLanguage();

  return (
    <section className="py-32 px-6 relative bg-dark-bg">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
        
        {/* Visual: Analytics Illustration */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="order-2 lg:order-1 grid gap-8"
        >
          <div className="bg-dark-card/60 backdrop-blur-xl border border-white/5 rounded-premium p-12 shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-secondary/10 rounded-3xl flex items-center justify-center text-secondary mb-6">
              <BarChart3 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">{t('landing.analytics.card_title')}</h3>
            <p className="text-slate-400 max-w-sm">
              {t('landing.analytics.card_desc')}
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4 w-full">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="w-8 h-2 bg-primary/40 rounded-full mb-2"></div>
                <div className="w-12 h-2 bg-white/20 rounded-full"></div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="w-10 h-2 bg-secondary/40 rounded-full mb-2"></div>
                <div className="w-6 h-2 bg-white/20 rounded-full"></div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Text Content */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold">
            <TrendingUp className="w-4 h-4" />
            {t('landing.analytics.badge')}
          </div>
          <h2 className="text-4xl md:text-6xl font-bold leading-tight">
            {t('landing.analytics.title')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">{t('landing.analytics.title_accent')}</span>
          </h2>
          <p className="text-xl text-slate-400 font-light leading-relaxed">
            {t('landing.analytics.description')}
          </p>
          
          <div className="space-y-6 pt-4">
            {[
              { t: t('landing.analytics.i1_title'), d: t('landing.analytics.i1_desc') },
              { t: t('landing.analytics.i2_title'), d: t('landing.analytics.i2_desc') },
              { t: t('landing.analytics.i3_title'), d: t('landing.analytics.i3_desc') }
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 text-secondary mt-1">
                  <div className="w-2 h-2 rounded-full bg-current"></div>
                </div>
                <div>
                  <h4 className="text-white font-bold">{item.t}</h4>
                  <p className="text-slate-500 text-sm">{item.d}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
