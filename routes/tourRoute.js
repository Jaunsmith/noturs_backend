const express = require("express");
const tourController = require("./../controllers/tourController");

// this is the route for the tours
// this gives us the ability to create a new router for the tours and users

const router = express.Router();
// this helps to run the middelware based on certain conditions..
router.param("id", tourController.checkID);
router
  .route("/")
  .get(tourController.getAlltoursData)
  .post(tourController.checkBodyData, tourController.createNewTour);
router
  .route("/:id")
  .get(tourController.getTourData)
  .patch(tourController.updateTourData)
  .delete(tourController.deleteTourData);

module.exports = router;
