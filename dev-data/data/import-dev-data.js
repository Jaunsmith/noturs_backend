// /* eslint-disable import/extensions */
// const fs = require("fs");
// /* eslint-disable import/no-extraneous-dependencies */
// const mongoose = require("mongoose");
// const dotenv = require("dotenv");
// const Tour = require("../../model/tourModels");
// const User = require("../../model/userModel");
// const Review = require("../../model/reviewModels");
// // Load environment variables from config.env file
// dotenv.config({ path: "./config.env" });

// const DB = process.env.DATABASE.replace(
//   "<PASSWORD>",
//   process.env.DATABASE_PASSWORD,
// );
// // this return a promise ..... and this help us connect to the database either locally or remotely... 1. remotely
// mongoose.connect(DB, {}).then(() => {
//   console.log("DB connection successful!");
// });

// const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, "utf-8")); // this is used to read the file i.e the data stored in the js file ....
// const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, "utf-8"));
// const reviews = JSON.parse(
//   fs.readFileSync(`${__dirname}/reviews.json`, "utf-8"),
// );

// const importData = async () => {
//   try {
//     await Tour.create(tours);
//     await User.create(users, { validateBeforeSave: false });
//     await Review.create(reviews); // this are used to create the tours in the database
//     console.log("Data successfully loaded!"); // this is used to exit the process after the data has been loaded
//   } catch (error) {
//     console.log(error);
//   }
//   process.exit();
// };

// const deleteData = async () => {
//   try {
//     await Tour.deleteMany();
//     await Review.deleteMany();
//     await User.deleteMany(); // this are used to delete all the data(tours, user,review) in the database
//     console.log("Data successfully deleted!");
//     process.exit(); // this is used to exit the process after the data has been deleted
//   } catch (error) {
//     console.log(error);
//   }
//   process.exit();
// };

// if (process.argv[2] === "--import") {
//   importData();
// } else if (process.argv[2] === "--delete") {
//   deleteData();
// }

/* eslint-disable import/extensions */
const fs = require("fs");
/* eslint-disable import/no-extraneous-dependencies */
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Tour = require("../../model/tourModels");
const User = require("../../model/userModel");
const Review = require("../../model/reviewModels");

// Load environment variables from config.env file
dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD,
);

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(DB, {});
    console.log("DB connection successful!");
  } catch (error) {
    console.error("DB connection failed:", error);
    process.exit(1);
  }
};

// Fix file paths - each should point to their respective JSON files
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, "utf-8"));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, "utf-8")); // Changed to users.json
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, "utf-8"),
); // Changed to reviews.json

const importData = async () => {
  try {
    await connectDB(); // Wait for connection first
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log("Data successfully loaded!");
  } catch (error) {
    console.log("Import error:", error);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await connectDB(); // Wait for connection first
    await Tour.deleteMany();
    await Review.deleteMany();
    await User.deleteMany();
    console.log("Data successfully deleted!");
  } catch (error) {
    console.log("Delete error:", error);
  }
  process.exit();
};

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
} else {
  console.log("Please specify either --import or --delete");
  process.exit();
}
