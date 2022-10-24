module.exports = app => {
    const main = require("../controllers/nftdata.controller.js");

    var router = require("express").Router();

    // List all NFT
    router.get("/listnfts", main.listNfts);

    // New mint update to database
    router.post("/newmint", main.newMint);

    app.use("/api/nft/", router);
};