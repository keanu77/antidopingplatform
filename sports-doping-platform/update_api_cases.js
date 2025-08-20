const fs = require('fs');

// Read the converted cases
const cases = JSON.parse(fs.readFileSync('/tmp/complete_cases_for_frontend.json', 'utf8'));

// Read the current API file
const apiFile = fs.readFileSync('/Users/ethanwu/Documents/AI class/202507 claude code/延伸/延伸七 運動禁藥案例平台/sports-doping-platform/frontend/src/services/api.js', 'utf8');

// Replace the cases array
const newApiFile = apiFile.replace(
  /cases: \[[\s\S]*?\]/,
  `cases: ${JSON.stringify(cases, null, 2)}`
);

// Write the updated file
fs.writeFileSync('/Users/ethanwu/Documents/AI class/202507 claude code/延伸/延伸七 運動禁藥案例平台/sports-doping-platform/frontend/src/services/api.js', newApiFile);

console.log('Successfully updated API file with 166 cases');