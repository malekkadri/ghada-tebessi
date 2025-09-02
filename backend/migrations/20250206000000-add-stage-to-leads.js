'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('leads', 'stage', {
      type: Sequelize.ENUM('new', 'contacted', 'qualified', 'proposal', 'won', 'lost'),
      allowNull: false,
      defaultValue: 'new'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('leads', 'stage');
    if (queryInterface.sequelize.getDialect() === 'postgres') {
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_leads_stage";');
    }
  }
};
