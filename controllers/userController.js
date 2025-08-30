const User = require("../model/userModel");
const asyncErrorCatch = require("../utilities/asyncErrorCatch");

exports.getAllUsersData = asyncErrorCatch(async (req, res) => {
  const getUsers = await User.find();
  res.status(200).json({
    status: "sucesss",
    length: getUsers.length,
    data: { users: getUsers },
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
