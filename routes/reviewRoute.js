const express = require("express");

const authenticationController = require("../controllers/authenticationController");
const reviewController = require("../controllers/reviewController");

const router = express.Router();

router
  .route("/")
  .post(
    authenticationController.protectRoute,
    authenticationController.restrictedTo("user"),
    reviewController.createNewReview,
  )
  .get(authenticationController.protectRoute, reviewController.getAllReview);

module.exports = router;
