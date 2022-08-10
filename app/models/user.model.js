module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("user", {
    firstName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    lastName: {
      type: Sequelize.STRING
    },
    walletAddress: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    walletType: {
      type: Sequelize.STRING
    },
    userName: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false

    },
    walletBalance: {
          type: Sequelize.DECIMAL(10,2),
        }
  });
  return User;
};
