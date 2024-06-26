'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user_verify extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  user_verify.init({
    user_id: DataTypes.INTEGER,
    unique_string: DataTypes.STRING,  //email verification
    created_at: DataTypes.DATE,       //email verification
    expires_at: DataTypes.DATE        //email verification
  }, {
    sequelize,
    timestamps: false,
    modelName: 'user_verify',
  });
  return user_verify;
};