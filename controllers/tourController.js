const fs = require("fs");

// always load your data first, that is  read it first outside the event loop (handler) make it avaailbale
// the json.parse is used to convert the json file to a javascript object...
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

// this middleware is used to check the validity of the  id of the tour
exports.checkID = (req, res, next, value) => {
  console.log(`Tour id is: ${value}`);
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: "fail",
      message: "Invalid ID",
    });
  }
  next(); // this is used to pass the request
};

exports.checkBodyData = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: "fail",
      message: "Missing name or price",
    });
  } else {
    next(); // this is used to pass the request
  }
};

exports.getAlltoursData = (req, res) => {
  res.status(200).json({
    status: "sucesss",
    requestedAt: req.requestTime, // this is used to get the time of the request
    results: tours.length,
    data: {
      tours: tours,
    },
  });
};

exports.getTourData = (req, res) => {
  const id = req.params.id * 1; // convert string to number
  const tour = tours.find((el) => el.id === id); // find the tour with the id

  res.status(200).json({
    status: "sucesss",
    data: {
      tour: tour,
    },
  });
};

exports.createNewTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  // the obeject.assign let us merge twp object together.....
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);
  // he writefile is used and not the writefilesync cause we are in event loop and dont want to block the event loop i.e the excution of the code.....
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (error) => {
      res.status(201).json({
        status: "success",
        data: {
          tour: newTour,
        },
      });
    }
  );
};

exports.updateTourData = (req, res) => {
  res
    .status(200)
    .json({ status: "success", data: { tour: "<Updated tour here...>" } });
};

exports.deleteTourData = (req, res) => {
  res.status(204).json({ status: "success", data: null });
};
