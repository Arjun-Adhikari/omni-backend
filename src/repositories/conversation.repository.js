import Conversation from '../models/conversation.model.js';
import Customer from '../models/customer.model.js';
import Channel from '../models/channel.model.js';
import Message from '../models/message.model.js';

const conversationInclude = [
  { model: Customer, as: 'customer', attributes: ['id', 'name', 'email', 'phone', 'avatarUrl'] },
  { model: Channel, as: 'channel', attributes: ['id', 'type', 'name', 'pageId'] },
];

export async function findOrCreateByProviderConversationId(channelId, providerConversationId, defaults) {
  const [conversation] = await Conversation.findOrCreate({
    where: { channelId, providerConversationId },
    defaults,
  });
  return conversation;
}

export async function findConversationById(id) {
  return Conversation.findByPk(id, {
    include: [
      ...conversationInclude,
      {
        model: Message,
        as: 'messages',
        order: [['sentAt', 'ASC']],
        attributes: ['id', 'senderType', 'messageType', 'content', 'sentAt'],
      },
    ],
  });
}

export async function findAllConversations() {
  return Conversation.findAll({
    include: [
      ...conversationInclude,
      {
        model: Message,
        as: 'messages',
        separate: true,
        limit: 1,
        order: [['sentAt', 'DESC']],
        attributes: ['id', 'senderType', 'messageType', 'content', 'sentAt'],
      },
    ],
    order: [['lastMessageAt', 'DESC']],
  });
}

export async function updateConversationStatus(id, status) {
  const conversation = await Conversation.findByPk(id);
  if (!conversation) {
    return null;
  }
  await conversation.update({ status });
  return conversation;
}

export async function touchLastMessageAt(id, sentAt) {
  return Conversation.update({ lastMessageAt: sentAt }, { where: { id } });
}
