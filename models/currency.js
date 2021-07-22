const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const currencySchema = new Schema({
    title: { type: String, required: true },
    image: { type: String, required: true },
    exchangeRate: { type: Number, required: true },
    creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" }
})

//Currency is the collection name but it will be lower case and pluralised
module.exports = mongoose.model("Currency", currencySchema);