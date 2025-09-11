/* eslint-disable no-restricted-syntax */
class APIFeatures {
  constructor(query, queryString) {
    this.query = query; // Mongoose query object
    this.queryString = queryString; // Original request query parameters
  }
  // eslint-disable-next-line lines-between-class-members

  filter() {
    // 1) Create a hard copy of the query object
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    const queryObj = { ...this.queryString };
    const finalQueryObj = {};

    // 2) Remove special fields
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 3) Process each query parameter
    for (const key in queryObj) {
      // Handle operator queries (duration[gte]=5)
      if (key.includes("[") && key.includes("]")) {
        const field = key.split("[")[0];
        const operator = key.split("]")[0].split("[")[1];
        const value = Number(queryObj[key]);

        if (!finalQueryObj[field]) {
          finalQueryObj[field] = {};
        }
        finalQueryObj[field][`$${operator}`] = value;
      }
      // Handle normal equality queries (price=397)
      else {
        const value = queryObj[key];
        // eslint-disable-next-line no-restricted-globals
        finalQueryObj[key] = isNaN(value) ? value : Number(value);
      }
    }

    this.query = this.query.find(finalQueryObj);
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      let sortParam = this.queryString.sort;
      // If sort is an array (e.g. ['price', 'duration']), join into one string
      if (Array.isArray(sortParam)) {
        sortParam = sortParam.join(",");
      }

      // Now safely split into fields and join with space for Mongoose
      const sortBy = sortParam.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      // Default: sort by createdAt in descending order
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  limitFields() {
    // 2) Limit the fields returned based on the 'fields' query parameter
    if (this.queryString.fields) {
      const filterBY = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(filterBY);
    } else {
      this.query = this.query.select("-__v"); // Default excluding __v field
    }
    return this;
  }

  pagenation() {
    // 3) Handle pagination based on 'page' and 'limit' query parameters
    const page = this.queryString.page * 1 || 1; // Convert to number or default to 1
    const limit = this.queryString.limit * 1 || 100; // Convert to number or default to 100
    const skip = (page - 1) * limit; // Calculate the number of documents to skip
    this.query = this.query.skip(skip).limit(limit); // Skip the number of documents and limit the number of documents returned

    // Check for invalid page numbers
    // if (this.queryString.page) {
    //   const numTours = Tour.countDocuments();
    //   if (skip >= numTours) {
    //     throw new Error("This page does not exist");
    //   }
    // }
    return this;
  }
}

module.exports = APIFeatures;
