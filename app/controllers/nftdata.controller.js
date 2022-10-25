const jwt = require("jsonwebtoken");
const models = require("../models");  //this will be handled by ./models/index.js
const { v4: uuidv4 } = require("uuid");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const e = require("express");
const rs = require('jsrsasign');
const rsu = require('jsrsasign-util');
const Web3 = require('web3');
// const web3 = new Web3('https://rpc.ankr.com/polygon_mumbai');
const web3 = new Web3('http://localhost:8454');     //any RPC URL is fine for validation of signed messages.
//module imports
const UserVerify = models.user_verify;
const LoginVerify = models.login_verify;
const NFTData = models.nftdata;
const User = models.users;

dotenv.config();

//list all NFT items
exports.listNfts = async (req, res) => {
    //output the database

    await NFTData
        .findAll({
            where: {
                listing_status: true
            },
            attributes: ['nft_name', 'token_uri', 'image_url', 'price', 'creator_name', 'description', 'token_standard', 'current_owner'],
        })
        .then((items) => {
            res.send(items);
        })
        .catch((err) => {
            res.status(500).send({
                message: "There was some error to fetch nftdata records",
                error: err
            });
        });
};

//create the new nft item entry in nftdata
exports.newMint = async (req, res) => {
    //storing data
    const NFT_NAME = req.body.nft_name;
    const NFT_CONTRACT_ADDRESS = req.body.nft_contract_address;
    const TOKEN_ID = req.body.token_id;
    const TOKEN_URI = req.body.token_uri;
    const IMAGE_URL = req.body.image_url;
    const CREATOR_NAME = req.body.creator_name;
    const CREATOR_ADDRESS = req.body.creator_address;
    const DESCRIPTION = req.body.description;
    const TOKEN_STANDARD = req.body.token_standard;
    const CURRENT_OWNER = req.body.current_owner;
    const LISTING_STATUS = req.body.listing_status;
    const PRICE = req.body.price;

    const newNFTMintItem = {
        nft_name: NFT_NAME,
        nft_contract_address: NFT_CONTRACT_ADDRESS,
        token_id: TOKEN_ID,
        token_uri: TOKEN_URI,
        image_url: IMAGE_URL,
        price: PRICE,
        creator_name: CREATOR_NAME,
        creator_address: CREATOR_ADDRESS,
        description: DESCRIPTION,
        token_standard: TOKEN_STANDARD,
        current_owner: CURRENT_OWNER,
        listing_status: LISTING_STATUS
    };

    await NFTData
        .create(newNFTMintItem)
        .then(data => {
            //send this unique string in body of response, and continue login process
            res.send({
                status: "SUCCESS",
                message: "Data was successfully updated in the database."
            });
        })
        .catch(err => {
            res.status(500).send({
                message: "Not able to create nftdata entry in database.",
                error: err.original.detail
            });
        });

};