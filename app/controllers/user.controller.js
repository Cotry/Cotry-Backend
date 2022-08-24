const models = require("../models");  //this will be handled by ./models/index.js
const User = models.users;
// const Op = models.Sequelize.Op;

// Create and Save a new Tutorial
exports.create = async (req, res) => {
  // validate JWT is not possible at this stage of user onboarding, there are other checks that validates the users.

  // Validate username
  if (!req.body.username) {
    res.status(400).send({
      message: "Username can not be empty!"
    });
    return;
  }

  // Validate email
  if (!req.body.email) {
    res.status(400).send({
      message: "Email can not be empty!"
    });
    return;
  }

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

  // Create a Tutorial
  const user = {
    name: req.body.name,
    email: req.body.email,
    username: req.body.username,
    wallet_address: req.body.wallet_address,
    wallet_type: req.body.wallet_type,
    created_at: new Date(),
    updated_at: new Date(),
  };

  let isUsernameExists = false;
  if (await User.count({ where: { username: user.username } }) > 0) {
    isUsernameExists = true;
  }

  // Create a User in the database
  if (!isUsernameExists) {
    await User.create(user)
      .then(data => {
        res.send(data);
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

  await User.update(req.body, {
    limit: 1,
    where: {
      username: USERNAME
    }
  })
    .then(num => {
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