const jwt = require("jsonwebtoken");
const models = require("../models");  //this will be handled by ./models/index.js
const { v4: uuidv4 } = require("uuid");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const e = require("express");
const rs = require('jsrsasign');
const rsu = require('jsrsasign-util');
//module imports
const UserVerify = models.user_verify;
const LoginVerify = models.login_verify;
const User = models.users;

dotenv.config();

exports.prelogin = async (req, res) => {
    //check if session is part of cookie
    //this is already in-place, but just noted for logic purpose.
    // if (!req.cookies.vericheck) {
    //     //cookie does not have session ID
    //     //send "set-cookie: vericheck SESSION_ID" along with the response
    //     //don't send any response yet, just set cookie header.

    // }

    //check if wallet address (after sign in to sequence wallet) is in body
    if (!req.body.wallet_address) {
        res.status(400).send({
            message: "Wallet address is required! Ensure user is singed-up first."
        });
        return;
    }

    //check if user exists
    let isUserExists = false;
    await User
        .count({ where: { wallet_address: req.body.wallet_address } })
        .then((count) => {
            if (count > 0) {
                isUserExists = true;
            }
        });
    console.log("Is user exists: ", isUserExists);

    const generatedUniqueString = uuidv4();

    //this requires
    // console.log(req.cookies);

    //only if user exists perform pre-login
    if (isUserExists) {
        const loginVerifyData = {
            wallet_address: req.body.wallet_address,
            nonce: generatedUniqueString,
            auth_status: false,
            session_id: req.cookies.vericheck, //sending session ID in body clear text is not a secure practice.
            created_at: new Date(),
            updated_at: new Date()
        };

        await LoginVerify
            .count({ where: { wallet_address: req.body.wallet_address } })
            .then(async (count) => {
                //YES - send response that session is already authenticated.

                console.log("Count of lookup query: ", count);

                if (count > 0) {
                    res.send({
                        message: "User is already prepared for login."
                    });
                    return;
                } else {
                    //generate "unique_string" and update it in user validation database
                    await LoginVerify
                        .create(loginVerifyData)
                        .then(data => {
                            //send this unique string in body of response, and continue login process
                            res.send({
                                nonce: generatedUniqueString
                            });
                        })
                        .catch(err => {
                            console.log("Error is here");
                            res.status(500).send({
                                message: "Wallet address must be unique. the user already has an authenticated session active."
                            });
                        });
                }
            })
            .catch(async (err) => {
                res.status(500).send({
                    message:
                        err.message || "Some error occurred while querying the Login Verify."
                });
            });
    } else {
        res.send({
            message: "User is not signed up with Cotry. Please sign up first."
        });
        return;
    }
};

exports.login = async (req, res) => {
    //check if all required parameters is sent.
    if (!req.body.atTime || !req.body.wallet_address || !req.body.username || !req.body.nonce || !req.cookies.vericheck) {
        res.status(400).send({
            message: "atTime, wallet_address, username, nonce (fetched from prelogin)."
        });
        return;
    }

    const WALLETADDRESS = req.body.wallet_address;
    let loggedin = false;

    //check if user is already authenticated
    await LoginVerify
        .count({ where: { wallet_address: WALLETADDRESS } })  //PENDING - additional and of session ID
        .then(async (count) => {
            //PENDING - Expiry checking
            if (count = 1) {
                loggedin = true;
                res.status(200).send({
                    message: "User is already logged in."
                });
                return;
            }
        });

    // //cookie session ID must be equal to body session id
    // if (req.body.session_id != req.cookies.vericheck) {
    //     //restart the login process
    // }

    if (!loggedin) {
        //verify nonce
        await LoginVerify
            .count({ where: { nonce: req.body.nonce } })
            .then(async (count) => {
                if (count = 1) {
                    //now, we can proceed to verify the signature and make the token authenticated if all good with verification.
                    //PENDING - verify signature
                    let wallet_address = WALLETADDRESS;
                    let nonce = req.body.nonce;
                    let sigVal = req.body.digital_signature;
                    let data = wallet_address + nonce;

                    var sMsg = data;
                    var hSig = sigVal;
                    // let publicKey = process.env.DIGSIG_PUBLIC_KEY;  //not working
                    let publicKey =
                        "-----BEGIN PUBLIC KEY-----\nMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAqSwl56yKTM3NLLo+LyfE\nq3K15EnyqTLGVuwrHE2Xqg7uCitd158Dy1njLTtsv1msRktAYa/KIvfRVexWaqVI\n5ufxYj/mZX2SZ2RM7NA+zs1WoHSDPCsxqS2RBB/r4aqn3ISfnm4cf32emApDG8Xh\n9PCDIp80glkkIHxz4CmgRwF1wl7EOiou0RXGWjOfFETflN/53kQNTjUbEnEpjgAm\nHAG85IARnkE0yeZ5buxk0JzI1moyGOqBTt5eiGaFxmfpLrtKROZ/YABHWOh93s0N\nDhaY3zSZyik3P8sNbOCeefH7a9Z4hfveKgmUyLmED1wTyArNn4mBUfEN23p2YDgE\nml696WHsvQqbhF9fCUdMi0vVWaU1zsHPrw++OzWMMh0XwvyIDWhi7DZWK2FQBgcZ\nqLFyCGWElcOI47nf/sGTs7tBmkXz7riGzXqduK99wGIAceNdVq51YEtbvtOgFQvN\nb8+3B5JGgD9DNE+NTaExekHjARGMNPyMu0CnDhlfLeak+9+OJ0yvkkdMlQsb7WwL\nJgYdh7kpBOYRrbGd5yJMLnQ8Jxxn6tH1HEp8YM8Tbx4dEsQf6YnQmeHe8Okc2m+d\nnZb/ZVxteDAkPQRiizuIJ+TpBa80wLvVhLnh3eneoVBm7JSI3MZedaSNhmTwIFJD\neJtuESgtVxsQbgjC6vpVjAUCAwEAAQ==\n-----END PUBLIC KEY-----\n";

                    // hSig = hSig.replace(/[^0-9a-f]+/g, "");

                    var pubKey = rs.KEYUTIL.getKey(publicKey);
                    var isValid = pubKey.verify(sMsg, hSig);

                    // display verification result
                    if (isValid) {
                        console.log("valid, moving further");
                    } else {
                        res.status(400).send({
                            message: "Username verification failed, please provide the valid details!"
                        });
                        return;
                    }

                    //update the database that user is authenticated.
                    await LoginVerify
                        .update({ auth_status: true }, {
                            limit: 1,
                            where: {
                                wallet_address: WALLETADDRESS
                            }
                        })
                        .then(num => {
                            console.log(num);
                            if (num == 1) {
                                res.send({
                                    message: `User with wallet address = ${WALLETADDRESS} was authenticated successfully.`
                                });
                            } else {
                                res.send({
                                    message: `Cannot update User with wallet address = ${WALLETADDRESS}. Maybe User's address is not part of Login Verify table`
                                });
                            }
                        })
                        .catch(err => {
                            res.status(500).send({
                                message: "Error updating User with wallet address = " + WALLETADDRESS
                            });
                        });

                    //update the expiry time. every thing is directly associated with session-id, hence to logout using timeout simply expire the session.

                } else {
                    //you need to fetch the "nonce first"
                    res.send({
                        message: "User has not fetched nonce. Please get it from /prelogin."
                    });
                }
            })
            .catch(async (err) => {
                res.status(500).send({
                    message:
                        err.message || "Some error occurred while querying the Login nonce record."
                });
            });
    }
};

// // handle generate JWT endpoint.
// exports.login = (req, res) => {
//     // decode the JWT token and fetch the body
//     if (!req.body.username) {
//         res.status(400).send({
//             message: "Username is required!"
//         });
//         return;
//     }

//     // validated the signed sequence message

//     // If the code reaches here then user authentication is validated.
//     const uname = req.body.userName;

//     // check if and username exists.
//     const payload = { userName: uname };
//     const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET); //set expiration date time.
//     // res.status(200).send({
//     //     message: "The wallet address " + addr + " is received."
//     // });

//     const payloadHeader = "Bearer " + accessToken;
//     res.set('Authorization', payloadHeader);
//     res.send({ Status: "JWT Token is set in header." });
// };

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
                            User
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

