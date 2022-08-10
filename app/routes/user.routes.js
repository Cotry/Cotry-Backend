module.exports = app => {
  const users = require("../controllers/user.controller.js");

  var router = require("express").Router();

  // Create a new Tutorial
  router.post("/", users.create);

  // Retrieve all Tutorials
  router.get("/all", users.findAll);

  // Retrieve all published Tutorials
  router.get("/published", users.findAllPublished);

  // Retrieve a single Tutorial with id
  router.get("/user/:id", users.findOne);

  // Update a Tutorial with id
  router.put("/user/:id", users.update);

  // Delete a Tutorial with id
  router.delete("/user/:id", users.delete);

  // Delete all Tutorials
  router.delete("/all", users.deleteAll);

  app.use("/api/users", router);
};
