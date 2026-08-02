import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import webhookRoute from './routes/webhook.route.js';
import apiRoutes from './routes/index.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.disable('x-powered-by');

const corsOrigins = env.CORS_ORIGINS === '*' ? true : env.CORS_ORIGINS.split(',');

app.use(cors({ origin: corsOrigins }));

app.use('/webhook/facebook', webhookRoute);

app.use(express.json({ limit: '1mb' }));

app.use('/api', apiRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
