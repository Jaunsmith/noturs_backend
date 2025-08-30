module.exports = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};
// This utility function takes an asynchronous function (fn) as an argument and returns a new function that wraps the original function in a try-catch block. If the original function throws an error, it is caught and passed to the next middleware in the Express.js request-response cycle. This is useful for handling errors in asynchronous route handlers without having to write repetitive try-catch blocks
