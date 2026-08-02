import { DataTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { sequelize } from '../config/database.js';

const Conversation = sequelize.define(
  'Conversation',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    channelId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    providerConversationId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('open', 'pending', 'closed'),
      allowNull: false,
      defaultValue: 'open',
    },
    lastMessageAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'conversations',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['channelId', 'providerConversationId'],
        type: 'BTREE',
      },
      {
        fields: ['customerId'],
        type: 'BTREE',
      },
      {
        fields: ['channelId'],
        type: 'BTREE',
      },
      {
        fields: ['lastMessageAt'],
        type: 'BTREE',
      },
    ],
  }
);

export default Conversation;
