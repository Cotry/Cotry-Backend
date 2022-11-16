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
    nft_name: DataTypes.STRING,
    token_standard: DataTypes.STRING,
    nft_contract_address: DataTypes.STRING,
    supply_count: DataTypes.INTEGER,
    max_user_tokens: DataTypes.INTEGER,
    token_id: DataTypes.STRING,
    token_uri: DataTypes.STRING,
    image_url: DataTypes.STRING,
    price: DataTypes.STRING,
    current_owner: DataTypes.STRING,    //current owner is not needed.
    creator_name: DataTypes.STRING,
    creator_address: DataTypes.STRING,
    description: DataTypes.STRING,
    p_background: DataTypes.STRING,
    listing_status: DataTypes.BOOLEAN,
    u_promocode: DataTypes.STRING,
    u_merchandise: DataTypes.STRING,
    u_eventtickets: DataTypes.STRING,
    u_whiltelist: DataTypes.STRING,
    u_gift: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'nftdata',
  });
  return nftdata;
};