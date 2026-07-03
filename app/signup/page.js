'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ArrowRight, Shield, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import GrowthBackground from '@/components/landing/GrowthBackground';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';
import BrandLogo from '@/components/BrandLogo';

export default function SignupPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Account created successfully!');
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Set cookie for middleware
        document.cookie = `token=${data.token}; path=/; max-age=604800; SameSite=Lax`;
        
        router.push('/role-selection');
      } else {
        setError(data.error || 'Signup failed');
        toast.error(data.error || 'Signup failed');
      }
    } catch (err) {
      setError('An error occurred during signup');
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-bg text-text-main relative overflow-hidden flex items-center justify-center p-8 transition-colors duration-300">
      <GrowthBackground />
      
      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />



      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel w-full max-w-md p-10 relative z-10 border-app-border bg-app-card/80 backdrop-blur-xl shadow-2xl transition-colors duration-300"
      >
        <div className="flex flex-col items-center mb-10 text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-tr from-primary to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 transition-transform hover:rotate-3">
            <User className="text-white w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-text-main tracking-tight">{t('auth.create_account')}</h1>
            <p className="text-text-muted text-sm mt-1 font-medium">Join the future of intelligent finance</p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-error text-xs font-bold mb-6 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-dim ml-1">{t('auth.fullname')}</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                className="input-premium pl-11" 
                placeholder="John Doe" 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                required 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-dim ml-1">{t('auth.email')}</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim group-focus-within:text-primary transition-colors" />
              <input 
                type="email" 
                className="input-premium pl-11" 
                placeholder="name@company.com" 
                value={formData.email} 
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                required 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-dim ml-1">{t('auth.password')}</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim group-focus-within:text-primary transition-colors" />
              <input 
                type={showPassword ? "text" : "password"} 
                className="input-premium pl-11 pr-11" 
                placeholder="••••••••" 
                value={formData.password} 
                onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                required 
                minLength={6} 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-dim hover:text-primary transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary w-full py-4 text-lg mt-4 shadow-xl shadow-primary/30 group overflow-hidden relative" 
            disabled={loading}
          >
            <span className="relative z-10 flex items-center justify-center">
              {loading ? t('auth.creating') : 'Sign Up'}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </form>

        <p className="mt-10 text-center text-sm text-text-muted font-medium">
          {t('auth.has_account')} <Link href="/login" className="text-primary font-black hover:underline ml-1">Login</Link>
        </p>
      </motion.div>
    </div>
  );
}
