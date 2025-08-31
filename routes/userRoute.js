const express = require("express");

const userTourController = require("../controllers/userController");
const authenticationController = require("../controllers/authenticationController");

// this is the route for the tours
// this gives us the ability to create a new router for the tours and users

const router = express.Router();

router.post("/signup", authenticationController.signUp);
router.post("/signin", authenticationController.signIn);
router.post("/forgetpassword", authenticationController.forgetPassword);
router.patch("/resetpassword/:token", authenticationController.resetPassword);
router.patch(
  "/updatemypassword",
  authenticationController.protectRoute,
  authenticationController.updatePassword,
);
router.patch(
  "/updatemydata",
  authenticationController.protectRoute,
  userTourController.updateMyData,
);
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
