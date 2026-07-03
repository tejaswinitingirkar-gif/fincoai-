const fs = require('fs');
const path = require('path');

const files = ['EmployeeDashboard.js', 'FreelancerDashboard.js', 'StudentDashboard.js', 'HomemakerDashboard.js', 'OtherDashboard.js'];
const dir = path.join(__dirname, 'components', 'dashboards');

files.forEach(file => {
  const filePath = path.join(dir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (!content.includes('GoalPlanner')) {
      content = content.replace(
        "import CibilSection from '@/components/CibilSection';",
        "import CibilSection from '@/components/CibilSection';\nimport GoalPlanner from '@/components/GoalPlanner';"
      );
      
      content = content.replace(
        '<CibilSection user={user} />',
        '<CibilSection user={user} />\n      <GoalPlanner user={user} />'
      );
      
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Patched ${file}`);
    } else {
      console.log(`Skipped ${file}`);
    }
  }
});
