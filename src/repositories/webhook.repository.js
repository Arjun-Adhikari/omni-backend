import WebhookEvent from '../models/webhook_event.model.js';

export async function createWebhookEvent(data) {
  return WebhookEvent.create(data);
}

export async function markWebhookEventProcessed(id) {
  return WebhookEvent.update(
    { status: 'processed', processedAt: new Date() },
    { where: { id } }
  );
}

export async function markWebhookEventFailed(id, error) {
  return WebhookEvent.update(
    { status: 'failed', error, processedAt: new Date() },
    { where: { id } }
  );
}
