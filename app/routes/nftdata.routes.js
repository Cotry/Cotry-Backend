module.exports = app => {
    const nftdata = require("../controllers/nftdata.controller.js");

    var router = require("express").Router();

    // List all NFT for marketplace
    router.get("/listnfts", nftdata.listAllNfts);


    // List all NFT for marketplace
    router.post("/querynft", nftdata.queryNft);

    // List my owned NFT for my profile
    router.get("/listmynfts", nftdata.listMyNfts);

    // New mint update to database
    router.post("/newmint", nftdata.newMint);

    // New mint update to database
    router.post("/buynft", nftdata.buyNFts);

    app.use("/api/nft/", router);
};