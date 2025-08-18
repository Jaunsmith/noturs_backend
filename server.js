// eslint-disable-next-line import/no-extraneous-dependencies
const mongoose = require("mongoose");
const dotenv = require("dotenv");
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
app.listen(port, () => {
  console.log(`app runing on port  ${port}...`);
});
