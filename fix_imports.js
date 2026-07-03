const fs = require('fs');
const path = require('path');

const targetDirs = ['app', 'components'];
const importStatement = "import { useLanguage } from '@/context/LanguageContext';\n";

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
      results.push(filePath);
    }
  });
  return results;
}

let modifiedCount = 0;

targetDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    const files = walk(dir);
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check if useLanguage is used
      if (content.includes('useLanguage(') || content.includes('useLanguage =')) {
        // Check if it's imported
        if (!content.includes('import { useLanguage }')) {
          // Find the last import statement
          const lines = content.split('\n');
          let lastImportIndex = -1;
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim().startsWith('import ')) {
              lastImportIndex = i;
            }
          }
          
          if (lastImportIndex !== -1) {
            lines.splice(lastImportIndex + 1, 0, importStatement.trim());
          } else {
            // If no imports, put after 'use client' if it exists, else top
            if (lines[0].includes('use client')) {
                lines.splice(1, 0, '\n' + importStatement.trim());
            } else {
                lines.unshift(importStatement.trim());
            }
          }
          
          fs.writeFileSync(file, lines.join('\n'), 'utf8');
          console.log(`Fixed missing import in: ${file}`);
          modifiedCount++;
        }
      }
    });
  }
});

console.log(`Done! Fixed ${modifiedCount} files.`);
