module.exports = app => {
  const users = require("../controllers/users.controller.js");
  const validateJWT = require("../middleware/validateJWT");

  var router = require("express").Router();

  // Verify email
  // Session should not change once a user is verified.
  // router.post("/user/verify", users.verifyEmail);

  // Create a new User
  router.post("/user/create", users.create);

  // Retrieve a single User with its wallet address
  router.post("/user/query", validateJWT, users.findOne);

  // Update a User with its wallet address (wallet address cant be updated)
  router.post("/user/update", validateJWT, users.update);

  // Delete a User with its wallet address
  router.post("/user/delete", validateJWT, users.delete);

  // Retrieve all Users
  router.post("/getall", users.findAll); //Disable this in production or ensure proper security.

  // Delete all Users
  router.post("/deleteall", validateJWT, users.deleteAll); //Disable this in production or ensure proper security.

  app.use("/api/users", router);
};