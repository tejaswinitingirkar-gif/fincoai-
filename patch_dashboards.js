const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'components', 'dashboards');
const files = fs.readdirSync(dir).filter(f => f.endsWith('Dashboard.js'));

for (const file of files) {
  let content = fs.readFileSync(path.join(dir, file), 'utf8');

  // Add import
  if (!content.includes('useLanguage')) {
    content = content.replace(
      "import { useState, useEffect } from 'react';",
      "import { useState, useEffect } from 'react';\nimport { useLanguage } from '@/context/LanguageContext';"
    );
  }

  // Add hook inside component
  const componentHookMatch = new RegExp(`export default function ${file.replace('.js', '')}\\(\\{ user \\}\\) \\{\\s+const \\[transactions`);
  if (!content.includes('const { t } = useLanguage();')) {
    content = content.replace(
      new RegExp(`export default function ${file.replace('.js', '')}\\(\\{ user \\}\\) \\{`),
      `export default function ${file.replace('.js', '')}({ user }) {\n  const { t } = useLanguage();`
    );
  }

  // Chips translation
  content = content.replace(/>\s*\{cat\}\s*<\/button>/g, '>{t(`categories.${cat}`)}</button>');

  // Headers and descriptive text
  const roleName = file.replace('Dashboard.js', '').toLowerCase();
  
  content = content.replace(/<h2[^>]*>.*?Financial Details<\/h2>/g, `<h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{t('dash.${roleName}_details') || t('dash.other_details')}</h2>`);
  
  content = content.replace(/<p style=\{\{ color: 'var\(--text-secondary\)' \}\}>Log your income and expenses to track your financial health\.<\/p>/g, `<p style={{ color: 'var(--text-secondary)' }}>{t('dash.log_desc')}</p>`);

  // Sub headers
  content = content.replace(/<h3>Income Details<\/h3>/g, `<h3>{t('dash.income_details')}</h3>`);
  content = content.replace(/<h3>Expense Details<\/h3>/g, `<h3>{t('dash.expense_details')}</h3>`);

  // Labels
  content = content.replace(/<label className="form-label">Income Category<\/label>/g, `<label className="form-label">{t('dash.income_category')}</label>`);
  content = content.replace(/<label className="form-label">Expense Category<\/label>/g, `<label className="form-label">{t('dash.expense_category')}</label>`);

  content = content.replace(/<label className="form-label">Amount \(₹\) <span className="required">\*<\/span><\/label>/g, `<label className="form-label">{t('dash.amount')} (₹) <span className="required">*</span></label>`);
  content = content.replace(/<label className="form-label">Date <span className="required">\*<\/span><\/label>/g, `<label className="form-label">{t('dash.date')} <span className="required">*</span></label>`);
  content = content.replace(/<label className="form-label">Description \(Optional\)<\/label>/g, `<label className="form-label">{t('dash.description')}</label>`);

  // Buttons
  content = content.replace(/\{loadingIncome \? 'Saving\.\.\.' : 'Save Income'\}/g, `{loadingIncome ? t('dash.saving') : t('dash.save_income')}`);
  content = content.replace(/\{loadingExpense \? 'Saving\.\.\.' : 'Save Expense'\}/g, `{loadingExpense ? t('dash.saving') : t('dash.save_expense')}`);
  
  content = content.replace(/<button onClick=\{\(\) => deleteTx\(tx\._id\)\} className="btn-secondary">Delete<\/button>/g, `<button onClick={() => deleteTx(tx._id)} className="btn-secondary">{t('dash.delete')}</button>`);

  // Table & Transactions section
  content = content.replace(/<h3 style=\{\{ marginBottom: '1rem', color: 'var\(--text-primary\)' \}\}>Recent Transactions:<\/h3>/g, `<h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>{t('dash.recent_transactions')}</h3>`);
  content = content.replace(/<div style=\{\{ padding: '2rem', textAlign: 'center', color: 'var\(--text-secondary\)', fontStyle: 'italic' \}\}>No transactions logged for this month\.<\/div>/g, `<div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontStyle: 'italic' }}>{t('dash.no_transactions_month')}</div>`);

  content = content.replace(/<th>Date<\/th>/g, `<th>{t('dash.table_date')}</th>`);
  content = content.replace(/<th>Type<\/th>/g, `<th>{t('dash.table_type')}</th>`);
  content = content.replace(/<th>Category<\/th>/g, `<th>{t('dash.table_category')}</th>`);
  content = content.replace(/<th>Amount<\/th>/g, `<th>{t('dash.table_amount')}</th>`);
  content = content.replace(/<th>Description<\/th>/g, `<th>{t('dash.table_desc')}</th>`);
  content = content.replace(/<th>Action<\/th>/g, `<th>{t('dash.table_action')}</th>`);

  // Translate mapped table categories logic
  // <td style={{ fontWeight: '500' }}>{tx.category}</td> -> <td style={{ fontWeight: '500' }}>{t(`categories.${tx.category}`)}</td>
  content = content.replace(/<td style=\{\{ fontWeight: '500' \}\}>\{tx\.category\}<\/td>/g, `<td style={{ fontWeight: '500' }}>{t(\`categories.\${tx.category}\`)}</td>`);
  content = content.replace(/<span style=\{\{ color: tx\.type === 'Income' \? '#10b981' : '#ef4444', fontWeight: 'bold' \}\}>\{tx\.type\}<\/span>/g, `<span style={{ color: tx.type === 'Income' ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>{t(\`dash.\${tx.type.toLowerCase()}\`)}</span>`);

  fs.writeFileSync(path.join(dir, file), content);
  console.log(`Patched ${file}`);
}
