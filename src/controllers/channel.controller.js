import * as channelService from '../services/channel.service.js';
import { AppError } from '../utils/AppError.js';

const ALLOWED_TYPES = ['facebook'];

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validateCreateChannel(body) {
  const { type, name, pageId, accessToken, appSecret, verifyToken } = body;

  if (!ALLOWED_TYPES.includes(type)) {
    throw new AppError('Channel type must be "facebook"', 400);
  }
  if (!name || !String(name).trim()) {
    throw new AppError('Name is required', 400);
  }
  if (!pageId) {
    throw new AppError('pageId is required', 400);
  }
  if (!accessToken) {
    throw new AppError('accessToken is required', 400);
  }
  if (!appSecret) {
    throw new AppError('appSecret is required', 400);
  }
  if (!verifyToken) {
    throw new AppError('verifyToken is required', 400);
  }

  return body;
}

function validateUpdateChannel(body) {
  if (Object.keys(body).length === 0) {
    throw new AppError('At least one field must be provided', 400);
  }
  if (body.type && !ALLOWED_TYPES.includes(body.type)) {
    throw new AppError('Channel type must be "facebook"', 400);
  }
  return body;
}

function validateId(id) {
  if (!id || typeof id !== 'string' || !UUID_REGEX.test(id)) {
    throw new AppError('Invalid channel id', 400);
  }
  return id;
}

export async function createChannel(req, res) {
  const data = validateCreateChannel(req.body);
  const channel = await channelService.createChannel(data);
  res.status(201).json({ success: true, message: 'Channel created successfully', data: channel });
}

export async function getChannels(req, res) {
  const channels = await channelService.getChannels();
  res.status(200).json({ success: true, message: 'Channels fetched successfully', data: channels });
}

export async function getChannel(req, res) {
  const id = validateId(req.params.id);
  const channel = await channelService.getChannel(id);
  res.status(200).json({ success: true, message: 'Channel fetched successfully', data: channel });
}

export async function updateChannel(req, res) {
  const id = validateId(req.params.id);
  const data = validateUpdateChannel(req.body);
  const channel = await channelService.updateChannel(id, data);
  res.status(200).json({ success: true, message: 'Channel updated successfully', data: channel });
}

export async function deleteChannel(req, res) {
  const id = validateId(req.params.id);
  const channel = await channelService.deleteChannel(id);
  res.status(200).json({ success: true, message: 'Channel deleted successfully', data: channel });
}
