const jwt = require("jsonwebtoken");
const models = require("../models");  //this will be handled by ./models/index.js
const { v4: uuidv4 } = require("uuid");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const e = require("express");
const rs = require('jsrsasign');
const rsu = require('jsrsasign-util');
const Web3 = require('web3');
// const web3 = new Web3('https://rpc.ankr.com/polygon_mumbai');
const web3 = new Web3('http://localhost:8454');     //any RPC URL is fine for validation of signed messages.
//module imports
const UserVerify = models.user_verify;
const LoginVerify = models.login_verify;
const User = models.users;

dotenv.config();

exports.prelogin = async (req, res) => {

    const WALLETADDRESS = req.body.wallet_address;
    const CURRENT_SESSION_ID = req.cookies.vericheck;
    let requiredSessionId = '';
    let currentNonce = '';
    let isSessionExists = false;

    //check if the session id is a valid express-sessions ID.
    //if I send an invalid session id in cookie, I get Set-Cookie header in response, this means new session ID will be assigned everytime I send invalid session id.
    //if I send valid session id in cookie, I will not get Set-Cookie header in response, it means my current session is running valid and active.

    //check if wallet address (after sign in to sequence wallet) is in body
    if (!WALLETADDRESS) {
        res.status(400).send({
            message: "Wallet address is required! Ensure user is singed-up to cotry first."
        });
        return;
    }

    //check if user exists
    let isUserExists = false;
    await User
        .count({ where: { wallet_address: WALLETADDRESS } })
        .then((count) => {
            if (count > 0) {
                isUserExists = true;
            }
        });
    // console.log("Is user exists: ", isUserExists);

    const generatedUniqueString = uuidv4();

    //this requires
    // console.log(req.cookies);

    //only if user exists perform pre-login
    if (isUserExists) {
        let nowDate = new Date();
        let createdDate = nowDate.setHours(nowDate.getHours() + 0);
        let expiredDate = nowDate.setHours(nowDate.getHours() + 2);

        console.log("Created date is: ", createdDate);
        console.log("Expired date is: ", expiredDate);

        const loginVerifyData = {
            wallet_address: WALLETADDRESS,
            nonce: generatedUniqueString,
            auth_status: false,
            session_id: CURRENT_SESSION_ID, //sending session ID in body clear text is not a secure practice.
            created_at: createdDate,
            expires_at: expiredDate             //session will hard expire in 2 hours
        };

        await LoginVerify
            .findOne({ where: { wallet_address: WALLETADDRESS } })
            .then(async (entry) => {
                //YES - send response that session is already authenticated.
                // console.log("Count of lookup query: ", count);
                // console.log("The lookup result: ", entry);

                //check if session is valid
                if (entry) {
                    isSessionExists = true;
                    requiredSessionId = entry.session_id;
                    currentNonce = entry.nonce;
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

        if (isSessionExists) {
            if (requiredSessionId == CURRENT_SESSION_ID) {
                res.send({
                    message: "User is already prepared for login. \n Please use the below nonce.",
                    nonce: currentNonce
                });
                return;
            } else {
                await LoginVerify.destroy({ where: { wallet_address: WALLETADDRESS } });

                res.status(400).send({
                    message: "User session is now invalid. The stale session is removed now. please visit /prelogin to initiate login process (generate nonce again)."
                });
            }
        }
    } else {
        res.send({
            message: "User is not signed up with Cotry. Please sign up first."
        });
        return;
    }


};

exports.login = async (req, res) => {

    const WALLETADDRESS = req.body.wallet_address;
    const NONCE = req.body.nonce;
    const SIGVAL = req.body.signature;
    const CURRENT_SESSION_ID = req.cookies.vericheck;

    //check if the session id is a valid express-sessions ID.
    //if I send an invalid session id in cookie, I get Set-Cookie header in response, this means new session ID will be assigned everytime I send invalid session id.
    //if I send valid session id in cookie, I will not get Set-Cookie header in response, it means my current session is running valid and active.

    let loggedin = false;
    let isexpired = false;
    let isInvalidSession = false;
    let isPrelogin = false;
    let requiredSessionId = '';
    let error = '';

    //check if user is already authenticated.
    if (CURRENT_SESSION_ID === undefined) {
        res.status(500).send({
            message: "Unable to read Session_ID."
        });
        return;
    } else {
        await LoginVerify
            .findOne({ where: { session_id: CURRENT_SESSION_ID } })
            .then(async (entry) => {
                if (entry !== null) {
                    const expiryTime = entry.expires_at;
                    // const expiryTime = new Date(entry.expires_at).valueOf();

                    //if session is expired
                    if (expiryTime < Date.now()) {
                        // console.log("The session expire value is: ", expiryTime);
                        // console.log("The current time value is: ", Date.now());
                        isexpired = true;

                        //remove the entry in LoginVerify
                        await LoginVerify.destroy({ where: { session_id: CURRENT_SESSION_ID } });

                    } else if (entry.auth_status) {     //if session is not expired and user is logged in.
                        loggedin = true;
                    }
                } else {
                    isInvalidSession = true;
                    await LoginVerify
                        .findOne({ where: { wallet_address: WALLETADDRESS } })
                        .then(async (entry) => {

                            //check for expired session.
                            const expiryTime = entry.expires_at;
                            // const expiryTime = new Date(entry.expires_at).valueOf();

                            //if session is expired
                            if (expiryTime < Date.now()) {
                                // console.log("The session expire value is: ", expiryTime);
                                // console.log("The current time value is: ", Date.now());
                                isexpired = true;

                                //remove the entry in LoginVerify
                                await LoginVerify.destroy({ where: { wallet_address: WALLETADDRESS } });
                            }

                            if (entry) {
                                requiredSessionId = entry.session_id;
                                isPrelogin = true;
                            }
                        })
                        .catch(async (err) => {
                            error = err;
                        });
                }
            })
            .catch(async (err) => {
                error = err;
            });
    }

    if (error != '') {
        res.status(500).send({
            message:
                error.message || "Some error occurred while querying the Login nonce record."
        });
        return;
    }

    if (isexpired) {
        res.status(400).send({
            message: "User session expired. This stale session is removed, please visit /prelogin to initiate login process. (generate nonce again)"
        });
        return;
    }

    if (isPrelogin) {

        await LoginVerify.destroy({ where: { wallet_address: WALLETADDRESS } });

        res.status(400).send({
            message: "User session id is not consistent. This stale session is removed, please visit /prelogin to initiate login process. (generate nonce again)",
            currentSession: CURRENT_SESSION_ID,
            requiredSession: requiredSessionId
        });
        return;
    }

    if (isInvalidSession) {
        res.status(400).send({
            message: "User session id is not authenticated. Please visit /prelogin to initiate login process. (generate nonce again)",
        });
        return;
    }

    if (loggedin) {
        //refresh expiry time with 30min.
        //PENDING

        res.status(200).send({
            message: "User is already logged in."
        });
        return;
    }

    //if reached here then user is not logged in.

    //check if all required parameters is sent.
    if (!WALLETADDRESS || !SIGVAL || !NONCE) {
        res.status(400).send({
            message: "atTime, wallet_address, username, nonce (fetched from prelogin)."
        });
        return;
    }

    if (!loggedin) {
        //verify nonce
        await LoginVerify
            .count({ where: { nonce: NONCE } })
            .then(async (count) => {
                if (count = 1) {
                    // check if the nonce is created within 6 hours or not?
                    //PENDING

                    //now, we can proceed to verify the signature and make the token authenticated if all good with verification.
                    let data = WALLETADDRESS + NONCE;
                    let isValid = false;

                    const verifyAddress = await web3.eth.accounts.recover(
                        data,
                        SIGVAL
                    );

                    console.log("The req body address: ", WALLETADDRESS);
                    console.log("The verified address: ", verifyAddress);

                    //check digital signature verification. If not verified then return 401 not authorized.
                    if (WALLETADDRESS != verifyAddress) {
                        res.status(401).send({
                            message: "Invalid User Authentication."
                        });
                        return;
                    } else {
                        isValid = true;
                    }

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
                                return;
                            } else {
                                res.send({
                                    message: `Cannot update User with wallet address = ${WALLETADDRESS}. Maybe User's address is not part of Login Verify table`
                                });
                                return;
                            }
                        })
                        .catch(err => {
                            res.status(500).send({
                                message: "Error updating User with wallet address = " + WALLETADDRESS
                            });
                            return;
                        });

                    //update the expiry time. every thing is directly associated with session-id, hence to logout using timeout simply expire the session.
                    //PENDING

                } else {
                    res.status(400).send({
                        message: "User has not fetched nonce. Please get it from /prelogin first."
                    });
                    return;
                }
            })
            .catch(async (err) => {
                res.status(500).send({
                    message:
                        err.message || "Some error occurred while querying the Login nonce record."
                });
                return;
            });
    }
};

exports.logout = async (req, res) => {
    const CURRENT_SESSION_ID = req.cookies.vericheck;

    req.session.destroy(async function (err) {
        if (err) {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while express-session logout."
            });
        } else {
            //remove the entry in LoginVerify
            await LoginVerify.destroy({ where: { session_id: CURRENT_SESSION_ID } });
            res.clearCookie('vericheck');
            res.json({
                status: 'success',
                message: 'User is Successfully logged out.'
            });
        }
    });
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

