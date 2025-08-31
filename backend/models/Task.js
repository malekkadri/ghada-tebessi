const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'due_date',
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending',
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
    field: 'user_id',
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'customers',
      key: 'id',
    },
    onDelete: 'SET NULL',
    field: 'customer_id',
  },
  leadId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'leads',
      key: 'id',
    },
    onDelete: 'SET NULL',
    field: 'lead_id',
  },
}, {
  tableName: 'tasks',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

Task.associate = (models) => {
  Task.belongsTo(models.Users, { foreignKey: 'userId', as: 'Users' });
  Task.belongsTo(models.Customer, { foreignKey: 'customerId', as: 'Customer' });
  Task.belongsTo(models.Lead, { foreignKey: 'leadId', as: 'Lead' });
};

module.exports = Task;
