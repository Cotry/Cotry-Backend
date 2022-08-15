module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("user", {
    firstName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    userName: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    walletAddress: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    walletType: {
      type: Sequelize.STRING,
      allowNull: false
    },
    walletBalance: {
      type: Sequelize.STRING,
      allowNull: false,
      default: "0.0"
    }
  });
  return User;
};
