const express = require("express");

const userTourController = require("./../controllers/userController");

// this is the route for the tours
// this gives us the ability to create a new router for the tours and users

const router = express.Router();

// this is the route for the users
router
  .route("/")
  .get(userTourController.getAllUsersData)
  .post(userTourController.createNewUser);
router
  .route("/:id")
  .get(userTourController.getUserData)
  .patch(userTourController.updateUserData)
  .delete(userTourController.deleteUserData);

module.exports = router;
