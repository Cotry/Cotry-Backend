module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("user", {
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
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
      allowNull: true,
      defaultValue: "sequence"
    },
    walletBalance: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "0.0"
    }
  });
  return User;
};
