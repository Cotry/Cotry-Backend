'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await queryInterface.bulkInsert(
      'users',
      [
        {
          name: 'John Doe',
          email: "john@gmail.com",
          username: "jdoe123",
          wallet_address: "0x04dfa364501774Ffc8bEB3842de5F6ce866FEb4D",
          wallet_type: "sequence",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: 'Mary Jane',
          email: "mary@gmail.com",
          username: "mjane456",
          wallet_address: "0x91713D44366a54915326533931676B59b6dd0B14",
          wallet_type: "sequence",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );

    // await queryInterface.bulkInsert(
    //   'walletaccounts',
    //   [
    //     {
    //       user_id: 1,
    //       wallet_address: "0x04dfa364501774Ffc8bEB3842de5F6ce866FEb4D",
    //       wallet_type: "sequence",
    //       wallet_balance: "0",
    //       updated_at: new Date(),
    //     },
    //     {
    //       user_id: 2,
    //       wallet_address: "0x91713D44366a54915326533931676B59b6dd0B14",
    //       wallet_type: "sequence",
    //       wallet_balance: "0",
    //       updated_at: new Date(),
    //     },
    //   ],
    //   {}
    // );

  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('users', null, {});
    // await queryInterface.bulkDelete('walletaccounts', null, {});
  }
};
