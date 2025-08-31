const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');

const LeadTag = sequelize.define('LeadTag', {
  leadId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'leads',
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
  tableName: 'lead_tags',
  timestamps: false,
});

module.exports = LeadTag;
