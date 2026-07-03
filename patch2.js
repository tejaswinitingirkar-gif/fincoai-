const fs = require('fs');
const path = require('path');
const formatCurrencyImport = "import { formatCurrency } from '@/utils/formatCurrency';\n";

function patchDashboard(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    if (!content.includes('formatCurrency') && !content.includes("from '@/utils/formatCurrency'")) {
        const importMatch = content.match(/^import .*?;/gm);
        if (importMatch) {
            const lastImport = importMatch[importMatch.length - 1];
            content = content.replace(lastImport, lastImport + '\n' + formatCurrencyImport);
        } else {
            content = formatCurrencyImport + content;
        }
    }

    // > $ {expense.amount.toFixed(2)} < => > {formatCurrency(expense.amount)} <
    content = content.replace(/>\s*\\?\$\s*\{?([^}]+)\.toFixed\(2\)\}?</g, '>{formatCurrency($1)}<');
    content = content.replace(/"\$\s*\{([^}]+)\.toFixed\(2\)\}"/g, '{formatCurrency($1)}');
    content = content.replace(/`\$\s*\$\{([^}]+)\.toFixed\(2\)\}`/g, 'formatCurrency($1)');
    content = content.replace(/\$ \{([a-zA-Z0-9\.]+)\.toFixed\(2\)\}/g, '{formatCurrency($1)}');
    content = content.replace(/\$\{([a-zA-Z0-9\.]+)\.toFixed\(2\)\}/g, '${formatCurrency($1)}');

    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log('Patched: ' + filePath);
    }
}

const dir = 'c:/Users/rehal/Downloads/News/New/components/dashboards';
fs.readdirSync(dir).forEach(file => {
    if (file.endsWith('.js')) {
        patchDashboard(path.join(dir, file));
    }
});

function patchTransactions() {
    const tp = 'c:/Users/rehal/Downloads/News/New/app/transactions/page.js';
    let content = fs.readFileSync(tp, 'utf8');
    if (!content.includes('formatCurrency')) {
        content = content.replace(/^import .*?;/m, (m) => m + '\n' + formatCurrencyImport);
        content = content.replace(/>\s*\$\s*\{\s*t\.amount\.toFixed\(2\)\s*\}/g, '>{formatCurrency(t.amount)}');
        fs.writeFileSync(tp, content);
        console.log('Patched transactions');
    }
}
patchTransactions();

function patchAPI() {
    const goalsApi = 'c:/Users/rehal/Downloads/News/New/app/api/goals/route.js';
    let content = fs.readFileSync(goalsApi, 'utf8');
    content = content.replace(/₹\$\{recommendedSavings\.toFixed\(0\)\}/g, '₹${new Intl.NumberFormat(\'en-IN\').format(recommendedSavings)}');
    content = content.replace(/₹\$\{requiredMonthly\.toFixed\(0\)\}/g, '₹${new Intl.NumberFormat(\'en-IN\').format(requiredMonthly)}');
    content = content.replace(/₹\$\{topAvg\.toFixed\(0\)\}/g, '₹${new Intl.NumberFormat(\'en-IN\').format(topAvg)}');
    fs.writeFileSync(goalsApi, content);
    console.log('Patched API goals');
}
patchAPI();
