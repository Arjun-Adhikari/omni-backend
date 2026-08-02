import * as conversationService from '../services/conversation.service.js';
import { AppError } from '../utils/AppError.js';

const ALLOWED_STATUSES = ['open', 'pending', 'closed'];

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validateId(id) {
  if (!id || typeof id !== 'string' || !UUID_REGEX.test(id)) {
    throw new AppError('Invalid conversation id', 400);
  }
  return id;
}

function validateStatus(status) {
  if (!ALLOWED_STATUSES.includes(status)) {
    throw new AppError('Status must be open, pending or closed', 400);
  }
  return status;
}

export async function listConversations(req, res) {
  const conversations = await conversationService.listConversations();
  res.status(200).json({
    success: true,
    message: 'Conversations fetched successfully',
    data: conversations,
  });
}

export async function getConversation(req, res) {
  const id = validateId(req.params.id);
  const conversation = await conversationService.getConversationMessages(id);
  res.status(200).json({
    success: true,
    message: 'Conversation fetched successfully',
    data: conversation,
  });
}

export async function updateConversationStatus(req, res) {
  const id = validateId(req.params.id);
  const status = validateStatus(req.body.status);
  const conversation = await conversationService.updateConversationStatus(id, status);
  res.status(200).json({
    success: true,
    message: 'Conversation status updated successfully',
    data: conversation,
  });
}
