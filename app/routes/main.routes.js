module.exports = app => {
    const main = require("../controllers/main.controller.js");

    var router = require("express").Router();

    // Prepare-login for new login request.
    router.post("/prelogin", main.prelogin);

    // login using web3 digital signatures
    router.post("/login", main.login);

    // logout session.
    router.post("/usercheck", main.checkUsername);

    // logout session.
    router.get("/logout", main.logout);

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