import { DataTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { sequelize } from '../config/database.js';

const CustomerIdentity = sequelize.define(
  'CustomerIdentity',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    channelId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    providerUserId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    providerProfile: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    tableName: 'customer_identities',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['channelId', 'providerUserId'],
        type: 'BTREE',
      },
      {
        fields: ['customerId'],
        type: 'BTREE',
      },
    ],
  }
);

export default CustomerIdentity;
