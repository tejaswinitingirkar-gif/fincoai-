/**
 * Behavior Analysis Engine for the Financial Guardian AI.
 * Handles statistical metrics, anomaly detection, and health scoring.
 */

import { ALL_EXPENSE_CATEGORIES } from './data_utils';

/**
 * Calculates a comprehensive behavior profile for the user.
 * @param {Array} months - Array of month keys (YYYY-MM).
 * @param {Array} vectors - Array of feature vectors [Income, TotalExpense, ...Categories].
 */
export function calculateBehaviorProfile(months, vectors) {
  if (vectors.length === 0) return null;

  const latestVector = vectors[vectors.length - 1];
  const previousVector = vectors.length > 1 ? vectors[vectors.length - 2] : latestVector;

  // 1. Growth Rate (MoM % Change in Total Expense)
  const latestExpense = latestVector[1];
  const previousExpense = previousVector[1];
  const growthRate = previousExpense === 0 ? 0 : ((latestExpense - previousExpense) / previousExpense) * 100;

  // 2. Savings Rate (% of Income Saved)
  const latestIncome = latestVector[0];
  const savingsRate = latestIncome === 0 ? 0 : ((latestIncome - latestExpense) / latestIncome) * 100;

  // 3. Stability (Standard Deviation of Spending Across Category Levels)
  // Calculate average category spend for the latest month
  const categoryStartsAt = 2;
  const latestCategories = latestVector.slice(categoryStartsAt);
  const meanCategorySpend = latestExpense / ALL_EXPENSE_CATEGORIES.length;
  const variance = latestCategories.reduce((acc, val) => acc + Math.pow(val - meanCategorySpend, 2), 0) / ALL_EXPENSE_CATEGORIES.length;
  const stability = Math.sqrt(variance);

  // 4. Anomaly Detection (Spikes)
  // Check if any category in the latest month is > 2x its historical average
  const anomalies = [];
  const historicalAverages = ALL_EXPENSE_CATEGORIES.map((_, i) => {
    const total = vectors.reduce((acc, v) => acc + v[categoryStartsAt + i], 0);
    return total / vectors.length;
  });

  latestCategories.forEach((val, i) => {
    const avg = historicalAverages[i];
    if (avg > 0 && val > avg * 2) {
      anomalies.push({
        category: ALL_EXPENSE_CATEGORIES[i],
        severity: val > avg * 3 ? 'CRITICAL' : 'WARNING',
        amount: val,
        deviation: ((val - avg) / avg) * 100
      });
    }
  });

  // 5. Financial Health Score (0-100)
  // Weights: SavingsRate (40%), Stability (30%), BudgetConsistency (30%)
  // Consistency is derived from MoM growth (lower better, capped at 0)
  const consistencyScore = Math.max(0, 100 - Math.abs(growthRate));
  const normalizedSavings = Math.min(100, Math.max(0, savingsRate * 2.5)); // 40% savings -> 100 points
  const normalizedStability = Math.max(0, 100 - (stability / (latestExpense || 1)) * 100);

  const healthScore = Math.round(
    (normalizedSavings * 0.4) +
    (normalizedStability * 0.3) +
    (consistencyScore * 0.3)
  );

  return {
    growthRate,
    savingsRate,
    stability,
    anomalies,
    healthScore: Math.min(100, healthScore),
    healthBreakdown: {
      savings: normalizedSavings,
      stability: normalizedStability,
      consistency: consistencyScore
    },
    riskScore: determineRiskScore(growthRate, savingsRate, anomalies)
  };
}

/**
 * Determines a qualitative risk score based on behavioral factors.
 */
function determineRiskScore(growthRate, savingsRate, anomalies) {
  let score = 0;
  if (growthRate > 15) score += 30; // Growing expenses
  if (savingsRate < 10) score += 40; // Low savings
  if (anomalies.length > 0) score += 20 * anomalies.length;

  if (score < 20) return 'LOW';
  if (score < 50) return 'MEDIUM';
  if (score < 80) return 'HIGH';
  return 'CRITICAL';
}

/**
 * Calculates real-time budget status metrics.
 */
export function calculateBudgetStatus(income, expense, targetSavings) {
  const safeLimit = Math.max(0, income - targetSavings);
  const remainingBalance = safeLimit - expense;
  
  // Threshold Check
  const usagePercentage = safeLimit === 0 ? 100 : (expense / safeLimit) * 100;
  let status = 'SAFE';
  if (usagePercentage >= 100) status = 'CRITICAL';
  else if (usagePercentage >= 90) status = 'DANGER';
  else if (usagePercentage >= 70) status = 'WARNING';

  // Remaining days in month
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const remainingDays = Math.max(1, lastDay - now.getDate() + 1);
  const dailySafeSpend = Math.max(0, remainingBalance / remainingDays);

  return {
    safeLimit,
    remainingBalance,
    usagePercentage,
    status,
    dailySafeSpend,
    remainingDays
  };
}
