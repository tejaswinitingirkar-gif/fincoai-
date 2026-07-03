'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { Shield, Zap, CreditCard, PieChart as PieIcon } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Bank-Grade Security',
    desc: 'Your data is encrypted with 256-bit protocols, ensuring total privacy.',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10'
  },
  {
    icon: Zap,
    title: 'Instant Sync',
    desc: 'Every transaction is logged and categorized the moment it happens.',
    color: 'text-teal-400',
    bg: 'bg-teal-500/10'
  },
  {
    icon: CreditCard,
    title: 'Smart Aggregation',
    desc: 'Connect all your accounts in one place for a holistic financial view.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10'
  }
];

export default function TrackExpensesSection() {
  const { t } = useLanguage();

  const features = [
    {
      icon: Shield,
      title: t('landing.features.f1_title'),
      desc: t('landing.features.f1_desc'),
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10'
    },
    {
      icon: Zap,
      title: t('landing.features.f2_title'),
      desc: t('landing.features.f2_desc'),
      color: 'text-teal-400',
      bg: 'bg-teal-500/10'
    },
    {
      icon: CreditCard,
      title: t('landing.features.f3_title'),
      desc: t('landing.features.f3_desc'),
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10'
    }
  ];

  return (
    <section id="features" className="py-32 px-6 relative bg-dark-bg">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-20 items-center">
        
        {/* Left: Text Content */}
        <div className="flex-1 space-y-10 order-2 lg:order-1">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-6xl font-bold leading-tight">
              {t('landing.features.title')} <br />
              <span className="text-slate-500">{t('landing.features.subtitle')}</span>
            </h2>
            <p className="text-xl text-slate-400 font-light leading-relaxed max-w-xl">
              {t('landing.features.description')}
            </p>
          </div>

          <div className="grid gap-8">
            {features.map((f, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex gap-6 group"
              >
                <div className={`w-14 h-14 rounded-2xl ${f.bg} flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 duration-300`}>
                  <f.icon className={`w-7 h-7 ${f.color}`} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl mb-1">{f.title}</h3>
                  <p className="text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: Visual Feature Highlight */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex-1 relative order-1 lg:order-2"
        >
          <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full -z-10" />
          
          <div className="bg-dark-card/80 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-12 shadow-2xl overflow-hidden flex flex-col items-center justify-center text-center">
             <div className="w-24 h-24 bg-success/10 rounded-3xl flex items-center justify-center text-success mb-8">
                <Shield className="w-12 h-12" />
             </div>
             <h3 className="text-3xl font-bold text-white mb-4">{t('landing.features.highlight_title')}</h3>
             <p className="text-slate-400 max-w-sm mb-8">
               {t('landing.features.highlight_desc')}
             </p>
             <div className="flex gap-2">
                <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {t('landing.features.encrypted')}
                </div>
                <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {t('landing.features.no_selling')}
                </div>
             </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
