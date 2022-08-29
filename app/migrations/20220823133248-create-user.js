'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      wallet_address: {
        type: Sequelize.STRING,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "NONAME"
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      wallet_type: {
        type: Sequelize.STRING,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // await queryInterface.createTable('walletaccounts', {
    //   wallet_address: {
    //     type: Sequelize.STRING,
    //     allowNull: false,
    //     unique: true,
    //     references: {
    //       model: 'users', //name of the table
    //       key: 'wallet_address'       //name of the column
    //     }
    //   },
    //   wallet_type: {
    //     type: Sequelize.STRING,
    //     allowNull: false,
    //     defaultValue: "sequence"
    //   },
    //   wallet_balance: {
    //     type: Sequelize.STRING,
    //     allowNull: false,
    //     defaultValue: "0"
    //   },
    //   updated_at: {
    //     allowNull: false,
    //     type: Sequelize.DATE
    //   }
    // });

  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropAllTables();
    await queryInterface.dropTable('users');
    // await queryInterface.dropTable('walletaccounts');
  }
};