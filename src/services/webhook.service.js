import * as channelRepository from '../repositories/channel.repository.js';
import * as customerRepository from '../repositories/customer.repository.js';
import * as conversationRepository from '../repositories/conversation.repository.js';
import * as messageRepository from '../repositories/message.repository.js';
import * as webhookRepository from '../repositories/webhook.repository.js';
import { verifySignature, getProfile } from '../providers/facebook.provider.js';
import { AppError } from '../utils/AppError.js';

export async function verifyWebhook(query) {
  const mode = query['hub.mode'];
  const verifyToken = query['hub.verify_token'];
  const challenge = query['hub.challenge'];

  if (mode !== 'subscribe') {
    throw new AppError('Invalid hub.mode', 403);
  }

  const channels = await channelRepository.findAllChannels();
  const channel = channels.find((c) => c.verifyToken === verifyToken);

  if (!channel) {
    throw new AppError('Invalid verification token', 403);
  }

  return challenge;
}

export async function handleWebhookEvent(rawBody, signatureHeader) {
  let payload;
  try {
    payload = JSON.parse(rawBody.toString());
  } catch {
    throw new AppError('Malformed webhook payload', 400);
  }

  if (payload.object !== 'page' || !Array.isArray(payload.entry)) {
    throw new AppError('Invalid webhook payload', 400);
  }

  const channel = await channelRepository.findChannelByPageId(payload.entry[0]?.id);
  if (!channel) {
    throw new AppError('Channel not found for this page', 404);
  }

  if (!verifySignature(rawBody, signatureHeader, channel.appSecret)) {
    throw new AppError('Invalid signature', 401);
  }

  for (const entry of payload.entry) {
    const messagingEvents = entry.messaging || [];

    for (const messaging of messagingEvents) {
      const eventType = messaging.message
        ? 'message'
        : messaging.postback
          ? 'postback'
          : messaging.delivery
            ? 'delivery'
            : 'unknown';

      const event = await webhookRepository.createWebhookEvent({
        channelId: channel.id,
        eventType,
        rawPayload: messaging,
      });

      try {
        if (eventType === 'message' && messaging.message?.text) {
          await processIncomingMessage(channel, messaging, messaging.message);
        }
        await webhookRepository.markWebhookEventProcessed(event.id);
      } catch (error) {
        await webhookRepository.markWebhookEventFailed(event.id, error.message);
      }
    }
  }
}

async function processIncomingMessage(channel, messaging, fbMessage) {
  const psid = messaging.sender.id;

  let identity = await customerRepository.findIdentityByChannelAndProviderUserId(channel.id, psid);

  if (!identity) {
    const profile = await getProfile(psid, channel.accessToken);
    const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ');

    const customer = await customerRepository.createCustomer({
      name: fullName || 'Unknown Customer',
      avatarUrl: profile.profile_pic || null,
    });

    identity = await customerRepository.createIdentity({
      customerId: customer.id,
      channelId: channel.id,
      providerUserId: psid,
      providerProfile: profile,
    });
  }

  const conversation = await conversationRepository.findOrCreateByProviderConversationId(
    channel.id,
    psid,
    { customerId: identity.customerId }
  );

  const message = await messageRepository.createMessage({
    conversationId: conversation.id,
    senderType: 'customer',
    providerMessageId: fbMessage.mid || null,
    messageType: 'text',
    content: fbMessage.text,
    sentAt: new Date(messaging.timestamp),
  });

  await conversationRepository.touchLastMessageAt(conversation.id, message.sentAt);
}
