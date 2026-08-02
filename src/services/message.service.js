import * as conversationRepository from '../repositories/conversation.repository.js';
import * as messageRepository from '../repositories/message.repository.js';
import * as channelService from './channel.service.js';
import { sendTextMessage } from '../providers/facebook.provider.js';
import { AppError } from '../utils/AppError.js';

export async function sendReply(conversationId, text) {
  const conversation = await conversationRepository.findConversationById(conversationId);
  if (!conversation) {
    throw new AppError('Conversation not found', 404);
  }

  const channel = await channelService.getChannelWithSecrets(conversation.channelId);
  if (!channel.isActive) {
    throw new AppError('Channel is inactive', 400);
  }

  const result = await sendTextMessage(
    conversation.providerConversationId,
    text,
    channel.accessToken
  );

  const message = await messageRepository.createMessage({
    conversationId: conversation.id,
    senderType: 'agent',
    providerMessageId: result.message_id || null,
    messageType: 'text',
    content: text,
  });

  await conversationRepository.touchLastMessageAt(conversation.id, message.sentAt);

  return message;
}
