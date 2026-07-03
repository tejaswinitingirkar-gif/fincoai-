export const formatCurrency = (amount, language = 'en') => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  const val = Number(amount);
  
  const localeMap = {
    en: 'en-IN',
    hi: 'hi-IN',
    te: 'te-IN'
  };

  const locale = localeMap[language] || 'en-IN';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: val % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(val);
};
