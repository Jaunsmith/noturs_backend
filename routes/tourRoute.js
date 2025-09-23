const express = require("express");
// eslint-disable-next-line import/no-useless-path-segments
const tourController = require("./../controllers/tourController");
const authenticationController = require("../controllers/authenticationController");
const reviewRouter = require("./reviewRoute");

// this is the route for the tours
// this gives us the ability to create a new router for the tours and users

const router = express.Router();

// Please kindly note that static route comes first before the dynamic route...
router
  .route("/top-5-cheap")
  .get(tourController.aliasTopTours, tourController.getAlltoursData);
// this is used to get the top 5 cheap tours
router.route("/tour-stats").get(tourController.getToursStats);
router
  .route("/monthly-plan/:year")
  .get(
    authenticationController.protectRoute,
    authenticationController.restrictedTo("admin", "tour-lead-guide", "guide"),
    tourController.getMonthlyPlan,
  );
// this is about location distances and co...
router
  .route("/tours-range/:distance/point/:latlng/unit/:unit")
  .get(tourController.getToursRange);

router.route("/distances/:latlng/unit/:unit").get(tourController.getDistances);
// this is used to get the tour stats
router
  .route("/")
  .get(tourController.getAlltoursData)
  .post(
    authenticationController.protectRoute,
    authenticationController.restrictedTo("admin", "tour-lead-guide"),
    tourController.createNewTour,
  );

router
  .route("/:id")
  .get(tourController.getTourData)
  .patch(
    authenticationController.protectRoute,
    authenticationController.restrictedTo("admin", "tour-lead-guide"),
    tourController.updateTourData,
  )
  .delete(
    authenticationController.protectRoute,
    authenticationController.restrictedTo("admin", "tour-lead-guide"),
    tourController.deleteTourData,
  );

// nested route...
router.use("/:tourId/reviews", reviewRouter); // this is used to mount the review router on the tour router for the nested route... so any where it see path like this then it make useof the review router...

module.exports = router;
