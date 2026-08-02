import Channel from '../models/channel.model.js';

export async function createChannel(data) {
  return Channel.create(data);
}

export async function findAllChannels() {
  return Channel.findAll({ order: [['createdAt', 'DESC']] });
}

export async function findChannelById(id) {
  return Channel.findByPk(id);
}

export async function findChannelByPageId(pageId) {
  return Channel.findOne({ where: { pageId } });
}

export async function updateChannel(id, data) {
  const channel = await Channel.findByPk(id);
  if (!channel) {
    return null;
  }
  return channel.update(data);
}

export async function deleteChannel(id) {
  const channel = await Channel.findByPk(id);
  if (!channel) {
    return null;
  }
  await channel.destroy();
  return channel;
}
