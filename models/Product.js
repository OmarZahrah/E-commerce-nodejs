const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const util = require("util");
const jwt = require("jsonwebtoken");
const secretKey = "fsas";
const AsyncSign = util.promisify(jwt.sign);

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
});

module.exports = mongoose.model("Product", productSchema);
