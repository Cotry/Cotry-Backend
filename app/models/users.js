'use strict';
const {
  Model
} = require('sequelize');
const models = require("../models");  //this will be handled by ./models/index.js
module.exports = (sequelize, DataTypes) => {
  class users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  users.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    username: DataTypes.STRING,
    interests: DataTypes.STRING,
    wallet_address: DataTypes.STRING,
    profile_pic_url: DataTypes.STRING,
    wallet_type: DataTypes.STRING,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
    verified: DataTypes.BOOLEAN
  }, {
    sequelize,
    timestamps: false,
    modelName: 'users',
  });
  return users;
};