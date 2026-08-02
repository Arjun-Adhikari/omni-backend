import Message from '../models/message.model.js';

export async function createMessage(data) {
  return Message.create(data);
}

export async function findMessagesByConversation(conversationId) {
  return Message.findAll({
    where: { conversationId },
    order: [['sentAt', 'ASC']],
  });
}
