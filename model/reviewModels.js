const mongoose = require("mongoose");

const Tour = require("./tourModels");
const AppError = require("../utilities/appError");

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
    tour: {
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
    // autoIndex: true,
  }, // this help us to output a data that needed but not needed to store in the data base ...
);

reveiwSchema.index({ tour: 1, user: 1 }, { unique: true });

reveiwSchema.pre(/^find/, function (next) {
  // the /^find/ regex is used to match all the find queries like find, findOne, findById, etc.
  this.populate([
    // {
    //   path: "tours",
    //   select: "name",
    // },
    {
      path: "user",
      select: "name photo",
    }, // help us to send data we want clients to see....
  ]); // this is used to get the id from the request thr .populate help to read tthe reference data... the array let us add multiple populate data to a single populate middleware instead of writting multiple middleware....
  next();
});

reveiwSchema.statics.calAverageRatings = async function (tourId) {
  const statistcs = await this.aggregate([
    {
      $match: { tour: tourId }, // this help us to match the tour id i.e selecting all the reviews that belong the particular tour id we passed...
    },
    {
      $group: {
        _id: "$tour", // this is used to group the data by tour id...
        nRating: { $sum: 1 }, // this is used to count the number of reviews for the tour...
        avgRating: { $avg: "$rating" }, // this is used to calculate the average rating for the tour...
      },
    },
  ]);

  console.log(statistcs);

  if (statistcs.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: statistcs[0].nRating,
      ratingsAverage: statistcs[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reveiwSchema.post("save", function () {
  this.constructor.calAverageRatings(this.tour); // this is used to call the static method to calculate the average ratings after a new review is added...
});

reveiwSchema.pre(/^findOneAnd/, async function (next) {
  const doc = await this.clone().findOne(); // this is used to get the document that is being updated or deleted... i.e this point to the current query...cause the .pre (this) onlyy give us access to the present query not the document but we need to get access to it in other to be able to run calculation on it... this is why we need to execute the query to get the document...
  if (!doc)
    return next(
      new AppError(
        `No document found with the ID: ${this.getQuery()._id}`,
        404,
      ),
    );
  this.rev = doc; // we are storing the document in the this.rev property to be able to access it in the post middleware...
  const update = this.getUpdate ? this.getUpdate() : undefined; // this check if we are upating or not .. it check if the getUpdate method exist...
  this.updateRating = update && this.getUpdate().rating !== undefined; // this is used to check if the rating field is being updated... so that the average can only get affected only when the rating is updated not everytime we updated wihout uodating the rating...
  next();
}); // ^findOneAnd this is run for both findByIdAndUpdate and findByIdAndDelete  middleware hooks. cause this is actually what run behind the scene for this two....

reveiwSchema.post(/^findOneAnd/, async function () {
  if (!this.rev) return;
  if (!this.updateRating || this.updateRating) {
    await this.rev.constructor.calAverageRatings(this.rev.tour);
  } // this is used to call the static method to calculate the average ratings after a review is updated or deleted... we use this.rev to access the document that was retrieved in the pre middleware...
  // !this.updateRating || this.updateRating make sure the calculating run either operation we are doing deleteing, updating or creating new one cause it will alwyas true ...
});

const Review = mongoose.model.Review || mongoose.model("Review", reveiwSchema);

module.exports = Review;
