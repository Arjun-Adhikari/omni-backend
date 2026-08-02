import * as conversationRepository from '../repositories/conversation.repository.js';
import { AppError } from '../utils/AppError.js';

export async function listConversations() {
  return conversationRepository.findAllConversations();
}

export async function getConversationMessages(id) {
  const conversation = await conversationRepository.findConversationById(id);
  if (!conversation) {
    throw new AppError('Conversation not found', 404);
  }
  return conversation;
}

export async function updateConversationStatus(id, status) {
  const conversation = await conversationRepository.updateConversationStatus(id, status);
  if (!conversation) {
    throw new AppError('Conversation not found', 404);
  }
  return conversation;
}
