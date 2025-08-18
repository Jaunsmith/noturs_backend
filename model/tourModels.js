// eslint-disable-next-line import/no-extraneous-dependencies
const mongoose = require("mongoose");

// creating the schema for our project in which a model will be created out of it ..

const toursSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A tour must have a Name"],
    // this helps to make sure that the name is unique and not repeated
    unique: true,
    trim: true, // this is used to remove the white space at the beginning and end of the string
  },
  ratingsAverage: { type: Number, default: 4.6 },
  ratingsQuantity: { type: Number, default: 0 },
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
  },
  priceDiscount: Number,
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
});

// creating the model from the schema
const Tours = mongoose.models.Tours || mongoose.model("Tours", toursSchema); // this is used to create the model from the schema and also check if the model already exists to avoid overwriting it

//
module.exports = Tours; // this is used to export the model so that it can be used in other files
