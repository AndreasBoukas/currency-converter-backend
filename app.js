const express = require("express");
const mongoose = require("mongoose");

const currencyRoutes = require("./routes/currency-routes");
const userRoutes = require("./routes/users-routes");
const HttpError = require("./models/http-error");

const app = express();

app.use(express.json()); // instead of body parser

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); //Allows any domain to send requests
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST,  PATCH, DELETE");
  next();
});

app.use("/api/currency", currencyRoutes);
app.use("/api/users", userRoutes);

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route", 404);
  throw error;
});

//Special error handling middleware function
app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500); //500 means Internal Server Error
  res.json({ message: error.message || "An unknown error occured" });
});

mongoose
  .connect(
    URI
  )
  .then(() => {
    app.listen(5000);
  })
  .catch((err) => {
    console.log(err);
  });
