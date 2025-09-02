const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');

const CRMHistory = sequelize.define('CRMHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false
  },
  entityType: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'entity_type'
  },
  entityId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'entity_id'
  },
  details: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'crm_history',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

CRMHistory.associate = (models) => {
  CRMHistory.belongsTo(models.Users, {
    foreignKey: 'userId',
    as: 'User'
  });
};

module.exports = CRMHistory;
