'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('leads', 'stage_timestamps', {
      type: Sequelize.JSON,
      allowNull: true,
    });
    await queryInterface.addColumn('customers', 'stage_timestamps', {
      type: Sequelize.JSON,
      allowNull: true,
    });
    await queryInterface.addColumn('customers', 'converted_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('customers', 'lead_created_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('leads', 'stage_timestamps');
    await queryInterface.removeColumn('customers', 'stage_timestamps');
    await queryInterface.removeColumn('customers', 'converted_at');
    await queryInterface.removeColumn('customers', 'lead_created_at');
  }
};
