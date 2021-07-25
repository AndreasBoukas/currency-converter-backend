const express = require("express");
const { check } = require("express-validator");

const currenciesController = require("../controllers/currencies-controller");
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.get("/update/:cid", currenciesController.getCurrencyById); //Retrieve Currency by Id

router.get("/list", currenciesController.getCurrencies); //Retrieve List of all currencies

router.use(checkAuth); // Routes after this middleware require a logged in user

router.post(
  "/",
  [check("title").not().isEmpty(), check("exchangeRate").not().isEmpty()],
  currenciesController.postNewCurrency
); //Create new currency

router.patch(
  "/update/:cid",
  [check("title").not().isEmpty(), check("exchangeRate").not().isEmpty()],
  currenciesController.updateCurrency
); //Update Currency

router.delete("/delete/:cid",currenciesController.deleteCurrency); //Delete Currency

module.exports = router;
