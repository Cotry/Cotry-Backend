module.exports = app => {
    const nftdata = require("../controllers/nftdata.controller.js");

    var router = require("express").Router();

    // List all NFT for marketplace
    router.get("/listnfts", nftdata.listAllNfts);

    // Get one NFT
    router.post("/querynft", nftdata.queryListedNft);

    // Mint new NFT
    router.post("/newnft", nftdata.newNFTCreate);

    // New mint update to database
    router.post("/buynft", nftdata.buyNFts);

    // List All NFTs Bought by all users
    router.get("/users/allpurchases", nftdata.listAllPurchaseNFTs);

    // List All NFTs Bought by a user
    router.post("/user/purchases", nftdata.listPurchaseNFTsByUser);

    // List my sold NFT for my profile
    router.post("/user/sold", nftdata.listSoldNFTsByUser);

    // Delete all minting data - NFTRecord
    router.get("/deleteallminted", nftdata.deleteMintingData);

    // Delete one NFT
    router.post("/deletenft", nftdata.deleteSingleNFT);

    // Delete all NFTs
    router.get("/deleteallnft", nftdata.deleteAllNFTs);

    app.use("/api/nft/", router);
};