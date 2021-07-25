const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
require('dotenv').config()
const HttpError = require("../models/http-error");

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError("Invalid inputs passed , please check your data", 422)
    );
  }

  const { name, email, password } = req.body;

  let existingUser;
  try {
    //Check if email exists in database
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500
    );
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      "User exists already, please login instead",
      422
    );
    return next(error);
  }
 
  //encrypt the password
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError(
      "Could not Create User, please try again.",
      500
    );
    return next(error);
  }

  const createdUser = new User({
    name, // name: name
    email,
    password: hashedPassword,
    image:
      "https://img.favpng.com/6/14/19/computer-icons-user-profile-icon-design-png-favpng-vcvaCZNwnpxfkKNYzX3fYz7h2.jpg",
    currencies: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later",
      500
    );
    return next(error);
  }

  //create token
  let token;
  try {
    //expires in 10m
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      process.env.jwtPrivateKey,
      { expiresIn: "10m" }
    );
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later",
      500
    );
    return next(error);
  }

  res
    .status(201)
    .json({ user: createdUser.id, email: createdUser.email, token: token });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    //Check if email exists in database
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500
    );
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      "Could not identify user, credentials wrong",
      403
    );
    return next(error);
  }

  let isValidPassword = false;
  try {
    //Compares the password input with the one in the database
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError(
      "Could not log you in. Please check your credentials and try again",
      500
    );
    return next(error);
  }

  if ((!isValidPassword)) {
    const error = new HttpError(
      "Could not log you in. Please check your credentials and try again",
      403
    );
    return next(error);
  }

  let token;
  try {
    //expires in 10m
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      process.env.jwtPrivateKey,
      { expiresIn: "10m" }
    );
  } catch (err) {
    const error = new HttpError(
      "Logging in failed, please try again later",
      500
    );
    return next(error);
  }

  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    token: token
  });
};

exports.signup = signup;
exports.login = login;
