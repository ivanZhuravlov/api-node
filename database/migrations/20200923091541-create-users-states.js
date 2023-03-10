'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users_states', {
      user_id: {
        references: {
          model: 'users',
          key: 'id',
        },
        type: Sequelize.BIGINT.UNSIGNED,
      },
      state_id: {
        references: {
          model: 'states',
          key: 'id',
        },
        type: Sequelize.BIGINT.UNSIGNED,
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
    await queryInterface.dropTable('users_states');
  }
};