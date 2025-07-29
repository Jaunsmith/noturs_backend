const express = require("express");
const morgan = require("morgan"); // this is a middleware that logs the request to the console

const app = express();

const toursRouter = require("./routes/tourRoute");
const usersRouter = require("./routes/userRoute");

// 1. MIDDLEWARE is being handle her
// the middleware is an app that can modify the incoming data
app.use(express.json());
app.use(morgan("dev")); // this is used to log the request to the console in development mode

// personla middleware .....

app.use((req, res, next) => {
  console.log("Hello from the middleware 😉");
  next(); // this is used to pass the request
  // the next is used to pass the request
});

// 2. ROUTE HANDLERS this are the route handlers....
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next(); // this is used to pass the request
  // the next is used to pass the request
});

//3. ROUTE
// this have to come after the variable has been defined
// this is use to handle the route properly incase any chnages need to occur it will be handle one place and refeclt in all the place that use it ...
app.use("/api/v1/tours", toursRouter);
app.use("/api/v1/users", usersRouter);

module.exports = app; // this is used to export the app so that it can be used in other files
