class AppError extends Error {
  constructor(message, statusCode) {
    super(message); // this is used to call the parent class constructor and pass the message to it
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true; // this is used to distinguish between operational error and programming error

    Error.captureStackTrace(this, this.constructor); // this is used to create a stack trace for the error and it will not be shown in the stack trace
  }
}

module.exports = AppError;
