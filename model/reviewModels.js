const mongoose = require("mongoose");

const reveiwSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Please kindly write your review cant be empty"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "Please kindly rate it"],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tours: {
      type: mongoose.Schema.ObjectId,
      ref: "Tours",
      required: [true, "Review must belong to  a tours"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      require: [true, "A review must be written by user"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }, // this help us to output a data that needed but not needed to store in the data base ...
);

reveiwSchema.pre(/^find/, function (next) {
  // the /^find/ regex is used to match all the find queries like find, findOne, findById, etc.
  this.populate([
    {
      path: "tours",
      select: "-__v ",
    },
    {
      path: "user",
      select: "-__v -passwordChangedAt",
    },
  ]); // this is used to get the id from the request thr .populate help to read tthe reference data... the array let us add multiple populate data to a single populate middleware instead of writting multiple middleware....
  next();
});

const Review = mongoose.model.Review || mongoose.model("Review", reveiwSchema);

module.exports = Review;
