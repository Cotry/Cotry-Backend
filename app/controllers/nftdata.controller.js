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
const NFTRecord = models.nftrecord;
const User = models.users;

dotenv.config();

//list all NFT items
exports.listAllNfts = async (req, res) => {
    //output the database

    await NFTData
        .findAll({
            where: {
                listing_status: true
            },
            attributes: ['nft_name', 'token_uri', 'image_url', 'price', 'creator_name', 'creator_address', 'description', 'nft_contract_address', 'supply_count', 'u_promocode', 'u_merchandise', 'u_eventtickets', 'u_whiltelist', 'u_gift'],
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

//list my NFT items
exports.listMyNfts = async (req, res) => {
    //check if session is authenticated.
    //if yes then query the session id to get the wallet address.
    //and then get the nfts owned

    const CURRENT_SESSION_ID = req.cookies.vericheck;

    let isexpired = false;
    let loggedin = false;

    //input validation of session_id is PENDING
    await LoginVerify
        .findOne({ where: { session_id: CURRENT_SESSION_ID } })
        .then(async (entry) => {
            if (entry !== null) {
                //if session is expired
                if (entry.expires_at < Date.now()) {
                    // console.log("The session expire value is: ", expiryTime);
                    // console.log("The current time value is: ", Date.now());
                    isexpired = true;
                }

                //if user is already logged in
                if (entry.auth_status && !isexpired) {
                    loggedin = true;

                    //get list of all NFTs
                    await NFTData
                        .findAll({
                            where: {
                                wallet_address: entry.wallet_address,
                                listing_status: true
                            },
                            attributes: ['nft_name', 'token_uri', 'image_url', 'price', 'creator_name', 'creator_address', 'description', 'nft_contract_address', 'supply_count', 'u_promocode', 'u_merchandise', 'u_eventtickets', 'u_whiltelist', 'u_gift'],
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
                } else {
                    //user needs to login again
                    //PENDING

                }
            } else {
                //user needs to login
                //PENDING
            }
        });

    //user already authenticated
    if (loggedin) {
        //
    }
};

//create the new nft item entry in nftdata
exports.newMint = async (req, res) => {
    //storing data
    //improve code by destructuring
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
    const SUPPLY_COUNT = req.body.supply_count;
    const MAX_USER_TOKENS = req.body.max_user_tokens;
    const PROMOCODE = req.body.u_promocode;
    const MERCHANDISE = req.body.u_merchandise;
    const EVENTTICKETS = req.body.u_eventtickets;
    const WHITELIST = req.body.u_whiltelist;
    const GIFT = req.body.u_gift;

    const newNFTMintItem = {
        nft_name: NFT_NAME,
        token_standard: TOKEN_STANDARD,
        nft_contract_address: NFT_CONTRACT_ADDRESS,
        supply_count: SUPPLY_COUNT,
        max_user_tokens: MAX_USER_TOKENS,
        token_id: TOKEN_ID,
        token_uri: TOKEN_URI,
        image_url: IMAGE_URL,
        price: PRICE,
        current_owner: CURRENT_OWNER,
        creator_name: CREATOR_NAME,
        creator_address: CREATOR_ADDRESS,
        description: DESCRIPTION,
        listing_status: LISTING_STATUS,
        u_promocode: PROMOCODE,
        u_merchandise: MERCHANDISE,
        u_eventtickets: EVENTTICKETS,
        u_whiltelist: WHITELIST,
        u_gift: GIFT
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
                message: "Not able to create nftdata entry in database." + err,
                error: err.original.detail
            });
        });

};

//buy NFTs
exports.buyNFts = async (req, res) => {
    //improve code by destructuring
    const NFT_NAME = req.body.nft_name;
    const NFT_CONTRACT_ADDRESS = req.body.nft_contract_address;
    const TOKEN_URI = req.body.token_uri;
    const TOKENS_PURCHASED = req.body.tokens_purchased;
    const BUYER_ADDRESS = req.body.buyer_address;
    const TOKEN_IDS = req.body.token_ids;
    let nft_id_nftdata = 0;

    //fetch all the bought token ids for the buyer : TOKEN_IDS.
    //PENDING
    //CREATE A NEW CONTRACT FUNCTION FOR THIS.


    //fetch the nft id for the NFT from nftdata.
    //PENDING

    //create a single record for all nft purchased for a single type.
    let newNFTMintItem = {
        nft_id: nft_id_nftdata,
        nft_name: NFT_NAME,
        nft_contract_address: NFT_CONTRACT_ADDRESS,
        token_uri: TOKEN_URI,
        tokens_purchased: TOKENS_PURCHASED,
        buyer_address: BUYER_ADDRESS,
        tokens_ids: TOKEN_IDS,
    };

    await NFTRecord
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
                message: "Not able to create nftrecord entry in database." + err,
                error: err.original.detail
            });
        });
};