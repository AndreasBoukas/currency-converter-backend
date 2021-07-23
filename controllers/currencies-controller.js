const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const Currency = require("../models/currency");
const User = require("../models/user");

const getCurrencyConvert = async (req, res, next) => {
  const firstCurrencyId = req.params.c1id;
  const secondCurrencyId = req.params.c2id;
  const amount = req.body.amount;
  let currency1;
  let currency2;
  try {
    currency1 = await Currency.findById(firstCurrencyId);
    currency2 = await Currency.findById(secondCurrencyId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not convert currencies",
      500
    );
    return next(error);
  }
  const result = amount * (currency1.exchangeRate / currency2.exchangeRate);
  // Round result to 4 decimal places.
  const convertedCurrency =
    Math.round((result + Number.EPSILON) * 10000) / 10000;

  res.json({
    Convert:
      amount +
      " " +
      currency1.title +
      " is " +
      convertedCurrency +
      " " +
      currency2.title,
  });
};

const getCurrencies = async (req, res, next) => {
  let currencies;
  try {
    currencies = await Currency.find();
  } catch (err) {
    const error = new HttpError(
      "Fetching users failed, please try again later.",
      500
    );
    return next(error);
  }
  res.json({ currencies: currencies });
};

const postNewCurrency = async (req, res, next) => {
  // Check if all inputs are correct
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError("Invalid inputs passed , please check your data", 422)
    );
  }

  const { title, image, exchangeRate, creator } = req.body;

  const createdCurrency = new Currency({
    title, // title: title
    image:
      "https://www.pngitem.com/pimgs/m/137-1378758_gold-coin-png-circle-transparent-png.png",
    exchangeRate,
    creator,
  });

  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    const error = new HttpError("Creating Currency failed,please try again", 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Could not find user for provided id", 404);
    return next(error);
  }

  console.log(user);

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdCurrency.save({ session: sess });
    user.currencies.push(createdCurrency);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Creating Currency failed, please try again",
      500
    );
    return next(error);
  }
  //status code 201  success in creating new resource
  res.status(201).json({ currency: createdCurrency });
};

const updateCurrency = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError("Invalid inputs passed , please check your data", 422)
    );
  }
  const { title, image, exchangeRate } = req.body;
  const currencyId = req.params.cid;
  let currency;
  try {
    currency = await Currency.findById(currencyId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update currency",
      500
    );
    return next(error);
  }
  currency.title = title;
  currency.image = image;
  currency.exchangeRate = exchangeRate;
  try {
    await currency.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update currency",
      500
    );
    return next(error);
  }
  res.status(200).json({ currency: currency });
};

exports.getCurrencyConvert = getCurrencyConvert;
exports.getCurrencies = getCurrencies;
exports.postNewCurrency = postNewCurrency;
exports.updateCurrency = updateCurrency;
