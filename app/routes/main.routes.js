module.exports = app => {
    const main = require("../controllers/main.controller.js");

    var router = require("express").Router();

    // Create JWT session for new email
    router.post("/login", main.login);

    // Verify email during onboarding
    router.get("/user/verify/:_user_id/:_unique_string", main.verifyemail);

    //Email verify confirmation
    router.get("/verified", (req, res) => {
        res.json({
            message: "The email is verified."
        });
    });

    app.use("/api/", router);
};