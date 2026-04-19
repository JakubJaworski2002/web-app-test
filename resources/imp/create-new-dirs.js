const fs = require('fs');
const path = require('path');

const baseDir = 'C:\\Users\\mixer\\Documents\\GitHub\\Studia_magister_1\\AiTSI\\web-app-test\\resources\\imp';
const dirs = ['07-testing', '09-incidents', '10-reports'];

dirs.forEach(d => {
  const dirPath = path.join(baseDir, d);
  fs.mkdirSync(dirPath, { recursive: true });
  fs.writeFileSync(path.join(dirPath, '.gitkeep'), '');
  console.log(`Created ${dirPath} with .gitkeep`);
});

console.log('\nListing contents of imp directory:');
const contents = fs.readdirSync(baseDir);
contents.forEach(item => console.log('  ' + item));
