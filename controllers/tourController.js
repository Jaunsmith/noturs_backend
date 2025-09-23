/* eslint-disable no-restricted-syntax */
/* eslint-disable import/no-useless-path-segments */
/* eslint-disable node/no-unsupported-features/es-syntax */
const AppError = require("../utilities/appError");
const Tour = require("./../model/tourModels");
const asyncErrorCatch = require("./../utilities/asyncErrorCatch");
const handlerFactory = require("./handlerFactory");

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

exports.getAlltoursData = handlerFactory.getAll(Tour);

exports.getTourData = handlerFactory.getOne(Tour, {
  path: "reviews",
  select: "review rating user createdAt _id",
});

exports.createNewTour = handlerFactory.createOne(Tour);

exports.updateTourData = handlerFactory.updateOne(Tour);

exports.deleteTourData = handlerFactory.deleteOne(Tour);

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

exports.getToursRange = asyncErrorCatch(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [latitude, longitude] = latlng.split(",");

  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;

  if (!latitude || !longitude) {
    next(
      new AppError(
        "Please kindly provide the latitue and the logitude in the format latitude, longitude",
        400,
      ),
    );
  }

  const tours = await Tour.find({
    startLocation: {
      $geoWithin: { $centerSphere: [[longitude, latitude], radius] },
    },
  });

  res.status(200).json({
    status: "Location succesfully set",
    results: tours.length,
    data: {
      data: tours,
    },
  });

  next();
});

exports.getDistances = asyncErrorCatch(async (req, res, next) => {
  const { latlng, unit } = req.params;

  const [lat, lng] = latlng.split(",");

  if (!lat || !lng) {
    next(
      new AppError("Please kindly provide the latitude and the logitude", 400),
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: "distance", // this is where all the distnance calcukation will be stored...
        distanceMultiplier: unit === "mi" ? 0.000621371 : 0.001, // this is used to convert the distance from the meter that the geospatil stpre data to desire units...
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    }, // this help us to set what we want to keep in our result .. what we want to be display
  ]);

  res.status(200).json({
    status: "Sucess",
    result: distances.length,
    data: {
      data: distances,
    },
  });
});
