const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const validateJWT = function (req, res, next) {

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, req_body) => {
        // if error do this.
        if (err) return res.status(403).send({
            message: "Invalid JWT verification token."
        });

        console.log("The JWT Token is valid.");

        //if valid do this, create a new property "valid".
        req.valid = req_body;    //why? to confirm after verify and store status of verified data.
    });

    next();
};

module.exports = validateJWT;