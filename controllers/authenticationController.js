/* eslint-disable import/no-extraneous-dependencies */
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const crypto = require("crypto");

const User = require("../model/userModel");
const asyncErrorCatch = require("../utilities/asyncErrorCatch");
const AppError = require("../utilities/appError");
const sendEmail = require("../utilities/emailHandler");

const signInToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const sendUserToken = (user, statusCode, res, message = "") => {
  const token = signInToken(user._id);

  const cookiesOption = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIES_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ), // this convert the time to milliseconds
    httpOnly: true, // this prevent the cookies to be modified by the browser
  };

  if (process.env.NODE_ENV === "production") cookiesOption.secure = true; // this make the cooking to send in a secure connection
  res.cookie("jwt", token, cookiesOption);

  res.status(statusCode).json({
    status: "sucesss",
    token,
    data: { user },
    message,
  });
};

exports.signUp = asyncErrorCatch(async (req, res, next) => {
  console.log(
    `the email enter is ${req.body.email} and the passsword enter is ${req.body.password}`,
  );
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  console.log(
    `the email enter is ${newUser.$gtemail} and the passsword enter is ${newUser.password}`,
  );

  newUser.password = undefined;
  newUser.active = undefined;
  newUser.passwordChangedAt = undefined;
  sendUserToken(newUser, 201, res);
});

exports.signIn = asyncErrorCatch(async (req, res, next) => {
  const { email, password } = req.body;
  console.log(
    `the email enter is ${email} and the passsword enter is ${password}`,
  );

  if (!email || !password) {
    return next(new AppError("Please enter your mail and password", 400));
  }
  const user = await User.findOne({ email }).select("+password"); // this is used to select the field (password) which is not selected by default in the user model
  // the user.correxted password is moved to the if block to prevent error if the user is not found

  if (!user || !(await user.correctedPassword(password))) {
    return next(new AppError("Incorrect email or password", 401));
  }
  user.password = undefined;
  user.passwordChangedAt = undefined;
  sendUserToken(
    user,
    200,
    res,
    "You have successfully signin to  your account",
  );
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
    sendUserToken(user, 200, res, "Token sent to email!");
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
  sendUserToken(user, 200, res);
});

exports.updatePassword = asyncErrorCatch(async (req, res, next) => {
  // getting the user from the password collection...
  const user = await User.findById(req.user.id).select("+password"); // we use select here because the password is not selected by default in the user model...

  // check if the posted current password is correct
  if (!(await user.correctedPassword(req.body.currentPassword))) {
    return next(new AppError("Your current password is wrong", 401));
  }
  // maiking sure the new password and confirm password are there
  if (!req.body.password || !req.body.passwordConfirm) {
    return next(
      new AppError("Please enter your new password and confirm it", 400),
    );
  }

  // making sure the new password is not the same as the previous password
  if (await user.correctedPassword(req.body.password)) {
    return next(
      new AppError(
        "Your new password must be different from the previous password",
        400,
      ),
    );
  }
  // if so, update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save(); // we use save here because we want to run the validators and the pre save middlewares...
  sendUserToken(user, 200, res, "You have successfully updated your password");
});
