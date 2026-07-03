'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Home, GraduationCap, Rocket, Sparkles, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RoleSelectionPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleSelectRole = async (role) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ role }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Profile configured! Welcome to your dashboard.');
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Set cookie for middleware
        document.cookie = `token=${data.token}; path=/; max-age=604800; SameSite=Lax`;
        
        router.push('/dashboard');
      } else {
        setError(data.error || 'Failed to update role');
        toast.error(data.error || 'Failed to update role');
      }
    } catch (err) {
      setError('An error occurred while setting your profile');
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    {
      id: 'Employee',
      icon: Briefcase,
      color: 'bg-primary',
      title: t('roles.employee'),
      description: t('roles_page.desc_employee')
    },
    {
      id: 'Homemaker',
      icon: Home,
      color: 'bg-secondary',
      title: t('roles.homemaker'),
      description: t('roles_page.desc_homemaker')
    },
    {
      id: 'Student',
      icon: GraduationCap,
      color: 'bg-success',
      title: t('roles.student'),
      description: t('roles_page.desc_student')
    },
    {
      id: 'Freelancer / Self-Employed',
      icon: Rocket,
      color: 'bg-warning',
      title: t('roles.freelancer'),
      description: t('roles_page.desc_freelancer')
    },
    {
      id: 'Other',
      icon: Sparkles,
      color: 'bg-slate-600',
      title: t('roles.other'),
      description: t('roles_page.desc_other')
    }
  ];

  return (
    <div className="min-h-screen bg-app-bg text-text-main flex items-center justify-center p-8 relative overflow-hidden transition-colors duration-300">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -mr-64 -mt-64 pointer-events-none" />

      <div className="absolute top-8 right-8 z-50">
        <LanguageSelector />
      </div>

      <div className="max-w-6xl w-full space-y-12 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h1 className="text-5xl font-black text-text-main tracking-tight">{t('roles_page.choose_profile')}</h1>
          <p className="text-text-muted text-xl max-w-2xl mx-auto font-medium">
            {t('roles_page.choose_desc')}
          </p>
        </motion.div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-error/10 border border-error/20 rounded-2xl text-error font-bold flex items-center gap-3 justify-center max-w-md mx-auto"
          >
            <ShieldAlert className="w-5 h-5" />
            {error}
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {categories.map((cat, i) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelectRole(cat.id)}
              disabled={loading}
              className="glass-panel p-8 text-center flex flex-col items-center gap-6 group hover:border-primary/50 bg-app-card border-app-border shadow-xl transition-all duration-300"
            >
              <div className={`w-20 h-20 rounded-3xl ${cat.color} flex items-center justify-center text-white shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                <cat.icon className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-text-main">{cat.title}</h3>
                <p className="text-[10px] text-text-dim leading-relaxed font-black uppercase tracking-widest">{cat.description}</p>
              </div>
            </motion.button>
          ))}
        </div>
        
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-app-bg/90 backdrop-blur-md z-[100] flex items-center justify-center"
            >
              <div className="flex flex-col items-center gap-4">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full"
                />
                <p className="text-text-main text-xl font-black italic tracking-widest animate-pulse">{t('roles_page.setting_up')}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
