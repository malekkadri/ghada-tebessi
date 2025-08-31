const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');

const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    allowNull: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  vcardId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'vcards',
      key: 'id'
    },
    onDelete: 'SET NULL'
  }
}, {
  tableName: 'customers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

Customer.associate = (models) => {
  Customer.belongsTo(models.Users, {
    foreignKey: 'userId',
    as: 'Users'
  });
  Customer.belongsTo(models.VCard, {
    foreignKey: 'vcardId',
    as: 'Vcard'
  });
  Customer.hasMany(models.Interaction, {
    foreignKey: 'customerId',
    as: 'Interactions',
    onDelete: 'CASCADE'
  });
  Customer.hasMany(models.Task, {
    foreignKey: 'customerId',
    as: 'Tasks',
    onDelete: 'SET NULL'
  });

  Customer.belongsToMany(models.Tag, {
    through: models.CustomerTag,
    foreignKey: 'customerId',
    as: 'Tags'
  });
};

module.exports = Customer;
