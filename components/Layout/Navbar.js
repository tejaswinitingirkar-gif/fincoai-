'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Search, User, ChevronDown, LogOut, Settings, Shield, Zap, Sun, Moon, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';
import { useTheme } from 'next-themes';
import Link from 'next/link';

const getRoleKey = (roleName) => {
  if (!roleName) return 'other';
  const r = roleName.toLowerCase();
  if (r.includes('employee')) return 'employee';
  if (r.includes('student')) return 'student';
  if (r.includes('freelancer')) return 'freelancer';
  if (r.includes('homemaker')) return 'homemaker';
  return 'other';
};

export default function Navbar({ user, onMenuClick }) {
  const { t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
  }, []);
  
  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear cookie
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    
    window.location.href = '/login';
  };

  return (
    <header className="h-20 border-b border-app-border bg-app-bg/80 backdrop-blur-xl px-4 md:px-8 flex items-center justify-between sticky top-0 z-40 transition-all duration-500">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-3 -ml-2 text-text-muted hover:text-primary transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex-1 max-w-xl hidden sm:block">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder={t('nav.search_placeholder')} 
              className="w-full bg-app-bg/50 border border-app-border rounded-xl py-2.5 pl-11 pr-4 text-sm text-text-main focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder-text-muted/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        {/* Theme Toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-xl text-text-muted hover:text-primary hover:bg-primary/5 transition-all"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        )}

        {/* Language Selector */}
        <div className="hidden sm:block">
          <LanguageSelector />
        </div>

        <div className="hidden sm:block h-8 w-px bg-app-border"></div>


        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <motion.button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center gap-3 p-1.5 pr-4 rounded-xl transition-all ${showUserMenu ? 'bg-primary/10' : 'hover:bg-primary/5'}`}
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-semibold text-text-main leading-tight">{user?.name || 'User'}</p>
              <p className="text-xs text-text-muted leading-tight capitalize">
                {user?.role ? t(`roles.${getRoleKey(user.role)}`) : t('nav.profile')}
              </p>
            </div>
            <ChevronDown className={`w-4 h-4 text-text-muted transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
          </motion.button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-4 w-56 glass-panel border-app-border overflow-hidden shadow-2xl"
              >
                <div className="p-2">
                  {user?.role === 'Admin' && (
                    <Link href="/admin/help" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all group mb-1">
                      <Shield className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-bold">{t('admin.title')}</span>
                    </Link>
                  )}
                  <Link href="/profile" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/5 text-text-muted hover:text-primary transition-all group">
                    <User className="w-4 h-4 group-hover:text-primary transition-colors" />
                    <span className="text-sm font-medium">{t('nav.my_profile')}</span>
                  </Link>
                  <Link href="/settings" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/5 text-text-muted hover:text-primary transition-all group">
                    <Settings className="w-4 h-4 group-hover:text-secondary transition-colors" />
                    <span className="text-sm font-medium">{t('nav.settings')}</span>
                  </Link>
                  <div className="h-px bg-app-border my-2"></div>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-error/10 text-text-muted hover:text-error transition-all w-full group"
                  >
                    <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    <span className="text-sm font-medium">{t('nav.secure_logout')}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
