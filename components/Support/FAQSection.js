'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

export default function FAQSection() {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    { q: t('help.faq.q1'), a: t('help.faq.a1') },
    { q: t('help.faq.q2'), a: t('help.faq.a2') },
    { q: t('help.faq.q3'), a: t('help.faq.a3') },
    { q: t('help.faq.q4'), a: t('help.faq.a4') },
    { q: t('help.faq.q5'), a: t('help.faq.a5') },
    { q: t('help.faq.q6'), a: t('help.faq.a6') },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <HelpCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-text-main">{t('help.faq_title')}</h3>
          <p className="text-sm text-text-muted">{t('help.faq_desc')}</p>
        </div>
      </div>

      <div className="grid gap-3">
        {faqs.map((faq, index) => (
          <div 
            key={index}
            className="glass-panel border-app-border overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-primary/5"
            >
              <span className="font-semibold text-text-main pr-8">{faq.q}</span>
              <ChevronDown className={`w-5 h-5 text-text-muted transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="px-5 pb-5 text-text-muted leading-relaxed text-sm border-t border-app-border/50 pt-4">
                    {faq.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
