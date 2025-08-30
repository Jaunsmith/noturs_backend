const express = require("express");
const morgan = require("morgan"); // this is a middleware that logs the request to the console

const app = express();
const AppError = require("./utilities/appError");
const globalErrorHandler = require("./controllers/errorController");
const toursRouter = require("./routes/tourRoute");
const usersRouter = require("./routes/userRoute");

// 1. MIDDLEWARE is being handle her
// the middleware is an app that can modify the incoming data

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev")); // this is used to log the request to the console in development mode
}
app.use(express.json()); // this is used to log the request to the console in development mode
app.use(express.static(`${__dirname}/public`)); // this is used to serve  static files from the public folder

// 2. ROUTE HANDLERS this are the route handlers....
app.use((req, res, next) => {
  req.requestTime = new Date().toLocaleString();
  console.log(req.headers);
  next(); // this is used to pass the request
  // the next is used to pass the request
});

//3. ROUTE
// this have to come after the variable has been defined
// this is use to handle the route properly incase any chnages need to occur it will be handle one place and refeclt in all the place that use it ...
app.use("/api/v1/tours", toursRouter);
app.use("/api/v1/users", usersRouter);

// to handle all unknown route...
// always out this at the end after all the route have been defined
app.all(/.*/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 400)); // this is used to pass the error to the global error handling middleware and anything passed to next will be treated as an error
});

// global error handling middleware and by specify 4 parameter it will be treated as error handling middleware
app.use(globalErrorHandler);

module.exports = app; // this is used to export the app so that it can be used in other files
