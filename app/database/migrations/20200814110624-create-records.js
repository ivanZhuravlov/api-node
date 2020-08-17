'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('records', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT.UNSIGNED
      },
      lead_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        references: {         // User belongsTo Company 1:1
          model: 'Leads',
          key: 'id'
        }
      },
      datetime: {
        type: Sequelize.DATE
      },
      call_sid: {
        type: Sequelize.STRING
      },
      sid: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('records');
  }
};