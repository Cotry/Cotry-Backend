const db = require("../models");
const User = db.users;
const Op = db.Sequelize.Op;

// Create and Save a new Tutorial
exports.create = (req, res) => {
  // validate JWT is not possible at this stage of user onboarding, there are other checks that validates the users.

  // Validate request
  if (!req.body.userName) {
    res.status(400).send({
      message: "Username can not be empty!"
    });
    return;
  }

  // Create a Tutorial
  const user = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    userName: req.body.userName,
    walletAddress: req.body.walletAddress,
    walletType: req.body.walletType,
    walletBalance: req.body.walletBalance,
  };

  //check if user exists.
  let isAddrExists = false;
  if (User.count({ where: { walletAddress: user.walletAddress } }) > 0) {
    isAddrExists = true;
  }

  let isUsernameExists = false;
  if (User.count({ where: { userName: user.userName } }) > 0) {
    isUsernameExists = true;
  }

  // Create a User in the database
  if (!isUsernameExists && !isAddrExists) {
    User.create(user)
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while creating the User."
        });
      });
  } else if (!isAddrExists) {
    res.status(500).send({
      message: "Username already exists."
    });
  } else if (!isUsernameExists) {
    res.status(500).send({
      message: "Wallet Address already exists."
    });
  } else {
    res.status(500).send({
      message: "Some error occurred while creating the User."
    });
  }

};

// Find a single Tutorial with its wallet address
exports.findOne = (req, res) => {
  // Validate JWT
  if (!req.valid.userName || !req.valid.walletAddress) {
    res.status(403).send({
      message: "Invalid JWT verification."
    });
  }

  const WALLETADDRESS = req.body.walletAddress;

  User.findAll({
    limit: 1,
    where: {
      walletAddress: WALLETADDRESS
    }
  })
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find User with wallet address=${WALLETADDRESS}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving User with wallet address =" + WALLETADDRESS
      });
    });
};

// Update a User by the wallet address in the request
// Update request can include any number of fields.
// You cannot update unique values like id, wallet address, note: username can be updated
exports.update = (req, res) => {
  const WALLETADDRESS = req.body.walletAddress;

  User.update(req.body, {
    limit: 1,
    where: {
      walletAddress: WALLETADDRESS
    }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: `User with wallet address = ${WALLETADDRESS} was updated successfully.`
        });
      } else {
        res.send({
          message: `Cannot update User with wallet address =${WALLETADDRESS}. Maybe User was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating User with wallet address =" + WALLETADDRESS
      });
    });
};

// Delete a User with the specified wallet address.
exports.delete = (req, res) => {
  const WALLETADDRESS = req.body.walletAddress;

  User.destroy({
    limit: 1,
    where: {
      walletAddress: WALLETADDRESS
    }
  }).then(num => {
    if (num == 1) {
      res.send({
        message: `User with wallet address = ${WALLETADDRESS} was deleted successfully!`
      });
    } else {
      res.send({
        message: `Cannot delete User with wallet address = ${WALLETADDRESS}. Maybe User was not found!`
      });
    }
  })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Tutorial with wallet address = " + WALLETADDRESS
      });
    });
};

// Retrieve all Users from the database.
exports.findAll = (req, res) => {
  // const userName = req.query.userName;
  // var condition = userName ? { userName: { [Op.iLike]: `%${userName}%` } } : null;

  User.findAll({
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
exports.deleteAll = (req, res) => {
  User.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} Users were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all tutorials."
      });
    });
};