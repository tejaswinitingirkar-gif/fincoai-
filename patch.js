const fs = require('fs');
const path = require('path');

const formatCurrencyImport = 'import { formatCurrency } from \'@/utils/formatCurrency\';\n';

function patchFile(filePath, replacements) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Auto import
    if (!content.includes('formatCurrency') && !content.includes('from \'@/utils/formatCurrency\'')) {
        const importMatch = content.match(/^import .*?;/gm);
        if (importMatch) {
            const lastImport = importMatch[importMatch.length - 1];
            content = content.replace(lastImport, lastImport + '\n' + formatCurrencyImport);
        } else {
            content = formatCurrencyImport + content;
        }
    }

    replacements.forEach(({regex, replacement}) => {
        content = content.replace(regex, replacement);
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log('Patched: ' + filePath);
    }
}

// TrackExpensesSection.jsx
patchFile('c:/Users/rehal/Downloads/News/New/components/landing/TrackExpensesSection.jsx', [
    { regex: /\$\s*\{\s*total\.toFixed\(2\)\s*\}/g, replacement: '{formatCurrency(total)}' },
    { regex: /-\$\{\s*(expense\.amount)\.toFixed\(2\)\s*\}/g, replacement: '-{formatCurrency($1)}' }
]);

// SavingsSection.jsx
patchFile('c:/Users/rehal/Downloads/News/New/components/landing/SavingsSection.jsx', [
    { regex: /Target: \$50,000/g, replacement: 'Target: {formatCurrency(50000)}' },
    { regex: /\$32,450/g, replacement: '{formatCurrency(32450)}' }
]);

// AnalyticsSection.jsx
patchFile('c:/Users/rehal/Downloads/News/New/components/landing/AnalyticsSection.jsx', [
    { regex: /tickFormatter=\{\(value\) => `\$\{value\}`\}/g, replacement: 'tickFormatter={(value) => formatCurrency(value)}' },
    { regex: /tickFormatter=\{\(value\) => `\\\$\$\{value\}`\}/g, replacement: 'tickFormatter={(value) => formatCurrency(value)}' },
    { regex: /formatter=\{\(value\) => `\\\$\$\{value\}`\}/g, replacement: 'formatter={(value) => formatCurrency(value)}' },
    { regex: /\$\$\{value\}/g, replacement: '{formatCurrency(value)}' },
    { regex: /`\$\$\{value\}`/g, replacement: 'formatCurrency(value)' }
]);

// AIPredictionsSection.jsx
patchFile('c:/Users/rehal/Downloads/News/New/components/landing/AIPredictionsSection.jsx', [
    { regex: /tickFormatter=\{\(value\) => `\\\$\$\{value\}`\}/g, replacement: 'tickFormatter={(value) => formatCurrency(value)}' },
    { regex: /formatter=\{\(value\) => \[`\\\$\$\{value\}`/g, replacement: 'formatter={(value) => [formatCurrency(value)' },
    { regex: /`\$\$\{value\}`/g, replacement: 'formatCurrency(value)' }
]);

// StudentDashboard.js
patchFile('c:/Users/rehal/Downloads/News/New/components/dashboards/StudentDashboard.js', [
    { regex: /\$\{\s*(total\w*)\.toFixed\(2\)\s*\}/g, replacement: '${formatCurrency($1)}' },
    { regex: /\$\s*\{\s*(total\w*)\.toFixed\(2\)\s*\}/g, replacement: '{formatCurrency($1)}' },
    { regex: /\$\{\s*(t\.amount)\.toFixed\(2\)\s*\}/g, replacement: '${formatCurrency($1)}' },
    { regex: />\s*\$\s*\{?\s*(expense\.amount)\.toFixed\(2\)\s*\}?</g, replacement: '>{formatCurrency($1)}<' }
]);

// ProfessionalDashboard.js (assuming EmployeeDashboard exists, patching DashboardCharts later)
// GoalPlanner.js
patchFile('c:/Users/rehal/Downloads/News/New/components/GoalPlanner.js', [
    { regex: /₹\$\{amtRem\.toLocaleString\(\)\}/g, replacement: '{formatCurrency(amtRem)}' },
    { regex: /₹\$\{goal\.currentAmount\.toLocaleString\(\)\}/g, replacement: '{formatCurrency(goal.currentAmount)}' },
    { regex: /₹\$\{goal\.targetAmount\.toLocaleString\(\)\}/g, replacement: '{formatCurrency(goal.targetAmount)}' }
]);

console.log("Patch complete.");
