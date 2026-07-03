'use client';

import { useState } from 'react';
import { Send, User, Mail, MessageSquare, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'react-hot-toast';
import axios from 'axios';

export default function ContactForm() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/support', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        toast.success(t('help.success_support'));
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        toast.error(res.data.error || t('help.error_support'));
      }
    } catch (error) {
      console.error('Support submission error:', error);
      toast.error(error.response?.data?.error || t('help.error_support'));
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full bg-app-bg/50 border border-app-border rounded-xl py-3 pl-11 pr-4 text-sm text-text-main focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder-text-muted/50";

  return (
    <div className="glass-panel border-app-border p-8">
      <h3 className="text-xl font-bold text-text-main mb-2">{t('help.contact_title')}</h3>
      <p className="text-sm text-text-muted mb-8">{t('help.contact_desc')}</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              required
              placeholder={t('help.name')}
              className={inputClasses}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="email"
              required
              placeholder={t('help.email')}
              className={inputClasses}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        <div className="relative">
          <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            required
            placeholder={t('help.subject')}
            className={inputClasses}
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          />
        </div>

        <div className="relative">
          <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-text-muted" />
          <textarea
            required
            rows="5"
            placeholder={t('help.message')}
            className={`${inputClasses} pl-11 py-4 min-h-[120px] resize-none`}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          ></textarea>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={loading}
          type="submit"
          className="w-full btn-primary py-4 flex items-center justify-center gap-2 text-sm font-bold tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <Send className="w-4 h-4" />
              {t('help.submit')}
            </>
          )}
        </motion.button>
      </form>
    </div>
  );
}
