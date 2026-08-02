import { Sequelize } from 'sequelize';
import { env } from './env.js';

export const sequelize = new Sequelize(env.DATABASE_URL, {
  dialect: 'postgres',
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  logging: false,
});
