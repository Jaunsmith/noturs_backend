// eslint-disable-next-line import/no-extraneous-dependencies
const mongoose = require("mongoose");
const dotenv = require("dotenv");

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

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

const app = require("./app");

// 4. SERVERS LISTNER
const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log(`app runing on port  ${port}...`);
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1); // this is used to exit the process with failure code 1
  }); // this server. close make sure all pending processing will end before it close....
});
