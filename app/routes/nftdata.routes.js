module.exports = app => {
    const nftdata = require("../controllers/nftdata.controller.js");

    var router = require("express").Router();

    // List all NFT for marketplace
    router.get("/listnfts", nftdata.listNfts);

    // List my owned NFT for my profile
    router.get("/listmynfts", nftdata.listMyNfts);

    // New mint update to database
    router.post("/newmint", nftdata.newMint);

    app.use("/api/nft/", router);
};