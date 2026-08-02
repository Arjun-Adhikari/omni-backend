import { DataTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { sequelize } from '../config/database.js';

const Message = sequelize.define(
  'Message',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    conversationId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    senderType: {
      type: DataTypes.ENUM('customer', 'agent'),
      allowNull: false,
    },
    providerMessageId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    messageType: {
      type: DataTypes.ENUM('text'),
      allowNull: false,
      defaultValue: 'text',
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'messages',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['providerMessageId'],
        type: 'BTREE',
      },
      {
        fields: ['conversationId'],
        type: 'BTREE',
      },
      {
        fields: ['sentAt'],
        type: 'BTREE',
      },
    ],
  }
);

export default Message;
