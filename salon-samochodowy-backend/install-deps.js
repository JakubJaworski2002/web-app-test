// Skrypt instalacyjny - uruchom: node install-deps.js
import { execSync } from 'child_process';

console.log('📦 Instalowanie brakujących zależności...');
execSync('npm install express-rate-limit', { stdio: 'inherit' });
console.log('✅ Gotowe! Możesz teraz uruchomić serwer: node server.js');
