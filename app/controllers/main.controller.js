// handle login endpoint.
exports.login = (req, res) => {

    // decode the JWT token and fetch the body
    if (!req.body.walletAddress) {
        res.status(400).send({
            message: "Wallet Address is required!"
        });
        return;
    }

    const addr = req.body.walletAddress;
    res.status(200).send({
        message: "The wallet address " + addr + " is received."
    });

};
