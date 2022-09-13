const nodemailer = require("nodemailer"); //email handler
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const fs = require('fs');
const util = require('util');
const unlinkFile = util.promisify(fs.unlink);
const dotenv = require("dotenv");
dotenv.config();
//module imports
const models = require("../models");  //this will be handled by ./models/index.js
const User = models.users;
const UserVerify = models.user_verify;
const { uploadFile, getFileStream } = require('../s3');

// configure email verification
let transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    type: "OAuth2",
    user: process.env.VERIFIER_SENDER_EMAIL,
    clientId: '1003833138269-84uqnqvvbunk9hkfddoi6f7ro20s8ch8.apps.googleusercontent.com',
    clientSecret: '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',
    refreshToken: '1//04dAkG1x30wE_CgYIARAAGAQSNwF-L9IrI-3_XROLQJT2aA1dROPJyrWi5WXopRPF2Y4h75-ofUQhay42jIEpovnZ3OOvLwEiiYU',
    accessToken: 'ya29.a0AVA9y1uBSO_wwCxnc3XXclRCvDpo9_zsxdFJpVbVMvxb9FA6O7XKJ3Hk61bTCK5lI-nlWFEmxiT3jbmFkpS_QlUFOZS_cEaJmBwmZuNbpMdX0pZLoV4VoNDM-gzkRUzQMeHn6WMWKoZiZWJIpILcKVnbB4GnaCgYKATASAQASFQE65dr866bS4vTXDtUi7ByfYjX1MQ0163'
  }
});

//id here is the id of the "users" model
const sendVerificationEmail = ({ id, email }, res) => {
  const currentUrl = process.env.PRODUCTIONHOSTSTRING;

  const uniqueString = uuidv4() + id;

  //mail options
  const mailOptions = {
    from: process.env.VERIFIER_SENDER_EMAIL,
    to: email,
    subject: "Verify Your Email",
    html: `<p>Verify your email address to complete the signup and login into your account.</p><p>This link <b>expires in 6 hours</b>.</p><p>Press <a href=${currentUrl + "api/user/verify/" + id + "/" + uniqueString}>here</a> to proceed.</p>`,
  };

  //unique string should be verified first.

  //hash the uniqueString
  const saltRounds = 10;
  bcrypt.hash(uniqueString, saltRounds).then((hashedUniqueString) => {
    //set values in userVerification Collection
    UserVerify.create({
      user_id: id,
      unique_string: hashedUniqueString,
      created_at: Date.now(),
      expires_at: Date.now() + 1000 * 60 * 60 * 6,  //now + 6 hours
    }).then(data => {
      transporter
        .sendMail(mailOptions)
        .then(() => {
          //email sent and verification record saved
          res.json({
            status: "PENDING",
            message: "Verification email sent"
          });
        })
        .catch(() => {
          console.log(error);
          res.json({
            status: "FAILED",
            message: "Verification email failed",
          });
        });
    })
      .catch(err => {
        res.json({
          status: "FAILED",
          message:
            "Couldn't save verification email data!" + err.message
        });
      });;
  }).catch(() => {
    res.json({
      status: "FAILED",
      message: "An error occured while hashing email data!",
    });
  });
};

// Upload to S3 : actions to take after the image is uploaded in "/uploads/ folder"
exports.profilePic = async (req, res) => {
  const file = req.file;
  console.log(file);
  let result;
  try {
    result = await uploadFile(file);
  } catch {
    res.status(400).send({
      message: "File Upload to s3 Failed."
    });
  }

  //now delete the local copy
  await unlinkFile(file.path);

  console.log(result);

  res.send({ image_path: `/api/users/images/${result.Key}` });
};

// Get from S3 : The frontend will tell backend to request S3 image and backend will fetch the image in variable and then send the data to frontend.
exports.getProfilePic = async (req, res) => {
  const key = req.params.key;
  const readStream = getFileStream(key);

  //mow stream this output directly to frontend request.

  readStream.on('error', function (error) {
    // Handle your error here.
    res.status(400).send({
      message: "Not able to find the file in S3."
    });
  });
  readStream.pipe(res);
};

// Get from S3 : The frontend will tell backend to request S3 image and backend will fetch the image in variable and then send the data to frontend.
exports.getInterestsPic = async (req, res) => {
  const key = 'interests/' + req.params.key;
  const readStream = getFileStream(key);

  //mow stream this output directly to frontend request.

  readStream.on('error', function (error) {
    // Handle your error here.
    res.status(400).send({
      message: "Not able to find the interests image in S3."
    });
  });
  readStream.pipe(res);
};

// Create and Save a new Tutorial
exports.create = async (req, res) => {
  // validate JWT is not possible at this stage of user onboarding, there are other checks that validates the users.

  // //testing success
  // transporter.verify((error, success) => {
  //   if (error) {
  //     console.log(error);
  //   } else {
  //     console.log("Ready for messages");
  //     console.log(success);
  //   }
  // });


  // Validate username
  if (!req.body.username) {
    res.status(400).send({
      message: "Username can not be empty!"
    });
    return;
  }

  // // Validate email
  // if (!req.body.email) {
  //   res.status(400).send({
  //     message: "Email can not be empty!"
  //   });
  //   return;
  // }

  // // Validate name
  // if (!req.body.name) {
  //   res.status(400).send({
  //     message: "Email can not be empty!"
  //   });
  //   return;
  // }

  // // Validate wallet address
  // if (!req.body.wallet_address) {
  //   res.status(400).send({
  //     message: "Email can not be empty!"
  //   });
  //   return;
  // }

  // // Validate wallet type
  // if (!req.body.wallet_type) {
  //   res.status(400).send({
  //     message: "Email can not be empty!"
  //   });
  //   return;
  // }

  //validate interests and store the respective output.
  let interests;
  let arr;
  if (req.body.interests) {
    try {
      interests = req.body.interests;
      arr = req.body.interests.split(",");
    } catch (err) {
      res.status(400).send({
        message: "Not able to prase the \"interests\" in request body. Make sure interests in comma separate without space."
      });
    };
  } else {
    interests = "";
  }

  //PENDING: check if each element of arr is a interests from "interestsKey.txt" file

  console.log(arr);

  // Create a User
  const user = {
    name: req.body.name,
    email: req.body.email,
    username: req.body.username,
    interests: interests,
    wallet_address: req.body.wallet_address,
    wallet_type: req.body.wallet_type,
    profile_pic_url: req.body.profile_pic_url,
    created_at: new Date(),
    updated_at: new Date(),
    verified: false
  };

  let isUsernameExists = false;
  if (await User.count({ where: { username: user.username } }) > 0) {
    isUsernameExists = true;
  }

  // Create a User in the database
  if (!isUsernameExists) {
    await User.create(user)
      .then(data => {
        // console.log(data);

        //send email verification.
        sendVerificationEmail(data, res);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while creating the User."
        });
      });
  } else {
    res.status(500).send({
      message: "User already exists!"
    });
  }

};

// Find a single Tutorial with its wallet address
exports.findOne = async (req, res, next) => {
  // // Validate JWT
  if (req.valid == "invalid") {
    console.log("this is hit, request is invalid \n\n");
    res.status(403).send({
      message: "Invalid JWT verification."
    });
  } else {
    // const WALLETADDRESS = req.body.walletAddress;
    const USERNAME = req.body.username;

    await User.findAll({
      limit: 1,
      where: {
        username: USERNAME
      }
    })
      .then(data => {
        if (data) {
          res.send(data);
        } else {
          res.status(404).send({
            message: `Cannot find User with username = ${USERNAME}.`
          });
        }
      });
    // .catch(err => {
    //   res.status(500).send({
    //     message: "Error retrieving User with username = " + USERNAME
    //   });
    // });
  }
};

// Update a User by the wallet address in the request
// Update request can include any number of fields.
// You cannot update unique values like id, wallet address, note: username can be updated
exports.update = async (req, res) => {
  const USERNAME = req.body.username;

  //validate interests
  // PENDING - input validation for security reason.
  let arr;
  if (req.body.interests) {
    try {
      arr = req.body.interests.split(",");
    } catch (err) {
      res.status(400).send({
        message: "Not able to prase the \"interests\" in request body. Make sure interests in comma seperate without space."
      });
    };
  }


  //PENDING: check if each element of arr is a interests from "interestsKey.txt" file

  console.log(arr);

  await User.update(req.body, {
    limit: 1,
    where: {
      username: USERNAME
    }
  })
    .then(num => {
      console.log(num);
      if (num == 1) {
        res.send({
          message: `User with username = ${USERNAME} was updated successfully.`
        });
      } else {
        res.send({
          message: `Cannot update User with username = ${USERNAME}. Maybe User was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating User with username = " + USERNAME
      });
    });
};

// Delete a User with the specified wallet address.
exports.delete = async (req, res) => {
  const USERNAME = req.body.username;

  await User.destroy({
    limit: 1,
    where: {
      walletAddress: USERNAME
    }
  }).then(num => {
    if (num == 1) {
      res.send({
        message: `User with username = ${USERNAME} was deleted successfully!`
      });
    } else {
      res.send({
        message: `Cannot delete User with username = ${USERNAME}. Maybe User was not found!`
      });
    }
  })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete User with username = " + USERNAME
      });
    });
};

// Retrieve all Users from the database.
exports.findAll = async (req, res) => {
  // const userName = req.query.userName;
  // var condition = userName ? { userName: { [Op.iLike]: `%${userName}%` } } : null;

  await User.findAll({
    where: {},
    truncate: false
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving users."
      });
    });
};

// Delete all Users from the database.
exports.deleteAll = async (req, res) => {
  User.destroy({
    where: {},
    truncate: false
  })
    .then(num => {
      res.send({ message: `${num} Users were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all tutorials."
      });
    });
};