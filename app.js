/* eslint-disable import/no-extraneous-dependencies */
const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const hpp = require("hpp");

const app = express();
const AppError = require("./utilities/appError");
const globalErrorHandler = require("./controllers/errorController");
const toursRouter = require("./routes/tourRoute");
const usersRouter = require("./routes/userRoute");
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
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// 5. DATA SANITIZATION - CUSTOM IMPLEMENTATION
app.use(sanitization);

// 6. Prevent HTTP Parameter Pollution
app.use(hpp());

// 7. STATIC FILES
app.use(express.static(`${__dirname}/public`));

// 8. Custom middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toLocaleString();
  console.log("Request headers:", req.headers);
  next();
});

// 9. ROUTES
app.use("/api/v1/tours", toursRouter);
app.use("/api/v1/users", usersRouter);

// 10. Handle unknown routes
app.all(/.*/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// 11. Global error handler
app.use(globalErrorHandler);

module.exports = app;
