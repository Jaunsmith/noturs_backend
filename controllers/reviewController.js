const Review = require("../model/reviewModels");
const asyncErrorCatch = require("../utilities/asyncErrorCatch");

exports.createNewReview = asyncErrorCatch(async (req, res, next) => {
  const newReview = await Review.create({
    review: req.body.review,
    rating: req.body.rating,
    tours: req.body.tours,
    user: req.user.id,
  });

  res.status(200).json({
    status: " Success",
    messgae: "Review successfully created",
    data: {
      review: newReview,
    },
  });
});

exports.getAllReview = asyncErrorCatch(async (req, res, next) => {
  const reviews = await Review.find();
  res.status(201).json({
    status: "success",
    length: reviews.length,
    data: { reviews },
  });
});
