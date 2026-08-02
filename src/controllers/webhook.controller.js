import * as webhookService from '../services/webhook.service.js';
import { AppError } from '../utils/AppError.js';

export async function verifyWebhook(req, res) {
  const challenge = await webhookService.verifyWebhook(req.query);
  res.status(200).send(challenge);
}

export async function handleWebhookEvent(req, res) {
  const signatureHeader = req.headers['x-hub-signature-256'];

  if (!signatureHeader) {
    throw new AppError('Missing X-Hub-Signature-256 header', 401);
  }

  await webhookService.handleWebhookEvent(req.body, signatureHeader);

  res.status(200).json({ success: true, message: 'EVENT_RECEIVED', data: null });
}
