class HttpError extends Error {
  constructor(message, errorCode) {
    //super calls the constructor of the base class
    super(message); // Add a "message" property
    this.code = errorCode;
  }
}

module.exports = HttpError;
