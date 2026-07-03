"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Bot, X, User, Loader2, Send } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function AIChatAssistant() {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', content: t('chat.welcome') }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  const suggestions = [
    t('chat.suggest_spending'),
    t('chat.suggest_prediction'),
    t('chat.suggest_goals'),
    t('chat.suggest_csv')
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Update the welcome message if the user hasn't sent any messages yet
    setMessages(prev => {
      if (prev.length === 1 && prev[0].role === 'model') {
        return [{ role: 'model', content: t('chat.welcome') }];
      }
      return prev;
    });
  }, [language, t]);

  const handleSend = async (e, text = null) => {
    if (e) e.preventDefault();
    const messageText = text || input;
    if (!messageText.trim() || loading) return;

    const userMessage = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ messages: [...messages, userMessage], language })
      });
      
      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, { role: 'model', content: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', content: t('chat.error_general') }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', content: t('chat.error_network') }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-8 right-8 p-4 rounded-full bg-primary text-white shadow-xl shadow-primary/30 transition-all hover:scale-110 active:scale-95 z-50 ${isOpen ? 'hidden' : 'flex items-center justify-center'}`}
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-8 right-8 w-[350px] md:w-[450px] h-[600px] bg-app-card border border-app-border rounded-3xl flex flex-col z-50 overflow-hidden shadow-2xl transition-all duration-300"
          >
            {/* Header */}
            <div className="p-5 bg-primary/10 border-b border-app-border flex justify-between items-center backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-black text-text-main text-sm uppercase tracking-widest">{t('chat.title')}</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                    <span className="text-[10px] font-bold text-success uppercase tracking-tighter">{t('ai_insights.online')}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-primary/10 rounded-full text-text-muted hover:text-primary transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-app-bg/5">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`p-2 rounded-xl h-fit shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'}`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed font-medium shadow-sm transition-all duration-300 ${
                    msg.role === 'user' 
                      ? 'bg-primary text-white rounded-tr-sm' 
                      : 'bg-app-card text-text-main border border-app-border rounded-tl-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {messages.length === 1 && (
                <div className="flex flex-wrap gap-2 mt-4 ml-11">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(null, s)}
                      className="text-[10px] uppercase tracking-widest font-black px-3 py-2 bg-app-card hover:bg-primary text-text-dim hover:text-white border border-app-border hover:border-primary rounded-xl transition-all shadow-sm"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {loading && (
                <div className="flex gap-3">
                  <div className="p-2 rounded-xl h-fit shrink-0 bg-primary/10 text-primary shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-4 rounded-2xl bg-app-card text-text-main border border-app-border rounded-tl-sm flex items-center gap-3 shadow-sm">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-xs text-text-muted font-bold italic">{t('chat.analyzing')}</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={(e) => handleSend(e)} className="p-5 border-t border-app-border bg-app-card/80 backdrop-blur-md">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t('chat.placeholder')}
                  className="w-full bg-app-bg border border-app-border rounded-2xl py-4 pl-5 pr-14 text-sm text-text-main font-medium placeholder-text-dim focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all shadow-inner"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="absolute right-2 p-2.5 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:hover:scale-100"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
