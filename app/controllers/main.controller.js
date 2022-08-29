const jwt = require("jsonwebtoken");
const models = require("../models");  //this will be handled by ./models/index.js
const UserVerify = models.user_verify;
const Users = models.users;
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");

dotenv.config();

// handle login endpoint.
exports.login = (req, res) => {

    // decode the JWT token and fetch the body
    if (!req.body.username) {
        res.status(400).send({
            message: "Username is required!"
        });
        return;
    }

    // validated the signed sequence message

    // If the code reaches here then user authentication is validated.
    const uname = req.body.userName;

    // check if and username exists.
    const payload = { userName: uname };
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET); //set expiration date time.
    // res.status(200).send({
    //     message: "The wallet address " + addr + " is received."
    // });

    const payloadHeader = "Bearer " + accessToken;
    res.set('Authorization', payloadHeader);
    res.send({ Status: "JWT Token is set in header." });

};

exports.verifyemail = (req, res) => {
    let { _user_id, _unique_string } = req.params;
    // console.log("The params are : ", req.params);
    // console.log("The user_id is : ", _user_id);
    // console.log("The unique String is : ", _unique_string);
    UserVerify
        .findOne({ where: { user_id: _user_id } })
        .then((result) => {
            // console.log("The result is: ", result);
            //user verification record exists so we proceed
            const { expires_at } = result;   // #pending
            const hashedUniqueString = result.unique_string;

            //check if link is expired.
            if (expires_at < Date.now()) {
                UserVerify.destroy({ where: { user_id: _user_id } })
                    .then((result) => {
                        UserVerify
                            .destroy({ where: { user_id: _user_id } })
                            .then(() => {
                                res.json({
                                    message: "The verification link is expired. Please signup again."
                                });
                            })
                            .catch((error) => {
                                console.log(error);
                                res.json({
                                    message: "Not able to delete the user, may be the user is not present in UserVerify Model."
                                });
                            });
                    })
                    .catch((error) => {
                        console.log(error);
                        res.json({
                            message: "The verification link is expired or some other error."
                        });
                    });
            } else {
                //handle if verification record is still valid.
                //first compare the hashed unique string
                // _unique_string : Is what we got from the user verify click URL.
                // hashedUniqueString: Is what we got from query the user_verify table.
                bcrypt
                    .compare(_unique_string, hashedUniqueString)
                    .then((result) => {
                        if (result) {
                            //if the string matches.
                            Users
                                .update({ verified: true }, { where: { id: _user_id } })    // this will not be "user_id" because we are querying the "users" model.
                                .then(() => {
                                    //this is not the final action.
                                    UserVerify
                                        .destroy({ where: { user_id: _user_id } })   //this is the final action.
                                        .then(() => {
                                            res.json({
                                                message: "SUCCESS, THE EMAIL IS VERIFIED!!!!."
                                            });
                                        })
                                        .catch((error) => {
                                            console.log(error);
                                            res.json({
                                                message: "After successful update of users.verified, I am not able to delete the user_verify record."
                                            });
                                        });
                                })
                                .catch((error) => {
                                    console.log(error);
                                    res.json({
                                        message: "The user id is not present in the user verify database."
                                    });
                                });
                        } else {
                            // if the strings does not match.
                            res.json({
                                message: "During comparison, the unique string did not match with database string 2."
                            });
                        }
                    })
                    .catch((error) => {
                        console.log(error);
                        res.json({
                            message: "During comparison, the unique string did not match with database string 1."
                        });
                    });
            }
        })
        .catch((error) => {
            console.log(error);
            res.json({
                message: "The verification failed because not able to locate user in user verify database. Not able to find the user's id in user_verify model. Else some unwanted error occured."
            });
        });

}

