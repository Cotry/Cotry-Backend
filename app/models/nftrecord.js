'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {

  //This data structure will log all NFT being minted. Like copies of NFT.
  //The nftdata model is used to only store different types of NFTs.

  class nftrecord extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  nftrecord.init({
    nft_id: DataTypes.INTEGER,
    nft_contract_address: DataTypes.STRING,
    token_uri: DataTypes.STRING,
    token_ids: DataTypes.STRING,
    buyer_address: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'nftrecord',
  });
  return nftrecord;
};