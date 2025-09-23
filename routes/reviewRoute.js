const express = require("express");

const authenticationController = require("../controllers/authenticationController");
const reviewController = require("../controllers/reviewController");

const router = express.Router({ mergeParams: true }); // this is used to get the params from the parent router...

router.use(authenticationController.protectRoute); // protect all the routes after this middleware...

router
  .route("/")
  .post(
    authenticationController.restrictedTo("user"),
    reviewController.setTourUserIds,
    reviewController.createNewReview,
  )
  .get(reviewController.getAllReview);

router
  .route("/:id")
  .delete(
    authenticationController.protectRoute,
    authenticationController.restrictedTo("admin", "user"),
    reviewController.deleteReview,
  )
  .patch(
    authenticationController.protectRoute,
    authenticationController.restrictedTo("user"),
    reviewController.updateReview,
  )
  .get(reviewController.getReview);

module.exports = router;
