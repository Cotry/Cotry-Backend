const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

// handle login endpoint.
exports.login = (req, res) => {

    // decode the JWT token and fetch the body
    if (!req.body.walletAddress) {
        res.status(400).send({
            message: "Wallet Address is required!"
        });
        return;
    }

    // validated the signed sequence message

    // If the code reaches here then user authentication is validated.
    const addr = req.body.walletAddress;
    const uname = req.body.userName;

    // check if wallet address and username exists.

    const payload = { walletAddress: addr, userName: uname };
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET); //set expiration date time.
    // res.status(200).send({
    //     message: "The wallet address " + addr + " is received."
    // });

    const payloadHeader = "Bearer " + accessToken;
    res.set('Authorization', payloadHeader);
    res.send({ Status: "JWT Token is set in header." });

};
