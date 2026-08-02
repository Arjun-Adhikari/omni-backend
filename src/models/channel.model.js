import { DataTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { sequelize } from '../config/database.js';

const Channel = sequelize.define(
  'Channel',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    type: {
      type: DataTypes.ENUM('facebook'),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pageId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    accessToken: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    appSecret: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    verifyToken: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: 'channels',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['pageId'],
        type: 'BTREE',
      },
    ],
  }
);

export default Channel;
