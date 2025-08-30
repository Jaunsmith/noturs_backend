const express = require("express");
// eslint-disable-next-line import/no-useless-path-segments
const tourController = require("./../controllers/tourController");
const authenticationController = require("../controllers/authenticationController");

// this is the route for the tours
// this gives us the ability to create a new router for the tours and users

const router = express.Router();
// this helps to run the middelware based on certain conditions..
// router.param("id", tourController.checkID);

// Please kindly note that static route comes first before the dynamic route...
router
  .route("/top-5-cheap")
  .get(tourController.aliasTopTours, tourController.getAlltoursData);
// this is used to get the top 5 cheap tours
router.route("/tour-stats").get(tourController.getToursStats);
router.route("/monthly-plan/:year").get(tourController.getMonthlyPlan);
// this is used to get the tour stats
router
  .route("/")
  .get(authenticationController.protectRoute, tourController.getAlltoursData)
  .post(tourController.createNewTour);

router
  .route("/:id")
  .get(tourController.getTourData)
  .patch(tourController.updateTourData)
  .delete(
    authenticationController.protectRoute,
    authenticationController.restrictedTo("admin", "tour-lead-guide"),
    tourController.deleteTourData,
  );

module.exports = router;
