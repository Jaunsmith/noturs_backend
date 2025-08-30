/* eslint-disable import/no-extraneous-dependencies */
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const crypto = require("crypto");

const User = require("../model/userModel");
const asyncErrorCatch = require("../utilities/asyncErrorCatch");
const AppError = require("../utilities/appError");
const sendEmail = require("../utilities/emailHandler");
const { stat } = require("fs");

const signInToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signUp = asyncErrorCatch(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  const token = signInToken(newUser._id);
  newUser.password = undefined;

  res.status(201).json({
    status: "success",
    token,
    data: {
      user: newUser,
    },
  });
});

exports.signIn = asyncErrorCatch(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please enter your mail and password", 400));
  }
  const user = await User.findOne({ email }).select("+password"); // this is used to select the field (password) which is not selected by default in the user model
  // the user.correxted password is moved to the if block to prevent error if the user is not found

  if (!user || !(await user.correctedPassword(password))) {
    return next(new AppError("Incorrect email or password", 401));
  }
  const token = signInToken(user._id);
  res.status(200).json({
    status: "success",
    token,
    message: "You have successfully signed in",
  });
});

exports.protectRoute = asyncErrorCatch(async (req, res, next) => {
  let token;
  // Making sure that the token is there before we can proceed...
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1]; // this is used to get the token from the header.. the split is used in other to let the string get to be in an array so that we can access the token using the index
  }

  if (!token) {
    return next(
      new AppError(
        "You are not logged in! Please log in to get access to this data",
        401,
      ),
    );
  }

  // verify the token being sent to confirm if it has not been tampered with

  const verification = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET,
  );

  // check if the user still exists
  const currentUser = await User.findById(verification.id);
  if (!currentUser) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist",
        401,
      ),
    );
  }

  // check if the user changed password after the token was issued
  if (await currentUser.updatePassword(verification.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again", 401),
    );
  }

  req.user = currentUser; // this is used to pass the user data to the next middleware
  next();
});

// this is used to restrict the user based on their roles (Authentication...)
// the ...roles is used to get the roles passed in the array which can be any number of data...
exports.restrictedTo = (...roles) =>
  asyncErrorCatch(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403),
      );
    }
    next();
  });

exports.forgetPassword = asyncErrorCatch(async (req, res, next) => {
  if (!req.body) {
    return next(new AppError("Please kindly enter your mail", 404));
  }
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new AppError(`There is no user with this email ${req.body.email}`, 404),
    );
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false }); // this is used to save the user data without validating the other fields

  // send it to the user's email...
  const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/users/resetpassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetUrl}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 3mins)",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "There was an error sending the email. Try again later!",
        500,
      ),
    );
  }
});

exports.resetPassword = asyncErrorCatch(async (req, res, next) => {
  // get the user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }); // this is used to query the database in other to get the specific user with this tokken...

  // reset the password if the token has not expired and there is a user
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  } // this is used to check if the user is not found or the token has expired....

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save(); // we use save here because we want to run the validators and the

  //log the user in, send JWT
  const token = signInToken(user._id);
  res.status(200).json({
    staus: "success",
    token,
  });
});

exports.updatePassword = asyncErrorCatch(async (req, res, next) => {});
