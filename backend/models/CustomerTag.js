const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');

const CustomerTag = sequelize.define('CustomerTag', {
  customerId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'customers',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  tagId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'tags',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
}, {
  tableName: 'customer_tags',
  timestamps: false,
});

module.exports = CustomerTag;
