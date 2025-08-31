const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');

const Lead = sequelize.define('Lead', {
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
    }
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
  tableName: 'leads',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

Lead.associate = (models) => {
  Lead.belongsTo(models.Users, {
    foreignKey: 'userId',
    as: 'Users'
  });
  Lead.belongsTo(models.VCard, {
    foreignKey: 'vcardId',
    as: 'Vcard'
  });
  Lead.hasMany(models.Interaction, {
    foreignKey: 'leadId',
    as: 'Interactions',
    onDelete: 'CASCADE'
  });
  Lead.hasMany(models.Task, {
    foreignKey: 'leadId',
    as: 'Tasks',
    onDelete: 'SET NULL'
  });
  Lead.belongsToMany(models.Tag, {
    through: models.LeadTag,
    foreignKey: 'leadId',
    as: 'Tags'
  });
};

module.exports = Lead;
