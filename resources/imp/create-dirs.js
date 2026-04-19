const fs = require('fs');
const path = require('path');

const baseDir = 'C:\\Users\\mixer\\Documents\\GitHub\\Studia_magister_1\\AiTSI\\web-app-test\\resources\\imp';
const dirs = ['00-project-charter', '01-architecture'];

dirs.forEach(d => {
  const dirPath = path.join(baseDir, d);
  fs.mkdirSync(dirPath, { recursive: true });
  fs.writeFileSync(path.join(dirPath, '.gitkeep'), '');
  console.log(`Created ${dirPath} with .gitkeep`);
});

console.log('Done');
