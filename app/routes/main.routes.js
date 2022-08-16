module.exports = app => {
    const main = require("../controllers/main.controller.js");

    var router = require("express").Router();

    // Create JWT session for new email
    router.post("/login", main.login);

    app.use("/api/", router);
};