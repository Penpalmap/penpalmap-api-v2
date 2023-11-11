"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Users", "avatarNumber", {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: () => Math.floor(Math.random() * 3) + 1,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Users", "avatarNumber");
  },
};
