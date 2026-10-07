const data = require('../../master_all_universities.json');
console.log('--- MASTER JSON BREAKDOWN ---');
console.log('Total Universities in master_all_universities.json:', data.length);
const countryCounts = {};
data.forEach(u => {
  const c = u.country || 'Unknown';
  countryCounts[c] = (countryCounts[c] || 0) + 1;
});
console.log('Universities per Country in master_all_universities.json:');
Object.entries(countryCounts).sort((a,b) => b[1] - a[1]).forEach(([k, v]) => {
  console.log(`- ${k}: ${v} universities`);
});
