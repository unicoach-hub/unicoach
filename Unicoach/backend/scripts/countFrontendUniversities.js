const fs = require('fs');
const path = require('path');

const listPath = path.join(__dirname, '../../frontend/src/data/countries/usa/universities/list.js');

try {
  const content = fs.readFileSync(listPath, 'utf8');
  // Count how many items/objects are in list.js
  const matches = content.match(/name:\s*['"]/g);
  console.log(`=== FRONTEND USA UNIVERSITIES LIST COUNT: ${matches ? matches.length : 0} ===`);
} catch (err) {
  console.error("Error reading file:", err.message);
}
