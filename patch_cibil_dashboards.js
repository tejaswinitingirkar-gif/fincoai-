const fs = require('fs');
const path = require('path');

const files = ['StudentDashboard.js', 'HomemakerDashboard.js', 'OtherDashboard.js'];
const dir = path.join(__dirname, 'components', 'dashboards');

files.forEach(file => {
  const filePath = path.join(dir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (!content.includes('CibilSection')) {
      content = content.replace(
        "import DashboardCharts from '@/components/DashboardCharts';",
        "import DashboardCharts from '@/components/DashboardCharts';\nimport CibilSection from '@/components/CibilSection';"
      );
      
      content = content.replace(
        '<div className="animate-slide-up">',
        '<div className="animate-slide-up">\n      <CibilSection user={user} />'
      );
      
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Patched ${file}`);
    } else {
      console.log(`Skipped ${file}`);
    }
  }
});
