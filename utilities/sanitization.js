const AppError = require("./appError");

module.exports = (req, res, next) => {
  const dangerousMongoOperators = [
    "$gt",
    "$gte",
    "$lt",
    "$lte",
    "$ne",
    "$in",
    "$nin",
    "$or",
    "$and",
    "$not",
    "$nor",
    "$exists",
    "$type",
    "$mod",
    "$regex",
    "$text",
    "$where",
    "$all",
    "$elemMatch",
    "$size",
    "$expr",
    "$jsonSchema",
    "$",
    "$meta",
    "$slice",
    "$comment",
    "$natural",
    "$max",
    "$min",
  ];

  // Function to detect and block MongoDB operator objects
  const blockMongoDBOperators = (obj, path = "") => {
    if (obj && typeof obj === "object" && !Array.isArray(obj)) {
      Object.keys(obj).forEach((key) => {
        const currentPath = path ? `${path}.${key}` : key;

        // Check if key is a MongoDB operator (starts with $ or exact match)
        if (key.startsWith("$") || dangerousMongoOperators.includes(key)) {
          throw new AppError(`Invalid mail address: ${currentPath}`, 400);
        }

        // Recursively check nested objects
        if (
          typeof obj[key] === "object" &&
          obj[key] !== null &&
          !Array.isArray(obj[key])
        ) {
          blockMongoDBOperators(obj[key], currentPath);
        }

        // Check array elements if they contain objects
        if (Array.isArray(obj[key])) {
          obj[key].forEach((item, index) => {
            if (typeof item === "object" && item !== null) {
              blockMongoDBOperators(item, `${currentPath}[${index}]`);
            }
          });
        }
      });
    }
  };

  // Function to sanitize strings and remove $ and . characters
  const sanitizeStrings = (obj) => {
    if (obj && typeof obj === "object") {
      Object.keys(obj).forEach((key) => {
        if (typeof obj[key] === "string") {
          obj[key] = obj[key].replace(/\$/g, "");
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
          sanitizeStrings(obj[key]);
        }
      });
    }
  };

  try {
    // Check all request data sources
    ["body", "query", "params"].forEach((prop) => {
      if (req[prop]) {
        blockMongoDBOperators(req[prop]);
        sanitizeStrings(req[prop]);
      }
    });

    next();
  } catch (error) {
    next(error);
  }
};
