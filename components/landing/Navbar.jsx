'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import BrandLogo from '@/components/BrandLogo';
import LanguageSelector from '@/components/LanguageSelector';
import { useLanguage } from '@/context/LanguageContext';

export default function Navbar() {
  const { t } = useLanguage();

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4 backdrop-blur-xl bg-dark-bg/40 border-b border-white/5"
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="group flex items-center gap-3 relative">
          {/* Logo with Hover & Load Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: 1.03 }}
            className="relative"
          >
            <BrandLogo size={40} />
            {/* Ambient glow behind logo */}
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
          </motion.div>

          {/* Brand Text with Staggered Entrance */}
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
          >
            <span className="text-2xl font-bold tracking-[0.12em] bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent drop-shadow-sm">
              FINCO
            </span>
          </motion.div>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <LanguageSelector />
          <Link href="#features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors relative group">
            {t('landing.nav_landing.features')}
            <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-secondary transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link href="#predictions" className="text-sm font-medium text-slate-300 hover:text-white transition-colors relative group">
            {t('landing.nav_landing.predictions')}
            <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-secondary transition-all duration-300 group-hover:w-full"></span>
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-bold text-slate-300 hover:text-white transition-colors hidden sm:block">
            {t('auth.login_btn')}
          </Link>
          <Link href="/signup" className="relative group overflow-hidden rounded-full p-[1px]">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative bg-dark-bg/90 backdrop-blur-md px-6 py-2 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-white transition-colors">
                {t('landing.nav_landing.get_started')}
              </span>
            </div>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
