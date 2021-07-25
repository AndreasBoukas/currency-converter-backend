const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const Currency = require("../models/currency");
const User = require("../models/user");


const getCurrencyById = async (req, res, next) => {
  const currencyId = req.params.cid;

  let currency;
  try {
    currency = await Currency.findById(currencyId); //doesnt return promice but .exec() after findById can return promise
    console.log(currency);
  } catch (err) {
    const error = new HttpError(
      "Fetching currency failed, please try again later",
      500
    );
    return next(error);
  }

  if (!currency) {
    const error = new HttpError(
      "Could not find a currency for the provided id.",
      404
    );
    return next(error);
  }

  res.json({ selectedCurrency: currency.toObject({ getters: true }) });
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
  //The site does not support image upload at this time so the image is a generis coin

  const createdCurrency = new Currency({
    title, // title: title
    image:
      "https://www.pngitem.com/pimgs/m/137-1378758_gold-coin-png-circle-transparent-png.png",
    exchangeRate,
    creator: req.userData.userId,
  });

  //Saves who created the user.
  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    const error = new HttpError(
      "Creating Currency failed,please try again",
      500
    );
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
  const { title, exchangeRate } = req.body;
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

  //Enable if you want currencies to be edited by only the user who created them
  // if (currency.creator.toString() != req.userData.userId) {
  //   const error = new HttpError(
  //     "You are not allowed to edit this currency.",
  //     401
  //   );
  //   return next(error);
  // }

  currency.title = title;
  // currency.image = image;
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

const deleteCurrency = async (req, res, next) => {
  const currencyId = req.params.cid;
  let currency;
  try {
    currency = await Currency.findById(currencyId).populate("creator");
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete currency",
      500
    );
    return next(error);
  }

  if (!currency) {
    const error = new HttpError("Could not find currency for this id", 404);
    return next(error);
  }

  //Enable if you want currencies to be deleted by only the user who created them
  // if (currency.creator.id !== req.userData.userId) {
  //   const error = new HttpError(
  //     'You are not allowed to delete this currency.',
  //     401
  //   );
  //   return next(error);
  // }

  //When deleting a currency also remove it from the currencies array from the user who created them
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await currency.remove({ session: sess });
    currency.creator.currencies.pull(currency);
    await currency.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete currency",
      500
    );
    return next(error);
  }

  res.status(200).json({ message: "Deleted currency." });
};

exports.getCurrencies = getCurrencies;
exports.getCurrencyById = getCurrencyById;
exports.postNewCurrency = postNewCurrency;
exports.updateCurrency = updateCurrency;
exports.deleteCurrency = deleteCurrency;
