import Channel from './channel.model.js';
import Customer from './customer.model.js';
import CustomerIdentity from './customer_identity.model.js';
import Conversation from './conversation.model.js';
import Message from './message.model.js';
import WebhookEvent from './webhook_event.model.js';

Channel.hasMany(CustomerIdentity, { foreignKey: 'channelId', as: 'identities', onDelete: 'CASCADE' });
Channel.hasMany(Conversation, { foreignKey: 'channelId', as: 'conversations', onDelete: 'CASCADE' });
Channel.hasMany(WebhookEvent, { foreignKey: 'channelId', as: 'webhookEvents', onDelete: 'CASCADE' });

Customer.hasMany(CustomerIdentity, { foreignKey: 'customerId', as: 'identities', onDelete: 'CASCADE' });
Customer.hasMany(Conversation, { foreignKey: 'customerId', as: 'conversations', onDelete: 'CASCADE' });

CustomerIdentity.belongsTo(Channel, { foreignKey: 'channelId', as: 'channel' });
CustomerIdentity.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });

Conversation.belongsTo(Channel, { foreignKey: 'channelId', as: 'channel' });
Conversation.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });
Conversation.hasMany(Message, { foreignKey: 'conversationId', as: 'messages', onDelete: 'CASCADE' });

Message.belongsTo(Conversation, { foreignKey: 'conversationId', as: 'conversation' });

WebhookEvent.belongsTo(Channel, { foreignKey: 'channelId', as: 'channel' });
