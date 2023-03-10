'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('relatives', [
      {
        name: 'Son',
        createdAt: new Date(),
        updatedAt: new Date()
      }, 
      {
        name: 'Daughter',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Wife',
        createdAt: new Date(),
        updatedAt: new Date()
      }, 
      {
        name: 'Husband',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Other',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('relatives', null, {});
  }
};
