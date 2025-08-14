const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');

const Interaction = sequelize.define('Interaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'customers',
      key: 'id'
    }
  },
  leadId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'leads',
      key: 'id'
    }
  }
}, {
  tableName: 'interactions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

Interaction.associate = (models) => {
  Interaction.belongsTo(models.Users, {
    foreignKey: 'userId',
    as: 'Users'
  });
  Interaction.belongsTo(models.Customer, {
    foreignKey: 'customerId',
    as: 'Customer'
  });
  Interaction.belongsTo(models.Lead, {
    foreignKey: 'leadId',
    as: 'Lead'
  });
};

module.exports = Interaction;
