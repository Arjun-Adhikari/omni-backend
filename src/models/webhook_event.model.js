import { DataTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { sequelize } from '../config/database.js';

const WebhookEvent = sequelize.define(
  'WebhookEvent',
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
    eventType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rawPayload: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('received', 'processed', 'failed'),
      allowNull: false,
      defaultValue: 'received',
    },
    error: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    processedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'webhook_events',
    timestamps: true,
    indexes: [
      {
        fields: ['channelId'],
        type: 'BTREE',
      },
    ],
  }
);

export default WebhookEvent;
