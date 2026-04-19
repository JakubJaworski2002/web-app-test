import { sequelize, Car, User, Transaction } from './models.js';
console.log('Models OK, Transaction:', Transaction.name);
await sequelize.close();
