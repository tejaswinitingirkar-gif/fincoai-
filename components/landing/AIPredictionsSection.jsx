'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { BrainCircuit } from 'lucide-react';

export default function AIPredictionsSection() {
  const { t } = useLanguage();

  return (
    <section id="predictions" className="py-32 px-6 relative overflow-hidden bg-dark-bg">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto text-center space-y-16 relative z-10">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-sm font-bold mx-auto">
            <BrainCircuit className="w-4 h-4" />
            {t('landing.predictions.badge')}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
            {t('landing.predictions.title')}
          </h2>
          <p className="text-xl text-slate-400 font-light max-w-2xl mx-auto">
            {t('landing.predictions.description')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative max-w-5xl mx-auto"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent blur-3xl -z-10 rounded-3xl"></div>
          
          <div className="bg-dark-card/60 backdrop-blur-2xl border border-white/5 rounded-premium p-8 md:p-12 shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-8">
              <BrainCircuit className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">{t('landing.predictions.card_title')}</h3>
            <p className="text-slate-400 text-lg max-w-2xl mb-10">
              {t('landing.predictions.card_desc')}
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <div className="px-6 py-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{t('landing.predictions.accuracy')}</p>
                <p className="text-xl font-bold text-white italic">{t('landing.predictions.accuracy_val')}</p>
              </div>
              <div className="px-6 py-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{t('landing.predictions.pipeline')}</p>
                <p className="text-xl font-bold text-teal-400 italic">{t('landing.predictions.pipeline_val')}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
