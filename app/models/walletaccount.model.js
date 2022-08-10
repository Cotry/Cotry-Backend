module.exports = (sequelize, Sequelize) => {
  const WalletAcccount = sequelize.define("walletAcccount", {
    walletAddress: {
      type: Sequelize.STRING,
      allowNull: false
    },
    walletBalance: {
      type: Sequelize.DECIMAL(10,10),
      allowNull: false
    }
  });
  return WalletAcccount;
};
