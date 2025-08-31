const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');

const Tag = sequelize.define('Tag', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
}, {
  tableName: 'tags',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

Tag.associate = (models) => {
  Tag.belongsTo(models.Users, {
    foreignKey: 'userId',
    as: 'Users',
  });
  Tag.belongsToMany(models.Customer, {
    through: models.CustomerTag,
    foreignKey: 'tagId',
    as: 'Customers',
  });
  Tag.belongsToMany(models.Lead, {
    through: models.LeadTag,
    foreignKey: 'tagId',
    as: 'Leads',
  });
};

module.exports = Tag;
