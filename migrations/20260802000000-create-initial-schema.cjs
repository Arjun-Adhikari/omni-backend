'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('channels', {
      id: { type: Sequelize.UUID, primaryKey: true },
      type: { type: Sequelize.ENUM('facebook'), allowNull: false },
      name: { type: Sequelize.STRING, allowNull: false },
      pageId: { type: Sequelize.STRING, allowNull: false },
      accessToken: { type: Sequelize.TEXT, allowNull: false },
      appSecret: { type: Sequelize.STRING, allowNull: false },
      verifyToken: { type: Sequelize.STRING, allowNull: false },
      isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
    await queryInterface.addIndex('channels', ['pageId'], {
      name: 'uq_channels_page_id',
      unique: true,
      type: 'BTREE',
    });

    await queryInterface.createTable('customers', {
      id: { type: Sequelize.UUID, primaryKey: true },
      name: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: true },
      phone: { type: Sequelize.STRING, allowNull: true },
      avatarUrl: { type: Sequelize.STRING, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.createTable('customer_identities', {
      id: { type: Sequelize.UUID, primaryKey: true },
      customerId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'customers', key: 'id' },
        onDelete: 'CASCADE',
      },
      channelId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'channels', key: 'id' },
        onDelete: 'CASCADE',
      },
      providerUserId: { type: Sequelize.STRING, allowNull: false },
      providerProfile: { type: Sequelize.JSONB, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
    await queryInterface.addIndex(
      'customer_identities',
      ['channelId', 'providerUserId'],
      {
        name: 'uq_customer_identities_channel_provider_user',
        unique: true,
        type: 'BTREE',
      }
    );
    await queryInterface.addIndex('customer_identities', ['customerId'], {
      name: 'idx_customer_identities_customer_id',
      type: 'BTREE',
    });

    await queryInterface.createTable('conversations', {
      id: { type: Sequelize.UUID, primaryKey: true },
      channelId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'channels', key: 'id' },
        onDelete: 'CASCADE',
      },
      customerId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'customers', key: 'id' },
        onDelete: 'CASCADE',
      },
      providerConversationId: { type: Sequelize.STRING, allowNull: false },
      status: {
        type: Sequelize.ENUM('open', 'pending', 'closed'),
        allowNull: false,
        defaultValue: 'open',
      },
      lastMessageAt: { type: Sequelize.DATE, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
    await queryInterface.addIndex(
      'conversations',
      ['channelId', 'providerConversationId'],
      {
        name: 'uq_conversations_channel_provider',
        unique: true,
        type: 'BTREE',
      }
    );
    await queryInterface.addIndex('conversations', ['customerId'], {
      name: 'idx_conversations_customer_id',
      type: 'BTREE',
    });
    await queryInterface.addIndex('conversations', ['channelId'], {
      name: 'idx_conversations_channel_id',
      type: 'BTREE',
    });
    await queryInterface.addIndex('conversations', ['lastMessageAt'], {
      name: 'idx_conversations_last_message_at',
      type: 'BTREE',
    });

    await queryInterface.createTable('messages', {
      id: { type: Sequelize.UUID, primaryKey: true },
      conversationId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'conversations', key: 'id' },
        onDelete: 'CASCADE',
      },
      senderType: { type: Sequelize.ENUM('customer', 'agent'), allowNull: false },
      providerMessageId: { type: Sequelize.STRING, allowNull: true },
      messageType: {
        type: Sequelize.ENUM('text'),
        allowNull: false,
        defaultValue: 'text',
      },
      content: { type: Sequelize.TEXT, allowNull: false },
      sentAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
    await queryInterface.addIndex('messages', ['providerMessageId'], {
      name: 'uq_messages_provider_message_id',
      unique: true,
      type: 'BTREE',
    });
    await queryInterface.addIndex('messages', ['conversationId'], {
      name: 'idx_messages_conversation_id',
      type: 'BTREE',
    });
    await queryInterface.addIndex('messages', ['sentAt'], {
      name: 'idx_messages_sent_at',
      type: 'BTREE',
    });

    await queryInterface.createTable('webhook_events', {
      id: { type: Sequelize.UUID, primaryKey: true },
      channelId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'channels', key: 'id' },
        onDelete: 'CASCADE',
      },
      eventType: { type: Sequelize.STRING, allowNull: false },
      rawPayload: { type: Sequelize.JSONB, allowNull: false },
      status: {
        type: Sequelize.ENUM('received', 'processed', 'failed'),
        allowNull: false,
        defaultValue: 'received',
      },
      error: { type: Sequelize.TEXT, allowNull: true },
      processedAt: { type: Sequelize.DATE, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
    await queryInterface.addIndex('webhook_events', ['channelId'], {
      name: 'idx_webhook_events_channel_id',
      type: 'BTREE',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('messages');
    await queryInterface.dropTable('conversations');
    await queryInterface.dropTable('customer_identities');
    await queryInterface.dropTable('customers');
    await queryInterface.dropTable('webhook_events');
    await queryInterface.dropTable('channels');

    await queryInterface.removeEnum('channels', 'type');
    await queryInterface.removeEnum('conversations', 'status');
    await queryInterface.removeEnum('messages', 'senderType');
    await queryInterface.removeEnum('messages', 'messageType');
    await queryInterface.removeEnum('webhook_events', 'status');
  },
};
