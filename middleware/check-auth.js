const jwt = require("jsonwebtoken");
const HttpError = require("../models/http-error");
require("dotenv").config();

module.exports = (req, res, next) => {
    if (req.method === "OPTIONS") {
        return next();
    }
  try {
    //split is used because the authorization in the header is in the form of Authorization: 'Bearer TOKEN'
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      throw new Error("Authentication failed");
    }
    const decodedToken = jwt.verify(token, process.env.jwtPrivateKey);
    req.userData = {userId: decodedToken.userId};
    next();
  } catch (err) {
    const error = new HttpError("Authentication failed", 403);
    return next(error);
  }
};
