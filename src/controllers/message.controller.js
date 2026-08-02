import * as messageService from '../services/message.service.js';
import { AppError } from '../utils/AppError.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validateId(id) {
  if (!id || typeof id !== 'string' || !UUID_REGEX.test(id)) {
    throw new AppError('Invalid conversation id', 400);
  }
  return id;
}

function validateText(text) {
  if (!text || typeof text !== 'string' || !text.trim()) {
    throw new AppError('Message text is required', 400);
  }
  if (text.length > 2000) {
    throw new AppError('Message text is too long', 400);
  }
  return text;
}

export async function sendMessage(req, res) {
  const id = validateId(req.params.id);
  const text = validateText(req.body.text);
  const message = await messageService.sendReply(id, text);
  res.status(201).json({ success: true, message: 'Message sent successfully', data: message });
}
