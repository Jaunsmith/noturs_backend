const asyncErrorCatch = require("../utilities/asyncErrorCatch");
const AppError = require("../utilities/appError");
const APIFeatures = require("../utilities/apiFeatures");

exports.deleteOne = (Model) =>
  asyncErrorCatch(async (req, res, next) => {
    const docs = await Model.findByIdAndDelete(req.params.id);
    if (!docs) {
      return next(
        new AppError(
          `No any document found with this ID: ${req.params.id}`,
          404,
        ),
      ); // this is used to pass the error to the global error handling middleware
    }
    res.status(204).json({ status: "success", data: null });
  });

// password cant be update with this cause the save method will not work with findByIdAndUpdate...
exports.updateOne = (Model) =>
  asyncErrorCatch(async (req, res, next) => {
    const docs = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // this is used to return the updated tour
      runValidators: true, // this is used to run the validators on the updated tour thats the rules we set in our schema take effect as well in other to get a correct data...
    });
    if (!docs) {
      return next(
        new AppError(`No any data found with this ID: ${req.params.id}`, 404),
      ); // this is used to pass the error to the global error handling middleware
    }
    res.status(200).json({ status: "success", data: { data: docs } });
  });

exports.createOne = (Model) =>
  asyncErrorCatch(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: "successs",
      data: doc, // this is used to send the new tour that was created
    });
  });

exports.getOne = (Model, populateOption) =>
  asyncErrorCatch(async (req, res, next) => {
    const { id } = req.params;
    let query = Model.findById(id);

    if (populateOption) query = query.populate(populateOption);
    const doc = await query;
    // this is used to get the tour data by id and also populate the review data for that tour using the virtual populate we created in the tour model...
    if (!doc) {
      return next(new AppError(`No any data found with this ID: ${id}`, 404)); // this is used to pass the error to the global error handling middleware
    }
    res.status(200).json({
      status: "success",
      data: { doc }, // this is used to send the tour data
    });
  });

exports.getAll = (Model) =>
  asyncErrorCatch(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) filter = { tours: req.params.tourId }; // this is used to get the reviews for a specific tour when the tourId is present in the params...
    const apiFeatures = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .pagenation();

    // const doc = await apiFeatures.query.explain(); this explain all about our query in the retun data ..

    const doc = await apiFeatures.query;
    res.status(200).json({
      status: "success",
      results: doc.length,
      data: { doc },
    });
  });
