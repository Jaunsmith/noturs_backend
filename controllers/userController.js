const User = require("../model/userModel");
const AppError = require("../utilities/appError");
const asyncErrorCatch = require("../utilities/asyncErrorCatch");
const handlerFactory = require("./handlerFactory");

const filterObject = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el]; // we are checking if the allowed fields include the element then we will add  the current fileds at the current element  to the newobj...
  });
  return newObj;
};

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

exports.deleteMyData = asyncErrorCatch(async (req, res, next) => {
  // this is used to set the user inactive not permanent delete of itself just inactibe cause user might want to use the ap again. all what the user need to do is activate the account back...
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: "Sucess",
    data: null,
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id; // this is used to get the id of the currently logged in user and set it to the params id so that we can use the getOne handler factory to get the user data...
  next();
};

exports.getAllUsers = handlerFactory.getAll(User);
exports.getUserData = handlerFactory.getOne(User);

exports.updateUserData = handlerFactory.updateOne(User);

exports.deleteUserData = handlerFactory.deleteOne(User);
