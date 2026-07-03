'use client';

import { useState } from 'react';
import { Home, PieChart, Target, User, Settings, LogOut, LayoutDashboard, CreditCard, TrendingUp, HelpCircle, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import BrandLogo from '@/components/BrandLogo';

const menuItems = [
  { icon: LayoutDashboard, labelKey: 'nav.dashboard', path: '/dashboard' },
  { icon: TrendingUp, labelKey: 'nav.prediction', path: '/prediction' },
  { icon: PieChart, labelKey: 'nav.transactions', path: '/transactions' },
  { icon: Target, labelKey: 'nav.goals', path: '/goals' },
  { icon: CreditCard, labelKey: 'nav.cibil', path: '/cibil' },
  { icon: User, labelKey: 'nav.profile', path: '/profile' },
  { icon: HelpCircle, labelKey: 'nav.help', path: '/support' },
  { icon: Settings, labelKey: 'nav.settings', path: '/settings' },
];

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <>
      {/* Backdrop for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={`fixed left-0 top-0 h-screen w-64 bg-app-sidebar/80 backdrop-blur-xl border-r border-app-border p-6 flex flex-col z-[70] transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-12 flex items-center justify-between px-2">
          <div className="flex items-center gap-4">
            <BrandLogo size={40} />
            <div className="flex flex-col">
              <h1 className="text-xl font-bold tracking-[0.15em] bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent leading-none">FINCO</h1>
              <span className="text-[10px] font-bold text-text-muted tracking-[0.3em] uppercase mt-1">{t('dashboard.overview')}</span>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-3 -mr-2 text-text-muted hover:text-primary transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link key={item.path} href={item.path} onClick={onClose}>
                <div className={`nav-item ${isActive ? 'nav-item-active' : ''}`}>
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-text-muted transition-colors group-hover:text-primary'}`} />
                  <span className="font-medium">{t(item.labelKey)}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="sidebar-active"
                      className="absolute right-0 w-1 h-6 bg-primary rounded-l-full shadow-[0_0_10px_rgba(79,70,229,0.4)]"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

      <div className="mt-auto pt-6 border-t border-app-border">
        <button 
          onClick={() => { 
            localStorage.removeItem('token'); 
            localStorage.removeItem('user');
            document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            window.location.href = '/login'; 
          }}
          className="nav-item w-full text-error hover:bg-error/10 hover:text-error"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">{t('nav.logout')}</span>
        </button>
      </div>
      </aside>
    </>
  );
}
