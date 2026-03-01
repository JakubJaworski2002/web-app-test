import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize('salon_samochodowy', 'root', 'root', {
    host: 'localhost',
    dialect: 'mysql',
});
