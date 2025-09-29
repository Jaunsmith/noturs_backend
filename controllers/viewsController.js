const Tour = require("../model/tourModels");
const asyncErrorCatch = require("../utilities/asyncErrorCatch");

exports.getOverview = asyncErrorCatch(async (req, res, next) => {
  const tours = await Tour.find();
  res.status(200).render("overview", {
    title: "All Tours",
    tours,
  });
});

exports.getTour = asyncErrorCatch(async (req, res, next) => {
  const tours = Tour.find();
  res.status(200).render("tour", {
    title: "The tour name",
  });
});
