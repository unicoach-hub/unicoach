const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const allFiles = getAllFiles(srcDir);
const fileContentsMap = {};

allFiles.forEach(f => {
  fileContentsMap[f] = fs.readFileSync(f, 'utf8');
});

const unusedFiles = [];

allFiles.forEach(file => {
  const relPath = path.relative(srcDir, file).replace(/\\/g, '/');
  if (
    relPath === 'main.jsx' || 
    relPath === 'App.jsx' || 
    relPath === 'index.css' || 
    relPath === 'data/universities.js' ||
    relPath === 'data/universities/index.js' ||
    relPath.startsWith('assets/')
  ) {
    return;
  }

  const baseName = path.basename(file, path.extname(file));

  // Check if baseName is referenced in any file except itself
  const isReferenced = allFiles.some(otherFile => {
    if (otherFile === file) return false;
    return fileContentsMap[otherFile].includes(baseName);
  });

  if (!isReferenced) {
    unusedFiles.push(relPath);
  }
});

console.log('=== UNUSED / UNREFERENCED FILES REPORT ===');
console.log(`Total Files Checked: ${allFiles.length}`);
console.log(`Unused Files Count: ${unusedFiles.length}\n`);

unusedFiles.forEach((f, idx) => {
  console.log(`${idx + 1}. ${f}`);
});
