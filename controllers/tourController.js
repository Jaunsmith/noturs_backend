/* eslint-disable no-restricted-syntax */
/* eslint-disable import/no-useless-path-segments */
/* eslint-disable node/no-unsupported-features/es-syntax */
const Tour = require("./../model/tourModels");
const asyncErrorCatch = require("./../utilities/asyncErrorCatch");
const APIFeatures = require("./../utilities/apiFeatures");
const AppError = require("../utilities/appError");

// this check if the data sending is valid or not that means the format we want..
exports.aliasTopTours = (req, res, next) => {
  // Force redefine the req.query property
  Object.defineProperty(req, "query", {
    value: {
      sort: "-ratingsAverage,price",
      limit: "5",
      fields: "name,price,ratingsAverage,difficulty,summary",
    },
    writable: true,
    enumerable: true,
    configurable: true,
  });
  next();
};

exports.getAlltoursData = asyncErrorCatch(async (req, res, next) => {
  const apiFeatures = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagenation();
  // 4) Execute query
  const tours = await apiFeatures.query;

  res.status(200).json({
    status: "success",
    results: tours.length,
    data: { tours },
  });
});

exports.getTourData = asyncErrorCatch(async (req, res, next) => {
  const { id } = req.params;
  const tours = await Tour.findById(id); // this is used to get the id from the request

  if (!tours) {
    return next(new AppError(`No any data found with this ID: ${id}`, 404)); // this is used to pass the error to the global error handling middleware
  }
  res.status(200).json({
    status: "sucesss",
    data: { tours }, // this is used to send the tour data
  });
});

exports.createNewTour = asyncErrorCatch(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: "successs",
    tour: newTour, // this is used to send the new tour that was created
  });
});

exports.updateTourData = asyncErrorCatch(async (req, res, next) => {
  const tours = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // this is used to return the updated tour
    runValidators: true, // this is used to run the validators on the updated tour thats the rules we set in our schema take effect as well in other to get a correct data...
  });
  if (!tours) {
    return next(
      new AppError(`No any data found with this ID: ${req.params.id}`, 404),
    ); // this is used to pass the error to the global error handling middleware
  }
  res.status(200).json({ status: "success", data: { tours } });
});

exports.deleteTourData = asyncErrorCatch(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) {
    return next(
      new AppError(`No any data found with this ID: ${req.params.id}`, 404),
    ); // this is used to pass the error to the global error handling middleware
  }
  res.status(204).json({ status: "success", data: null });
});

exports.getToursStats = asyncErrorCatch(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }, // Match tours with ratingsAverage greater than or equal to 4.5
    },
    {
      $group: {
        _id: { $toUpper: "$difficulty" }, // Group by certain conditions
        totalTours: { $sum: 1 }, // Count total number of tours
        numberOfRatings: { $sum: "$ratingsQuantity" }, // Sum of ratingsQuantity
        aveRating: { $avg: "$ratingsAverage" }, // Average of ratingsAverage
        avgPrice: { $avg: "$price" }, // Average price of tours
        minPrice: { $min: "$price" }, // Minimum price of tours
        maxPrice: { $max: "$price" }, //
      }, //this is used to group data based on some criterian...
    },
    {
      // this is used to sort the data based on some criterian... and the criterian name will be based on the filed define in the  group cause the group field now hold our new data ...
      $sort: { avgPrice: 1 }, // Sort by average price in ascending order
    },
  ]);

  res.status(200).json({
    status: "success",
    results: stats.length, // this is used to send the number of results
    data: { stats }, // this is used to send the stats data
  });
});

exports.getMonthlyPlan = asyncErrorCatch(async (req, res, next) => {
  const year = req.params.year * 1; // Convert year to a number
  const monthlyPlan = await Tour.aggregate([
    {
      $unwind: "$startDates", // this is used to decomposed and array data for more data manipulation
    },
    {
      // this now selecte data based on the year passed in the request and also follow the unwind promise return query ....
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        totalToursStarted: { $sum: 1 }, // Count total number of tours started in each month
        tours: { $push: "$name" }, // Collect tour names in an array
      },
    },
    {
      $sort: { totalToursStarted: -1 }, // Sort by month in ascending order
    },
    {
      $addFields: {
        month: "$_id", // Add a new field 'month' based on the startDates
      },
    },
    {
      $project: {
        _id: 0, // Exclude the _id field from the output
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      monthlyPlan, // this is used to send the monthly plan data
    },
  });
});
