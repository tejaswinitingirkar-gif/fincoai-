'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import en from '../locales/en.json';
import hi from '../locales/hi.json';
import te from '../locales/te.json';

const translations = {
  en, hi, te
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    // Load language from localStorage if available
    const savedLanguage = localStorage.getItem('appLanguage');
    if (savedLanguage && translations[savedLanguage]) {
      setTimeout(() => setLanguage(savedLanguage), 0);
    }
  }, []);

  useEffect(() => {
    // Handle RTL for Urdu
    if (language === 'ur') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ur';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = language;
    }
  }, [language]);

  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
      localStorage.setItem('appLanguage', lang);
    }
  };

  const t = (key, params = {}) => {
    if (!key) return '';
    const keys = key.split('.');
    
    const getVal = (obj, path) => {
      let current = obj;
      for (const k of path) {
        if (current === undefined || current === null) return undefined;
        current = current[k];
      }
      return current;
    };

    let value = getVal(translations[language], keys);
    
    // Fallback to English if translation is missing in current language
    if (value === undefined || value === null) {
      value = getVal(translations['en'], keys);
    }
    
    if (value !== undefined && value !== null) {
      // Handle variable interpolation
      if (typeof value === 'string') {
        Object.keys(params).forEach(param => {
          value = value.replace(new RegExp(`{${param}}`, 'g'), params[param]);
        });
      }
      return value;
    }

    // Fallback to human-readable string if key is completely missing
    const lastKey = keys[keys.length - 1];
    return lastKey
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
