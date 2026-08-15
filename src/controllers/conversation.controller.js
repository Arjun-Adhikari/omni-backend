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

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function parsePagination(query) {
  const page = Number.parseInt(query.page, 10);
  const limit = Number.parseInt(query.limit, 10);

  return {
    page: Number.isInteger(page) && page > 0 ? page : DEFAULT_PAGE,
    limit: Number.isInteger(limit) && limit > 0 ? Math.min(limit, MAX_LIMIT) : DEFAULT_LIMIT,
  };
}

export async function listConversations(req, res) {
  const { page, limit } = parsePagination(req.query);
  const conversations = await conversationService.listConversations(page, limit);
  res.status(200).json({
    success: true,
    message: 'Conversations fetched successfully',
    data: conversations,
    pagination: { page, limit },
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
