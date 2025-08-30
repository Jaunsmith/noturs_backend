const AppError = require("../utilities/appError");

const castErrorDb = (err) => {
  const msg = `invalid ${err.path} : ${err.value}.`;
  return new AppError(msg, 400);
};

const validatorCatchErrorDb = (err) => {
  const msg = `Invalid input data. ${err.message}`;
  return new AppError(msg, 400);
};

const duplicateFieldDb = (err) => {
  const msg = `Duplicate field value: ${err.keyValue.name}. Please use another value!`;
  return new AppError(msg, 400);
};

const erroDevMessage = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const erroProdMessage = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error("Error 💥", err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong!",
    });
  }
};

console.log("Environment:", process.env.NODE_ENV);

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    erroDevMessage(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = Object.create(err); // Use Object.create instead of spread operator

    // Copy all enumerable properties from the original error
    error = Object.assign(error, err);

    // Make sure to preserve the name property
    error.name = err.name;
    error.message = err.message;
    error.code = err.code;
    console.log("Error Name:", error.code);

    if (error.name === "CastError") {
      error = castErrorDb(error);
    }

    if (error.name === "ValidationError") {
      error = validatorCatchErrorDb(error);
    }

    if (error.code === 11000) {
      error = duplicateFieldDb(error);
    }

    if (error.name === "JsonWebTokenError") {
      error = new AppError("Invalid token. Please log in again!!!", 401);
    }
    if (error.name === "TokenExpiredError") {
      error = new AppError("Your token has expired! Please log in again.", 401);
    }
    erroProdMessage(error, res);
  }
};
