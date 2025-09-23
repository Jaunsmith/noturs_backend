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

router.use(authenticationController.protectRoute); // this is used to protect all the routes that come after this middleware...

router.patch("/updatemypassword", authenticationController.updatePassword);
router.patch("/updatemydata", userTourController.updateMyData);
router.delete("/deletemydata", userTourController.deleteMyData);
// this is the route for the users
router.get("/me", userTourController.getMe, userTourController.getUserData);

router.use(authenticationController.restrictedTo("admin")); // only admin can access the routes that come after this middleware
router.route("/").get(userTourController.getAllUsers);
router
  .route("/:id")
  .get(userTourController.getUserData)
  .patch(userTourController.updateUserData)
  .delete(userTourController.deleteUserData);

module.exports = router;
