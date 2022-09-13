'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('login_verifies', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      wallet_address: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      session_id: {
        type: Sequelize.STRING
      },
      nonce: {
        type: Sequelize.STRING
      },
      auth_status: {
        type: Sequelize.BOOLEAN
      },
      created_at: {
        type: Sequelize.DATE
      },
      expires_at: {
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('login_verifies');
  }
};