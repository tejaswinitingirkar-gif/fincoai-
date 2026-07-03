export const formatDate = (date, language = 'en', options = {}) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const localeMap = {
    en: 'en-IN',
    hi: 'hi-IN',
    te: 'te-IN'
  };

  const locale = localeMap[language] || 'en-IN';

  const defaultOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  };

  return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(d);
};
