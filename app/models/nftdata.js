'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class nftdata extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  nftdata.init({
    tid: DataTypes.STRING,
    nft_name: DataTypes.STRING,
    creator_name: DataTypes.STRING,
    description: DataTypes.STRING,
    p_background: DataTypes.STRING,
    token_standard: DataTypes.STRING,
    last_updated: DataTypes.STRING,
    token_id: DataTypes.STRING,
    nft_contract_address: DataTypes.STRING,
    current_owner: DataTypes.STRING,
    token_uri: DataTypes.STRING,
    u_discount: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'nftdata',
  });
  return nftdata;
};