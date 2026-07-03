/**
 * Utility functions for preprocessing user data for the LSTM model.
 */

export const ALL_EXPENSE_CATEGORIES = [
  'Rent / Housing', 
  'Groceries', 
  'Office Commute / Fuel', 
  'Food / Dining', 
  'Utility Bills', 
  'Insurance', 
  'EMI / Loans', 
  'Investments / Savings', 
  'Shopping', 
  'Entertainment', 
  'Healthcare', 
  'Personal Care', 
  'Miscellaneous'
];

/**
 * Groups transactions by month and category.
 * Returns a matrix where each row is a month and columns are normalized features.
 */
export function preprocessTransactions(transactions) {
  if (!transactions || transactions.length === 0) return null;

  // 1. Group by month (YYYY-MM)
  const monthlyData = {};
  
  transactions.forEach(t => {
    const date = new Date(t.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        income: 0,
        totalExpense: 0,
        categories: {}
      };
      ALL_EXPENSE_CATEGORIES.forEach(cat => {
        monthlyData[monthKey].categories[cat] = 0;
      });
    }
    
    if (t.type === 'Income') {
      monthlyData[monthKey].income += t.amount;
    } else {
      monthlyData[monthKey].totalExpense += t.amount;
      // Handle category mapping (normalize name if needed)
      const catName = ALL_EXPENSE_CATEGORIES.includes(t.category) ? t.category : 'Miscellaneous';
      monthlyData[monthKey].categories[catName] += t.amount;
    }
  });

  // 2. Sort months
  const sortedMonths = Object.keys(monthlyData).sort();
  
  // 3. Convert to feature vectors
  // Vector format: [Income, TotalExpense, ...CategoryAmounts]
  const vectors = sortedMonths.map(month => {
    const data = monthlyData[month];
    const catVector = ALL_EXPENSE_CATEGORIES.map(cat => data.categories[cat]);
    return [data.income, data.totalExpense, ...catVector];
  });

  return {
    months: sortedMonths,
    vectors,
    featureNames: ['Income', 'TotalExpense', ...ALL_EXPENSE_CATEGORIES]
  };
}

/**
 * Normalizes data to [0, 1] range for better LSTM performance.
 */
export function normalizeData(vectors) {
  if (vectors.length === 0) return null;
  
  const numFeatures = vectors[0].length;
  const maxValues = new Array(numFeatures).fill(0);
  
  vectors.forEach(v => {
    v.forEach((val, i) => {
      if (val > maxValues[i]) maxValues[i] = val;
    });
  });

  const normalized = vectors.map(v => 
    v.map((val, i) => maxValues[i] === 0 ? 0 : val / maxValues[i])
  );

  return {
    normalized,
    maxValues
  };
}

export function denormalizeValue(value, maxValue) {
  return value * maxValue;
}
