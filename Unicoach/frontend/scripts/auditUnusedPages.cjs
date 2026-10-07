const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, '../src/app');
const appJsx = fs.readFileSync(path.join(__dirname, '../src/App.jsx'), 'utf8');

function getAllPageFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllPageFiles(filePath, fileList);
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const allPages = getAllPageFiles(appDir);
const unusedPageFiles = [];

allPages.forEach(p => {
  const relPath = path.relative(path.join(__dirname, '../src'), p).replace(/\\/g, '/').replace(/\.jsx?$/, '');
  
  // Search if App.jsx or any other page imports this relative path
  const isImported = appJsx.includes(relPath) || appJsx.includes(relPath.replace('/page', ''));

  if (!isImported) {
    unusedPageFiles.push(relPath + '.jsx');
  }
});

console.log('=== UNUSED APP PAGES REPORT ===');
console.log(`Total App Page Files: ${allPages.length}`);
console.log(`Unused Pages Count: ${unusedPageFiles.length}\n`);

unusedPageFiles.forEach((f, idx) => {
  console.log(`${idx + 1}. ${f}`);
});
