/* eslint-disable no-restricted-syntax */
/* eslint-disable import/no-useless-path-segments */
/* eslint-disable node/no-unsupported-features/es-syntax */
const Tour = require("./../model/tourModels");
const APIFeatures = require("./../utilities/apiFeatures");
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

exports.getAlltoursData = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

// exports.getAlltoursData = async (req, res) => {
//   try {
//     // 1) Create hard copy of query object
//     const queryObj = { ...req.query };

//     // 2) Remove special fields
//     const excludedFields = ["page", "sort", "limit", "fields"];
//     excludedFields.forEach((el) => delete queryObj[el]);

//     // 3) Process each query parameter
//     const finalQuery = {};

//     for (const key in queryObj) {
//       // Handle operator queries (duration[gte]=5)
//       if (key.includes("[") && key.includes("]")) {
//         const field = key.split("[")[0];
//         const operator = key.split("]")[0].split("[")[1];
//         const value = Number(queryObj[key]);

//         if (!finalQuery[field]) {
//           finalQuery[field] = {};
//         }
//         finalQuery[field][`$${operator}`] = value;
//       }
//       // Handle normal equality queries (price=397)
//       else {
//         const value = queryObj[key];
//         // eslint-disable-next-line no-restricted-globals
//         finalQuery[key] = isNaN(value) ? value : Number(value);
//       }
//     }

//     let query = Tour.find(JSON.parse(JSON.stringify(finalQuery)));

//     // sorting ...
//     if (req.query.sort) {
//       const sortBy = req.query.sort.split(",").join(" ");
//       query = query.sort(sortBy);
//     } else {
//       query = query.sort("-createdAt");
//     }

//     // field limiting ....
//     if (req.query.fields) {
//       const filterBY = req.query.fields.split(",").join(" ");
//       query = query.select(filterBY);
//     } else {
//       query = query.select("-__v");
//     }

//     // Pagination....
//     const page = req.query.page * 1 || 1;
//     const limit = req.query.limit * 1 || 100;
//     const skip = (page - 1) * limit;
//     query = query.skip(skip).limit(limit);

//     // Check for invalid page numbers
//     if (req.query.page) {
//       const numTours = await Tour.countDocuments();
//       if (skip >= numTours) {
//         throw new Error("This page does not exist");
//       }
//     }

//     // 4) Execute the constructed query
//     const tours = await query;

//     res.status(200).json({
//       status: "success",
//       results: tours.length,
//       data: { tours },
//     });
//   } catch (err) {
//     res.status(400).json({
//       status: "fail",
//       message: err.message,
//     });
//   }
// };

exports.getTourData = async (req, res) => {
  try {
    const { id } = req.params;
    const tours = await Tour.findById(id); // this is used to get the id from the request
    res.status(200).json({
      status: "sucesss",
      tours,
    });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error.message, // this is used to send the error message if there is an error
    });
  }
};

exports.createNewTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body); // this is used to create a new tour in the database
    res.status(200).json({
      status: "sucesss",
      tour: newTour, // this is used to send the new tour that was created
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message, // this is used to send the error message if there is an error
    });
  }
};

exports.updateTourData = async (req, res) => {
  try {
    const tours = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // this is used to return the updated tour
      runValidators: true, // this is used to run the validators on the updated tour thats the rules we set in our schema take effect as well in other to get a correct data...
    });
    res.status(200).json({ status: "success", data: { tours } });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error.message, // this is used to send the error message if there is an error
    });
  }
};

exports.deleteTourData = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({ status: "success", data: null });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error.message, // this is used to send the error message if there is an error
    });
  }
};

exports.getToursStats = async (req, res) => {
  try {
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
      data: { stats }, // this is used to send the stats data
    });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error.message, // this is used to send the error message if there is an error
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error.message, // this is used to send the error message if there is an error
    });
  }
};
