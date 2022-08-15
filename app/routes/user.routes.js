module.exports = app => {
  const users = require("../controllers/user.controller.js");

  var router = require("express").Router();

  // Create a new User
  router.post("/user/create", users.create);

  // Retrieve a single User with its wallet address
  router.post("/user/query", users.findOne);

  // Update a Tutorial with its wallet address (wallet address cant be updated)
  router.post("/user/update", users.update);

  // Delete a Tutorial with its wallet address
  router.post("/user/delete", users.delete);

  // Retrieve all Users
  router.post("/getall", users.findAll); //Disable this in production or ensure proper security.

  // Delete all Tutorials
  router.post("/deleteall", users.deleteAll); //Disable this in production or ensure proper security.

  // router.post("/login")

  app.use("/api/users", router);
};