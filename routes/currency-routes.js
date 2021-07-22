const express = require("express");
const { check } = require("express-validator");

const currenciesController = require("../controllers/currencies-controller");

const router = express.Router();

router.get("/convert/:c1id/:c2id", currenciesController.getCurrencyConvert); //Retrieve Conversion Result

router.get("/list", currenciesController.getCurrencies); //Retrieve List of all currencies

router.post(
  "/",
  [check("title").not().isEmpty(), check("exchangeRate").not().isEmpty()],
  currenciesController.postNewCurrency
); //Create new currency

router.patch(
  "/:cid",
  [check("title").not().isEmpty(), check("exchangeRate").not().isEmpty()],
  currenciesController.updateCurrency
); //Update Currency

// router.delete("/cid"); //Delete Currency

module.exports = router;
