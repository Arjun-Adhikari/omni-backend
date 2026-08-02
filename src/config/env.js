import dotenv from 'dotenv';

dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';
const port = Number(process.env.PORT) || 3000;
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('Invalid environment variables: DATABASE_URL is required');
}

export const env = {
  NODE_ENV: nodeEnv,
  PORT: port,
  DATABASE_URL: databaseUrl,
  CORS_ORIGINS: process.env.CORS_ORIGINS || '*',
};
