const User = require("../model/userModel");
const AppError = require("../utilities/appError");
const asyncErrorCatch = require("../utilities/asyncErrorCatch");

const filterObject = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el]; // we are checking if the allowed fields include the element then we will add  the current fileds at the current element  to the newobj...
  });
  return newObj;
};

exports.getAllUsersData = asyncErrorCatch(async (req, res) => {
  const getUsers = await User.find();
  res.status(200).json({
    status: "sucesss",
    length: getUsers.length,
    data: { users: getUsers },
  });
});

exports.updateMyData = asyncErrorCatch(async (req, res, next) => {
  // This check for an empty body data...
  if (!req.body) {
    return next(new AppError("Please provide data to update", 400));
  }

  // first block user from updating password with this route
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError("This route is not for password update", 400));
  }
  // second we will filter the unwanted fields that are not allowed to be updated
  const filtereduserData = filterObject(req.body, "name", "email");

  // checking if data sent is already same data in the database ...

  if (
    req.user.checkUpdatedData(filtereduserData.email, filtereduserData.name)
  ) {
    return next(new AppError("Please provide different data to update", 400));
  }

  // we will update the user document
  const updateUserData = await User.findByIdAndUpdate(
    req.user.id,
    filtereduserData,
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).json({
    status: "success",
    data: {
      user: updateUserData,
    },
  });
});

exports.createNewUser = (req, res) => {
  res.status(500).json({
    status: "error create new user ",
    message: "This route is not yet defined!",
  });
};

exports.getUserData = (req, res) => {
  res.status(500).json({
    status: "error get User data",
    message: "This route is not yet defined!",
  });
};

exports.updateUserData = (req, res) => {
  res.status(500).json({
    status: "error uodate user data ",
    message: "This route is not yet defined!",
  });
};

exports.deleteUserData = (req, res) => {
  res.status(500).json({
    status: "error delete user data",
    message: "This route is not yet defined!",
  });
};
