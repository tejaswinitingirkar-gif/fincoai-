'use client';

import { useState, useEffect } from 'react';
import { Mail, Clock, Info, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function LiveHelpCard() {
  const { t } = useLanguage();
  const [isOnline, setIsOnline] = useState(true);

  // Simulate dynamic status check
  useEffect(() => {
    const hour = new Date().getHours();
    // Support is "online" during typical business hours (9-18)
    setTimeout(() => {
      setIsOnline(hour >= 9 && hour <= 18);
    }, 0);
  }, []);

  return (
    <div className="glass-panel border-app-border overflow-hidden">
      <div className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-text-main flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            {t('help.live_help')}
          </h3>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-app-bg/80 border border-app-border">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-success animate-pulse' : 'bg-text-muted/50'}`}></span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-main">
              {isOnline ? t('help.online') : t('help.offline')}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-app-bg/50 border border-app-border/50">
            <Mail className="w-4 h-4 text-primary" />
            <div className="flex flex-col">
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-tight">Support Email</span>
              <span className="text-sm font-medium text-text-main">support@fincoai.com</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-app-bg/50 border border-app-border/50">
            <Clock className="w-4 h-4 text-secondary" />
            <div className="flex flex-col">
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-tight">Response Time</span>
              <span className="text-sm font-medium text-text-main">{t('help.response_time')}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-app-bg/50 border border-app-border/50">
            <Info className="w-4 h-4 text-text-muted" />
            <div className="flex flex-col">
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-tight">Application</span>
              <span className="text-sm font-medium text-text-main">{t('help.app_version')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
