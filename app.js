/* eslint-disable import/no-extraneous-dependencies */
const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const hpp = require("hpp");
const path = require("path");

const app = express();

// setting the template(view) engine to pug for this app..
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views")); // this is used to specify the views directory

// 7. STATIC FILES
app.use(express.static(path.join(__dirname, "public")));

// importing all the routes and controllers
const AppError = require("./utilities/appError");
const globalErrorHandler = require("./controllers/errorController");
const toursRouter = require("./routes/tourRoute");
const usersRouter = require("./routes/userRoute");
const reviewRouter = require("./routes/reviewRoute");
const viewRouter = require("./routes/viewRoute");
const sanitization = require("./utilities/sanitization");

// 1. MIDDLEWARE
// 1. SECURITY HEADERS
app.use(helmet());

// 2. LOGGING (only in dev mode)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// 3. RATE LIMITING
const limiter = rateLimit({
  max: 50,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

// 4. BODY PARSER
app.use(express.json({ limit: "10kb" })); // this is used to limit the size of the body to 10kb
app.use(express.urlencoded({ extended: true, limit: "10kb" })); // this is used to parse the data from the form (url encoded data)

// 5. DATA SANITIZATION - CUSTOM IMPLEMENTATION
app.use(sanitization);

// 6. Prevent HTTP Parameter Pollution
app.use(hpp());

// 8. Custom middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toLocaleString();
  // console.log("Request headers:", req.headers);
  next();
});

// 9. ROUTES

app.use("/", viewRouter);
app.use("/api/v1/tours", toursRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/reviews", reviewRouter);

// 10. Handle unknown routes
app.all(/.*/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// 11. Global error handler
app.use(globalErrorHandler);

module.exports = app;
