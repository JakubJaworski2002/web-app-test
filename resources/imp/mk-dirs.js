'use strict';
// Uruchom: node mk-dirs.js  (z katalogu resources/imp/)
// Tworzy katalogi i pliki dokumentacji dla każdego dostępnego modułu docs-*.js
console.log('📁 Tworzenie katalogów i plików dokumentacji Salon Samochodowy...\n');

function tryRequire(mod) {
  try {
    require(mod);
  } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      console.warn(\`⚠️  Pominięto (moduł niedostępny): \${mod}\`);
    } else {
      throw e;
    }
  }
}

tryRequire('./docs-03-development-plan');
tryRequire('./docs-07-testing');
tryRequire('./docs-08-devops');
tryRequire('./docs-09-incidents');
tryRequire('./docs-10-reports');
tryRequire('./docs-11-skills');

console.log('\n✅ Gotowe!');
console.log('📂 Wygenerowane katalogi (sprawdź zasoby/imp/):');
['03-development-plan','07-testing','08-devops','09-incidents','10-reports','11-skills'].forEach(d => {
  const fs = require('fs');
  const p  = require('path').join(__dirname, d);
  if (fs.existsSync(p)) {
    const files = fs.readdirSync(p).filter(f => f.endsWith('.md'));
    console.log(\`   \${d}/  (\${files.length} plik(ów) .md)\`);
  }
});
