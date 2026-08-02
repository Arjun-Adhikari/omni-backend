import { DataTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { sequelize } from '../config/database.js';

const Customer = sequelize.define(
  'Customer',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    avatarUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'customers',
    timestamps: true,
  }
);

export default Customer;
