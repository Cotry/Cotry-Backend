'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class login_verify extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  login_verify.init({
    wallet_address: DataTypes.STRING,
    session_id: DataTypes.STRING,
    nonce: DataTypes.STRING,
    auth_status: DataTypes.BOOLEAN,
    created_at: DataTypes.DATE,
    expires_at: DataTypes.DATE
  }, {
    sequelize,
    timestamps: false,
    modelName: 'login_verify',
  });
  return login_verify;
};