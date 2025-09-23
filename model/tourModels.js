/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-else-return */
// eslint-disable-next-line import/no-extraneous-dependencies
const mongoose = require("mongoose");
const slugify = require("slugify");

// creating the schema for our project in which a model will be created out of it ..

const toursSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a Name"],
      // this helps to make sure that the name is unique and not repeated
      unique: true,
      trim: true, // this is used to remove the white space at the beginning and end of the string
      maxLenghth: [
        40,
        "A tour name must have less or equal than 40 characters",
      ],
      minLength: [10, "A tour name must have more or equal than 10 characters"],
      // validate: [validator.isAlpha, "Tour name must only contain characters"],
    },
    ratingsAverage: {
      type: Number,
      default: 4.6,
      min: [1, "Rating cant be less than 1 is betwwwn 1 and 5"],
      max: [5, "Rating cant be more than 5 is betwwwn 1 and 5"],
      set: (val) => Math.round(val * 10) / 10, // this is used to round the value to one decimal place
    },
    ratingsQuantity: { type: Number, default: 0 },
    slug: {
      type: String,
      unique: true, // this is used to make sure that the slug is unique and not repeated
    },
    price: { type: Number, required: [true, "A tour must have a Price"] },

    duration: {
      type: Number,
      required: [true, "A tour must have a Duration of time"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a Group Size"],
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a Difficulty"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty is either: easy, medium, difficult",
      },
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          //this.price is used to access the price field in the schema and omly works on the document level creation.....
          return val < this.price;
        },
        message: "Discount price ({VALUE}) should be below regular price",
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "A tour must have a description"], // this is used to remove the white space at the beginning and end of the string
    },
    description: {
      type: String,
      trim: true, // this is used to remove the white space at the beginning and end of the string
    },
    imageCover: {
      type: String,
      trim: true,
      required: [true, "A tour need to have image cover"], // this is used to remove the white space at the beginning and end of the string
    },
    images: [String], // this is used to store multiple images or any items  in an array so that it can be accesse easily using index
    cretedAt: {
      type: Date,
      default: Date.now(),
      select: false, // this is used to not show the particualr filed (createdAt) field in the response
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    // the part here is an embeded onject....
    startLocation: {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number], // this means we are expecting an arrary of numbers...
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number], // this means we are expecting an arrary of numbers...
        address: String,
        description: String,
        day: Number,
      },
    ],
    // guides: Array, this helped to achieve the embeding goals...
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User", // this help to make referecing to another document in mongoDb like telling monogoe which document the id belong to....
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

toursSchema.index({ price: 1, ratingsAverage: 1 }); // this is helped to boost our query for instance instead of looping throuug the whole doucment in the collection it only loop through document that match put condition since it alread stored those document in an order manner...
toursSchema.index({ startLocation: "2dsphere" }); // this is used to create a geospatial index for the startLocation field to enable geospatial queries like finding tours within a certain distance from a given point...

toursSchema.virtual("durationWeeks").get(function () {
  const nosOfWeek = this.duration / 7;
  if (nosOfWeek < 1) {
    return `${this.duration} days`; // this is used to return the number of days if the duration is less than 7 days
  } else if (nosOfWeek >= 1) {
    const wholeNos = Math.floor(nosOfWeek); // this is used to get the whole number of weeks
    const weeks = this.duration - wholeNos * 7; // this is used to get the remaining weeks
    return `${wholeNos} weeks and ${weeks} days`; // this is used to return the whole number of weeks and the remaining weeks
  }
}); // this is used to create a virtual field that is not stored in the database but can be accessed like a normal field and the normal function is used instead of arrow function to access the this keyword

toursSchema.virtual("reviews", {
  ref: "Review", // this is the model to which we are referencing
  foreignField: "tour", // this is the field in the review model that references the tour model
  localField: "_id", // this is the field in the tour model that is referenced by the review model
}); // this is used to create a virtual populate to get the review data for each tour without storing it in the database

// Document middleware
toursSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true }); // this is used to create a slug from the name of the tour and the lower option is used to make the slug lowercase
  next(); // this is used to call the next middleware function in the stack
});

// Query middleware
toursSchema.pre(/^find/, function (next) {
  // the /^find/ regex is used to match all the find queries like find, findOne, findById, etc.
  this.find({ secretTour: { $ne: true } });
  next();
});

// Aggregation middleware.. commented for the geonear testing cause it must be first in the pipe line stage..
// toursSchema.pre("aggregate", function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   console.log(this.pipeline());
//   next();
// });

toursSchema.pre(/^find/, function (next) {
  // the /^find/ regex is used to match all the find queries like find, findOne, findById, etc.
  this.populate({
    path: "guides",
    select: "-__v -passwordChangedAt",
  }); // this is used to get the id from the request thr .populate help to read tthe reference data...
  next();
});

// this code is used to embed the data in tge tour guide the user document...
// toursSchema.pre("save", async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// creating the model from the schema
const Tours = mongoose.models.Tours || mongoose.model("Tours", toursSchema); // this is used to create the model from the schema and also check if the model already exists to avoid overwriting it

//
module.exports = Tours; // this is used to export the model so that it can be used in other files
