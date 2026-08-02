import * as channelRepository from '../repositories/channel.repository.js';
import { AppError } from '../utils/AppError.js';

const SAFE_FIELDS = ['id', 'type', 'name', 'pageId', 'isActive', 'createdAt', 'updatedAt'];

function sanitize(channel) {
  const safe = {};
  for (const field of SAFE_FIELDS) {
    safe[field] = channel[field];
  }
  return safe;
}

export async function createChannel(data) {
  const existing = await channelRepository.findChannelByPageId(data.pageId);
  if (existing) {
    throw new AppError('A channel with this pageId already exists', 409);
  }
  const channel = await channelRepository.createChannel(data);
  return sanitize(channel);
}

export async function getChannels() {
  const channels = await channelRepository.findAllChannels();
  return channels.map(sanitize);
}

export async function getChannel(id) {
  const channel = await channelRepository.findChannelById(id);
  if (!channel) {
    throw new AppError('Channel not found', 404);
  }
  return sanitize(channel);
}

export async function updateChannel(id, data) {
  if (data.pageId && data.pageId !== undefined) {
    const existing = await channelRepository.findChannelByPageId(data.pageId);
    if (existing && existing.id !== id) {
      throw new AppError('A channel with this pageId already exists', 409);
    }
  }
  const channel = await channelRepository.updateChannel(id, data);
  if (!channel) {
    throw new AppError('Channel not found', 404);
  }
  return sanitize(channel);
}

export async function deleteChannel(id) {
  const channel = await channelRepository.deleteChannel(id);
  if (!channel) {
    throw new AppError('Channel not found', 404);
  }
  return sanitize(channel);
}

export async function getChannelWithSecrets(id) {
  const channel = await channelRepository.findChannelById(id);
  if (!channel) {
    throw new AppError('Channel not found', 404);
  }
  return channel;
}
