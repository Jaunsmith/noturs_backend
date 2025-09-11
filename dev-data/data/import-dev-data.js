const fs = require("fs");
/* eslint-disable import/no-extraneous-dependencies */
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Tour = require("../../model/tourModels");
// Load environment variables from config.env file
dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD,
);
// this return a promise ..... and this help us connect to the database either locally or remotely... 1. remotely
mongoose.connect(DB, {}).then(() => {
  console.log("DB connection successful!");
});

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, "utf-8")); // this is used to read the file i.e the data stored in the js file ....

const importData = async () => {
  try {
    await Tour.create(tours); // this is used to create the tours in the database
    console.log("Data successfully loaded!"); // this is used to exit the process after the data has been loaded
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Tour.deleteMany(); // this is used to delete all the data(tours) in the database
    console.log("Data successfully deleted!");
    process.exit(); // this is used to exit the process after the data has been deleted
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
}
