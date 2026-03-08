// Utrzymujemy kompatybilnosc: import z db.js zwraca aktywne polaczenie
// z automatycznym fallbackiem MySQL -> SQLite.
export { sequelize } from './models.js';
