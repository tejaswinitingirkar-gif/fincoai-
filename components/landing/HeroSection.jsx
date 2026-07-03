'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import AnimatedPiggyBank from './AnimatedPiggyBank';
import { useLanguage } from '@/context/LanguageContext';

/**
 * Refined HeroSection
 * - Split layout: Text (Left) | Visuals (Right)
 * - Integrated LiveGrowthGraph
 * - Staggered entrance animations
 * - Premium micro-interactions
 */
export default function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-12 overflow-hidden">
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">
        
        {/* Left: Text Content */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0, x: -30 },
            visible: { opacity: 1, x: 0, transition: { staggerChildren: 0.2, duration: 0.8 } }
          }}
          className="order-2 lg:order-1 flex flex-col items-start text-left"
        >
          <motion.div
            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
              {t('landing.hero.badge')}
            </span>
          </motion.div>
          <motion.h1
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight leading-[1.1] mb-6"
          >
            {t('landing.hero.title')} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-teal-200">
              {t('landing.hero.title_accent')}
            </span>
          </motion.h1>

          <motion.p
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="text-xl md:text-2xl text-slate-400 max-w-xl leading-relaxed font-light mb-12"
          >
            {t('landing.hero.description')}
          </motion.p>

          <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto"
          >
            <Link href="/signup" className="w-full sm:w-auto group">
              <div className="relative btn-primary py-4 px-10 text-lg group-hover:scale-[1.03] transition-transform duration-300 flex items-center justify-center gap-3">
                {t('landing.hero.cta_primary')}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link href="#features" className="w-full sm:w-auto group">
              <div className="flex items-center justify-center gap-2 text-slate-400 hover:text-white transition-colors py-4 px-6 font-bold">
                {t('landing.hero.cta_secondary')}
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </motion.div>
        </motion.div>

        {/* Right: Visual Hero Focus */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="order-1 lg:order-2 relative"
        >
          {/* Main Visual: Piggy Bank Hero */}
          <div className="relative w-full h-[500px] lg:h-[600px] flex items-center justify-center">
            <AnimatedPiggyBank />
          </div>
        </motion.div>

      </div>
    </section>
  );
}
