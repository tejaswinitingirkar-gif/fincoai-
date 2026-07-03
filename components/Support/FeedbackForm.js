'use client';

import { useState } from 'react';
import { Star, MessageCircle, AlertCircle, Sparkles, Layout, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'react-hot-toast';
import axios from 'axios';

export default function FeedbackForm() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');

  const categories = [
    { id: 'Bug Report', icon: AlertCircle, color: 'text-error' },
    { id: 'Feature Request', icon: Sparkles, color: 'text-secondary' },
    { id: 'UI Improvement', icon: Layout, color: 'text-primary' },
    { id: 'AI Prediction Issue', icon: HelpCircle, color: 'text-amber-500' },
    { id: 'General Feedback', icon: MessageCircle, color: 'text-text-muted' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return toast.error('Please select a rating');
    if (!category) return toast.error('Please select a category');

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/feedback', { rating, category, message }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        toast.success(t('help.success_feedback'));
        setRating(0);
        setCategory('');
        setMessage('');
      } else {
        toast.error(t('help.error_feedback'));
      }
    } catch (error) {
      console.error('Feedback submission error:', error);
      toast.error(t('help.error_feedback'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel border-app-border p-8">
      <h3 className="text-xl font-bold text-text-main mb-2">{t('help.feedback_title')}</h3>
      <p className="text-sm text-text-muted mb-8">{t('help.feedback_desc')}</p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Rating */}
        <div className="flex flex-col items-center gap-4 py-4 bg-primary/5 rounded-2xl border border-primary/10">
          <p className="text-sm font-medium text-text-muted">{t('help.rating')}</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1 transition-transform hover:scale-125"
              >
                <Star
                  className={`w-10 h-10 transition-colors ${
                    star <= (hoverRating || rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-text-muted/30'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-text-muted pl-1">{t('help.category')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                  category === cat.id
                    ? 'border-primary bg-primary/10 text-primary shadow-lg shadow-primary/10'
                    : 'border-app-border bg-app-bg/50 text-text-muted hover:border-primary/50'
                }`}
              >
                <cat.icon className={`w-4 h-4 ${category === cat.id ? 'text-primary' : cat.color}`} />
                <span className="text-sm font-medium">{cat.id}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        <div className="relative">
          <textarea
            required
            rows="4"
            placeholder={t('help.feedback_placeholder')}
            className="w-full bg-app-bg/50 border border-app-border rounded-xl p-4 text-sm text-text-main focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder-text-muted/50 resize-none"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></textarea>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={loading}
          type="submit"
          className="w-full btn-secondary py-4 flex items-center justify-center gap-2 text-sm font-bold tracking-wider disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            t('help.submit_feedback')
          )}
        </motion.button>
      </form>
    </div>
  );
}
