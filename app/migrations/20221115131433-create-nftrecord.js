'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('nftrecords', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nft_id: {
        type: Sequelize.INTEGER
      },
      nft_contract_address: {
        type: Sequelize.STRING
      },
      token_uri: {
        type: Sequelize.STRING
      },
      token_ids: {
        type: Sequelize.STRING
      },
      buyer_address: {
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
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('nftrecords');
  }
};