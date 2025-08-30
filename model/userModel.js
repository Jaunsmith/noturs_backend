/* eslint-disable import/no-extraneous-dependencies */
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A user must have a Name, kindly provide it"],
    trim: true,
    maxLength: [50, "A user name must be less than or equal to 50"], // Fixed typo
    minLength: [5, "A user name must not be less than 5 characters"], // Fixed typo
  },
  email: {
    type: String,
    required: [true, "A user must have an email, please kindly provide it"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  photo: {
    type: String,
    default: "default.jpg",
  },
  role: {
    type: String,
    enum: ["user", "tour-guide", "lead-tour-guide", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "A user must have a password, please kindly provide it"],
    minLength: [8, "A user password must be at least 8 characters"], // Fixed typo
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      validator: function (value) {
        return value === this.password;
      },
      message: "Password does not match", // Fixed typo
    },
  },
  passwordResetToken: {
    type: String,
  },
  passwordChangedAt: {
    type: Date,
    default: Date.now(),
  },
  passwordResetExpires: { type: Date },
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = bcrypt.hashSync(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

// Update passwordChangedAt when password is modified (except during creation)
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.correctedPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.updatePassword = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const randomResetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(randomResetToken)
    .digest("hex");

  // console.log({ randomResetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 5 * 60 * 1000;

  return randomResetToken;
};

const User = mongoose.model.User || mongoose.model("User", userSchema);
module.exports = User;
