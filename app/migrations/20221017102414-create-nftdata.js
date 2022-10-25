'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('nftdata', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nft_name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      nft_contract_address: {
        type: Sequelize.STRING
      },
      token_uri: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      image_url: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      token_standard: {
        type: Sequelize.STRING
      },
      token_id: {
        type: Sequelize.STRING
      },
      price: {
        type: Sequelize.STRING
      },
      listing_status: {
        type: Sequelize.BOOLEAN
      },
      creator_name: {
        type: Sequelize.STRING
      },
      creator_address: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },
      p_background: {
        type: Sequelize.STRING
      },
      current_owner: {
        type: Sequelize.STRING
      },
      u_discount: {
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
    await queryInterface.dropTable('nftdata');
  }
};