module.exports = app => {
  const users = require("../controllers/users.controller.js");
  const validateJWT = require("../middleware/validateJWT");
  const {uploadFileV2,uploadFile,getFileStream} = require("../s3");
  const multer = require('multer');
  var router = require("express").Router();

  // Verify email
  // Session should not change once a user is verified.
  // router.post("/user/verify", users.verifyEmail);

  // Create a new User
  router.post("/user/create", users.create);

  // Upload user profile pic and return s3 image link which only frontend server can access.
  //image will be uploaded in binary.
   router.post('/user/image', uploadFileV2, async(req, res) => {});


  router.get("/images/:key", users.getProfilePic);

  router.get("/images/interests/:key", users.getInterestsPic);

  // Retrieve a single User with its wallet address
  router.post("/user/query", users.findOne);

  // Update a User with its wallet address (wallet address cant be updated)
  router.post("/user/update", users.update);

  // Delete a User with its wallet address
  router.post("/user/delete", users.delete);

  // Retrieve all Users
  router.post("/getall", users.findAll); //Disable this in production or ensure proper security.

  // Delete all Users
  router.post("/deleteall", users.deleteAll); //Disable this in production or ensure proper security.

  app.use("/api/users", router);
};